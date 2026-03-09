import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../../src/modules/user/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    usersRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    await app.init();
    await usersRepository.clear();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/users should create a user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        email: 'oleg@test.com',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: 'Oleg',
        email: 'oleg@test.com',
      }),
    );

    expect(response.body.createdAt).toBeDefined();
  });

  it('POST /api/users should return 409 if email already exists', async () => {
    const payload = {
      name: 'Oleg',
      email: 'oleg@test.com',
    };

    await request(app.getHttpServer())
      .post('/api/users')
      .send(payload)
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(payload)
      .expect(409);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 409,
        message: expect.stringContaining('already exists'),
      }),
    );
  });
});
