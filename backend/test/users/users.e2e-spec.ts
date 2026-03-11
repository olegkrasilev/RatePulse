import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/modules/user/user.entity';

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

  it('POST /api/users should return 400 for invalid email', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({ name: 'Oleg', email: 'not-an-email' })
      .expect(400);
  });

  it('should return 400 if name is missing', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({ email: 'only-email@test.com' })
      .expect(400);
  });

  it('should return 400 for malformed email', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({ name: 'Oleg', email: 'it-is-not-email' })
      .expect(400);
  });

  it('should return 400 if extra fields are provided (whitelist check)', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        email: 'oleg@test.com',
        hackerField: 'steal-data',
      })
      .expect(400);
  });

  it('should persist user in the database after successful creation', async () => {
    const payload = { name: 'Database Test', email: 'db@test.com' };

    await request(app.getHttpServer())
      .post('/api/users')
      .send(payload)
      .expect(201);

    const userInDb = await usersRepository.findOneBy({ email: payload.email });
    expect(userInDb).toBeDefined();
    expect(userInDb?.name).toBe(payload.name);
  });

  //   it('POST /api/users should normalize name and email (trim and lowercase)', async () => {
  //     const payload = {
  //       name: '   Oleg   ',
  //       email: '  OLEG@test.com  ',
  //     };

  //     const response = await request(app.getHttpServer())
  //       .post('/api/users')
  //       .send(payload)
  //       .expect(201);

  //     expect(response.body.name).toBe('Oleg');
  //     expect(response.body.email).toBe('oleg@test.com');

  //     const userInDb = await usersRepository.findOneBy({
  //       email: 'oleg@test.com',
  //     });
  //     expect(userInDb).toBeDefined();
  //     expect(userInDb?.name).toBe('Oleg');
  //   });
});
