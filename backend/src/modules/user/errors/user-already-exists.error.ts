import { ERROR_CODES } from '../../../common/constants/constants/errors';

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`User with email "${email}" already exists`);
    this.name = ERROR_CODES.USER_ALREADY_EXISTS;
  }
}
