import * as Joi from 'joi';
import { THROTTLE } from '../../common/constants';
import { EMAIL_PROVIDER_LIST } from '../../email/constants/email.constants';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().port().required(),

  LOG_LEVEL: Joi.string()
    .valid('trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent')
    .default('info'),
  CORS_ORIGIN: Joi.string().default('*'),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().port().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SCHEMA: Joi.string().optional(),
  DB_CONNECTION_NAME: Joi.string().optional(),

  THROTTLE_TTL: Joi.number()
    .min(THROTTLE.TTL.MIN)
    .max(THROTTLE.TTL.MAX)
    .required(),
  THROTTLE_LIMIT: Joi.number()
    .min(THROTTLE.LIMIT.MIN)
    .max(THROTTLE.LIMIT.MAX)
    .required(),

  // Email — only required when EmailModule is imported. EMAIL_PROVIDER stays
  // optional so the boilerplate boots without email config; the
  // provider-specific vars below become required when a provider is selected.
  EMAIL_PROVIDER: Joi.string()
    .valid(...EMAIL_PROVIDER_LIST)
    .optional()
    .allow(''),
  EMAIL_FROM: Joi.string()
    .email()
    .when('EMAIL_PROVIDER', {
      is: Joi.string().valid(...EMAIL_PROVIDER_LIST),
      then: Joi.required(),
      otherwise: Joi.optional().allow(''),
    }),
  EMAIL_REPLY_TO: Joi.string().email().optional().allow(''),

  AWS_SES_REGION: Joi.string().when('EMAIL_PROVIDER', {
    is: 'ses',
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
  AWS_SES_ACCESS_KEY_ID: Joi.string().optional().allow(''),
  AWS_SES_SECRET_ACCESS_KEY: Joi.string().optional().allow(''),

  MAILGUN_API_KEY: Joi.string().when('EMAIL_PROVIDER', {
    is: 'mailgun',
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
  MAILGUN_DOMAIN: Joi.string().when('EMAIL_PROVIDER', {
    is: 'mailgun',
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
  MAILGUN_REGION: Joi.string().valid('us', 'eu').default('us'),

  RESEND_API_KEY: Joi.string().when('EMAIL_PROVIDER', {
    is: 'resend',
    then: Joi.required(),
    otherwise: Joi.optional().allow(''),
  }),
});
