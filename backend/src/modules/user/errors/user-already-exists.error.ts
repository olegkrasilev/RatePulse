import { ERROR_MESSAGES } from 'src/common/constants/errors/error-messages';
import { ERROR_CODES } from 'src/common/constants/errors/errors';

export class UserAlreadyExistsError extends Error {
  public readonly code = ERROR_CODES.USER_ALREADY_EXISTS;

  constructor(email: string) {
    super(ERROR_MESSAGES.USER_ALREADY_EXISTS(email));
    this.name = 'UserAlreadyExistsError';
  }
}
