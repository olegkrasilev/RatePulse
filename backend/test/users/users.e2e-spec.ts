import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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

    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

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
        password: 'strongpassword123',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'Oleg',
        email: 'oleg@test.com',
      }),
    );

    expect(response.body.createdAt).toBeDefined();
    expect(response.body.password_hash).toBeUndefined();
    expect(response.body.password).toBeUndefined();
  });

  it('POST /api/users should return 409 if email already exists', async () => {
    const payload = {
      name: 'Oleg',
      email: 'oleg@test.com',
      password: 'strongpassword123',
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
      }),
    );
  });

  it('POST /api/users should return 400 for invalid email', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({ name: 'Oleg', email: 'not-an-email', password: 'password123' })
      .expect(400);
  });

  it('should return 400 if name is missing', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({ email: 'only-email@test.com', password: 'password123' })
      .expect(400);
  });

  it('should return 400 if extra fields are provided (whitelist check)', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        email: 'oleg@test.com',
        password: 'password123',
        hackerField: 'steal-data',
      })
      .expect(400);
  });

  it('should persist user in the database after successful creation', async () => {
    const payload = {
      name: 'Database Test',
      email: 'db@test.com',
      password: 'password123',
    };

    await request(app.getHttpServer())
      .post('/api/users')
      .send(payload)
      .expect(201);

    const userInDb = await usersRepository.findOneBy({ email: payload.email });
    expect(userInDb).toBeDefined();
    expect(userInDb?.name).toBe(payload.name);
    expect(userInDb?.password_hash).not.toBe('password123');
  });

  it('POST /api/users should normalize name and email (trim and lowercase)', async () => {
    const payload = {
      name: '   Oleg   ',
      email: '  OLEG@test.com  ',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(payload)
      .expect(201);

    expect(response.body.name).toBe('Oleg');
    expect(response.body.email).toBe('oleg@test.com');
  });

  it('should fail if password is too short', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        email: 'short-pass@test.com',
        password: '123',
      })
      .expect(400);
  });

  it('should actually hash the password in the database', async () => {
    const rawPassword = 'strongpassword123';
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        email: 'hashing@test.com',
        password: rawPassword,
      })
      .expect(201);

    const userInDb = await usersRepository.findOneBy({
      email: 'hashing@test.com',
    });

    expect(userInDb?.password_hash).not.toBe(rawPassword);
    expect(userInDb?.password_hash.length).toBeGreaterThan(20);
  });

  it('should fail if name is only 1 character (min length check)', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'O',
        email: 'short-name@test.com',
        password: 'password123',
      })
      .expect(400);
  });

  it('should fail if name is an empty string', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: '',
        email: 'empty-name@test.com',
        password: 'password123',
      })
      .expect(400);
  });

  it('should fail if email is missing', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        password: 'password123',
      })
      .expect(400);
  });

  it('should keep spaces in password (should not trim password)', async () => {
    const rawPassword = '  password with spaces  ';
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        email: 'pass-spaces@test.com',
        password: rawPassword,
      })
      .expect(201);

    const userInDb = await usersRepository.findOneBy({
      email: 'pass-spaces@test.com',
    });

    expect(userInDb?.password_hash).toBeDefined();
    expect(userInDb?.password_hash).not.toBe(rawPassword);
  });

  it('should ignore or fail on id/createdAt injection', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        id: 999,
        name: 'Hacker',
        email: 'hacker@test.com',
        password: 'password123',
        createdAt: new Date(),
      })
      .expect(400);
  });

  it('should fail if name is 1 character (below min 2)', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'A',
        email: 'min-name@test.com',
        password: 'password123',
      })
      .expect(400);
  });

  it('should pass if name is 50 characters (exactly max)', async () => {
    const longName = 'A'.repeat(50);
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: longName,
        email: 'max-name@test.com',
        password: 'password123',
      })
      .expect(201);
  });

  it('should fail if name is 51 characters (above max 50)', async () => {
    const tooLongName = 'A'.repeat(51);
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: tooLongName,
        email: 'too-long-name@test.com',
        password: 'password123',
      })
      .expect(400);
  });
  it('should fail if password is 7 characters (below min 8)', async () => {
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        email: 'short-pass@test.com',
        password: '1234567',
      })
      .expect(400);
  });

  it('should pass if password is 128 characters (exactly max)', async () => {
    const maxPass = 'P'.repeat(128);
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        email: 'max-pass@test.com',
        password: maxPass,
      })
      .expect(201);
  });

  it('should fail if password is 129 characters (above max 128)', async () => {
    const tooLongPass = 'P'.repeat(129);
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        email: 'too-long-pass@test.com',
        password: tooLongPass,
      })
      .expect(400);
  });

  it('should fail if email is longer than 255 characters', async () => {
    const longEmail = 'a'.repeat(250) + '@test.com';
    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Oleg',
        email: longEmail,
        password: 'password123',
      })
      .expect(400);
  });
});
