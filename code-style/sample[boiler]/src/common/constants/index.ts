export const PROJECT_NAME = '[PROJECT NAME] BACKEND🚀';
export const JWT = 'JWT';
export const X_API_KEY = 'x-api-key';
export const PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;
export const SWAGGER_PATH = '/api-docs';
export const RESPONSE_MESSAGES = {
  INTERNAL_SERVER_ERROR:
    "We're sorry, but our server encountered an unexpected error while processing your request. Please try again later, or contact our support team if the problem persists.",
  UPDATED: 'Successfully updated',
  DELETED: 'Successfully deleted',
  SUCCESSFUL_OPERATION: 'Operation completed successfully.',
  CREATED: 'Successfully created',
  RESTORED: 'Successfully restored',
};

export const DUMMY_DATA = {
  email: 'zeeshan.ashraf@nerospirit.com',
  password: 'Dev@123!',
  name: 'John Doe',
  token: 'eyTokenXXXXX',
  phoneNumber: '+1234567890',
  lang: 'en',
};

export const DOMAIN_ENTITY = {
  DUMMY: 'Dummy',
};

export const DefaultCsvSettings = {
  arbitraryReg: /\(\)/,
  impReg: /\*$/,
  arbitraryReplacementReg: /\(\s*(.*?)\s*\)/,
  arbitraryVal: '()',
  rowStart: 1,
};
