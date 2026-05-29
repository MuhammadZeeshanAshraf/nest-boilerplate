import * as Joi from 'joi';
import { THROTTLE } from '../../common/constants';

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
});
