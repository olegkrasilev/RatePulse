import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PinoLogger } from 'nestjs-pino';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from './user.entity';
import { UserAlreadyExistsError } from './errors/user-already-exists.error';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly logger: PinoLogger,
  ) {}

  async createUser(name: string, email: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn({ email }, 'user creation failed: email already exists');

      throw new UserAlreadyExistsError(email);
    }

    const user = this.usersRepository.create({
      name,
      email,
    });

    try {
      const savedUser = await this.usersRepository.save(user);

      this.logger.info(
        { userId: savedUser.id, email: savedUser.email },
        'user created successfully',
      );

      return savedUser;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).driverError?.code === '23505'
      ) {
        this.logger.warn(
          { email },
          'user creation failed: duplicate email constraint',
        );

        throw new UserAlreadyExistsError(email);
      }

      throw error;
    }
  }
}
