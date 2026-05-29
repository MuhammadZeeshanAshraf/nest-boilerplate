import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { PROJECT_NAME } from '../src/common/constants';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ ignoreEnvFile: true })],
      controllers: [AppController],
      providers: [
        AppService,
        { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET / returns the running status wrapped in the success envelope', async () => {
    const { body } = await request(app.getHttpServer()).get('/').expect(200);

    expect(body).toMatchObject({
      status: true,
      message: 'Success',
      code: 200,
      error: null,
    });
    expect(body.data).toContain(PROJECT_NAME);
    expect(body.data).toMatch(/up and running/i);
  });
});
