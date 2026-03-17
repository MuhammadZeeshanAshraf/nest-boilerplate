export const SYSTEM_ERROR_MESSAGES = {
  NODE_ENV:
    "NODE_ENV is required and must be one of 'dev', 'qa', 'uat', 'prod'.",
  REQUIRED_AND_MUST_BE_A_NUMBER: (envVar: string) =>
    `${envVar} is required and must be a number.`,
  REQUIRED_AND_MUST_BE_A_STRING: (envVar: string) =>
    `${envVar} is required and must be a string.`,
};

export const APP_ERROR_MESSAGES = {
  ALREADY_EXISTS: (entity: string, property?: string) =>
    `${entity} ${property ? `with ${property} ` : ''}already exists.`,
  ALREADY_COMPLETED: (entity: string, property?: string) =>
    `${entity} ${property ? `with ${property} ` : ''}already completed.`,
  ALREADY_EXISTS_WITH_DELETED: (entity: string) =>
    `${entity} already exists but has been marked as deleted.`,
  NOT_FOUND: (entity: string) => `${entity} was not found.`,
  ALREADY_DELETED: (entity: string) => `${entity} has already been deleted.`,
  ALREADY_IN_ACTIVE: (entity: string) => `${entity} is already inactive.`,
  ALREADY_ACTIVE: (entity: string) => `${entity} is already active.`,
  FAILED_OPERATION: (operation: string) =>
    `Unable to ${operation}. Please try again.`,
  INTERNAL_SERVER_ERROR:
    'An unexpected error occurred. Please try again later.',
  UNAUTHORIZED: `You are not authorized to access this information.`,
  REQUIRED: (entity: string) =>
    `${entity} is required to complete this action.`,
  NOT_ALLOWED: (entity: string) => `${entity}`,
  NOT_REQUIRED: (entity: string) =>
    `${entity} is not required to complete this action.`,
  UNSUPPORTED: (entity: string) =>
    `${entity} is unsupported at this moment. Please try again later or contact support for more information.`,
  NO_TOKEN_PROVIDED: 'Authorization token is required.',
  MALFORMED_TOKEN: 'Authorization token is malformed.',
  TOKEN_EXPIRED: 'Authorization token has expired.',
  INVALID_TOKEN: 'Authorization token is invalid.',
  API_KEY_IS_MISSING: 'API key is missing.',
  INVALID_API_KEY: 'Invalid API key.',
};
