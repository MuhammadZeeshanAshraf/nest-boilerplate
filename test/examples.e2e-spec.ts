import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Example } from '../src/examples/entities/example.entity';

describe('Examples (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE examples RESTART IDENTITY CASCADE');
  });

  describe('POST /examples', () => {
    it('creates an example and wraps the response in the success envelope', async () => {
      const res = await request(app.getHttpServer())
        .post('/examples')
        .send({ name: 'Alpha', description: 'first', isActive: true })
        .expect(200);

      expect(res.body).toMatchObject({
        status: true,
        message: 'Success',
        code: 200,
        error: null,
      });
      expect(res.body.data.id).toMatch(/^[0-9a-f-]{36}$/i);
      expect(res.body.data.name).toBe('Alpha');
      expect(res.body.data.isActive).toBe(true);
    });

    it('rejects invalid payloads via the global ValidationPipe', async () => {
      const res = await request(app.getHttpServer())
        .post('/examples')
        .send({ name: '' })
        .expect(400);

      expect(res.body.status).toBe(false);
    });
  });

  describe('GET /examples', () => {
    it('paginates results', async () => {
      const repo = dataSource.getRepository(Example);
      await repo.save([
        repo.create({ name: 'one' }),
        repo.create({ name: 'two' }),
        repo.create({ name: 'three' }),
      ]);

      const res = await request(app.getHttpServer())
        .get('/examples?page=1&take=2')
        .expect(200);

      expect(res.body.data.data).toHaveLength(2);
      expect(res.body.data.totalCount).toBe(3);
      expect(res.body.data.totalPages).toBe(2);
    });

    it('filters by case-insensitive name search', async () => {
      const repo = dataSource.getRepository(Example);
      await repo.save([
        repo.create({ name: 'apple' }),
        repo.create({ name: 'banana' }),
      ]);

      const res = await request(app.getHttpServer())
        .get('/examples?search=APP')
        .expect(200);

      expect(res.body.data.data).toHaveLength(1);
      expect(res.body.data.data[0].name).toBe('apple');
    });
  });

  describe('GET /examples/:id', () => {
    it('returns the example', async () => {
      const created = await request(app.getHttpServer())
        .post('/examples')
        .send({ name: 'Single' });

      const res = await request(app.getHttpServer())
        .get(`/examples/${created.body.data.id}`)
        .expect(200);

      expect(res.body.data.name).toBe('Single');
    });

    it('returns 404 for unknown ids', async () => {
      const fakeId = '11111111-1111-1111-1111-111111111111';
      await request(app.getHttpServer())
        .get(`/examples/${fakeId}`)
        .expect(404);
    });

    it('returns 400 for malformed ids (ParseUUIDPipe)', async () => {
      await request(app.getHttpServer())
        .get('/examples/not-a-uuid')
        .expect(400);
    });
  });

  describe('PATCH /examples/:id', () => {
    it('updates only provided fields', async () => {
      const created = await request(app.getHttpServer())
        .post('/examples')
        .send({ name: 'Old', description: 'original' });

      const res = await request(app.getHttpServer())
        .patch(`/examples/${created.body.data.id}`)
        .send({ name: 'New' })
        .expect(200);

      expect(res.body.data.name).toBe('New');
      expect(res.body.data.description).toBe('original');
    });
  });

  describe('DELETE /examples/:id', () => {
    it('removes the example', async () => {
      const created = await request(app.getHttpServer())
        .post('/examples')
        .send({ name: 'Doomed' });

      const removed = await request(app.getHttpServer())
        .delete(`/examples/${created.body.data.id}`)
        .expect(200);

      expect(removed.body.data).toEqual({ deleted: true });

      await request(app.getHttpServer())
        .get(`/examples/${created.body.data.id}`)
        .expect(404);
    });

    it('returns 404 when deleting a missing example', async () => {
      const fakeId = '11111111-1111-1111-1111-111111111111';
      await request(app.getHttpServer())
        .delete(`/examples/${fakeId}`)
        .expect(404);
    });
  });
});
