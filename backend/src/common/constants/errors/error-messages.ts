export const ERROR_MESSAGES = {
  USER_ALREADY_EXISTS: (email: string) =>
    `User with email "${email}" already exists`,
} as const;
