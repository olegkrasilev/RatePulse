import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserAlreadyExistsError } from './errors/user-already-exists.error';
import { PinoLogger } from 'nestjs-pino';

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
      email,
      name,
    });

    return this.usersRepository.save(user);
  }
}
