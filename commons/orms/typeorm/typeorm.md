# TypeORM Integration Guide

This module provides a robust, standardized infrastructure for database operations using TypeORM and PostgreSQL. It includes base repositories, transaction management, a builder pattern for query options, and a complete seeding system.

## 1. Core Structure

### [Database Config]
- **`DatabaseModule`**: Implements `TypeOrmOptionsFactory` to generate dynamic connection options.
- **Environment Aware**: Automatically configures SSL and connection pool limits (min: 2, max: 10) based on the environment.
- **Entities**: Entities are automatically loaded via `autoLoadEntities: true`.

### [Base Repository]
An abstract class that should be extended by all your domain-specific repositories. It provides a massive suite of helper methods:
- **Standard CRUD**: `create`, `findOne`, `findMany`, `update`, `delete`, `restore`.
- **High Performance Bulk Update**: `bulkUpdate()` uses raw SQL `CASE` statements to update multiple rows with different values in a single database round-trip.
- **Pagination**: `findWithPagination()` integrates with `PaginationDto` to return a `PagedList<T>` containing data and metadata (total count, page, etc.).
- **Smart Validation**: `normalizeNulls()` automatically converts `null` in where clauses to TypeORM's `IsNull()` operator, preventing common runtime query errors.

## 2. Advanced Patterns

### [Query Builder Pattern]
The `FindOptionsBuilder` provides a fluent API for building `FindOptions`:
```typescript
const options = new FindOptionsBuilder<User>()
  .select({ id: true, email: true })
  .where({ isActive: true })
  .relations({ profile: true })
  .build();

return this.userRepository.findManyWithBuilderOption(options);
```

### [Transaction Management]
The `TransactionRunner` ensures reliable transaction handling:
```typescript
const runner = new TransactionRunner(queryRunner);
await runner.start();
try {
  await this.repo.createWithTransaction(data, Entity, runner.manager);
  await runner.commitTransaction();
} catch (err) {
  await runner.rollbackTransaction();
} finally {
  await runner.release();
}
```

## 3. Seeding System

Located in `database/seeders/`, this system handles initial data population:
- **Class-Based Seeds**: Create new seeds in `seeds/` implementing a `seed()` method.
- **API Management**: Use `SeedController` to trigger seeds manually or check status.
- **Startup Sync**: `SeederModule` can automatically run seeds marked as mandatory in the database on application startup.

## 4. Error Handling

All TypeORM queries are intercepted by the `TypeORMErrorInterceptor` (see `interceptors.md`), which translates database-level errors (Postgres codes) into clean NestJS `HttpExceptions`.
