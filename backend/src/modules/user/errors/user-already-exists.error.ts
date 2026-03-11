import { ERROR_MESSAGES } from '../../../common/errors/error-messages';
import { ERROR_CODES } from '../../../common/errors/errors';

export class UserAlreadyExistsError extends Error {
  public readonly code = ERROR_CODES.USER_ALREADY_EXISTS;

  constructor(email: string) {
    super(ERROR_MESSAGES.USER_ALREADY_EXISTS(email));
    this.name = 'UserAlreadyExistsError';
  }
}
