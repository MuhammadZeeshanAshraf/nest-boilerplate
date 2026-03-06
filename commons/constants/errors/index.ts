export const SYSTEM_ERROR_MESSAGES = {
  NODE_ENV:
    "NODE_ENV is required and must be one of 'dev', 'qa', 'uat', 'prod'.",
  REQUIRED_AND_MUST_BE_A_NUMBER: (envVar: string) =>
    `${envVar} is required and must be a number.`,
  REQUIRED_AND_MUST_BE_A_STRING: (envVar: string) =>
    `${envVar} is required and must be a string.`,
};

export const APP_ERROR_MESSAGES = {
  USER_NOT_FOUND: "User not found.",
};
