# DTOs Module

Common Data Transfer Objects used across the application to standardize input validation and transformation. All DTOs utilize `class-validator` and `class-transformer`.

## File Breakdown

### [id.dto.ts]
- **`IdDto`**: Validates a single `id` field.
    - **Transformation**: Automatically converts numeric strings to `Number`.
    - **Validation**: Ensures it is a positive integer (min: 1).

### [uuid.dto.ts]
- **`UuidDto`**: Validates a single `uuid` field.
    - **Validation**: Ensures the string is a valid UUID v4.

### [pagination.dto.ts]
- **`PaginationDto`**: Standard parameters for fetching lists.
    - **`page`**: The page number (defaults to 1).
    - **`take`**: The number of records per page (defaults to 10).
    - **Transformation**: Both fields are converted from strings to numbers automatically.

### [date-range.dto.ts]
- **`DateRangeDto`**: For filtering by date intervals.
    - **`fromDate`** & **`toDate`**: Optional fields that are automatically transformed into JavaScript `Date` objects if provided.

## Usage Guide

### In Controllers (Params)
```typescript
@Get(':id')
findOne(@Param() params: IdDto) {
  return this.service.findById(params.id);
}
```

### In Controllers (Query)
```typescript
@Get()
findAll(@Query() query: PaginationDto) {
  return this.service.findPaginated(query);
}
```
