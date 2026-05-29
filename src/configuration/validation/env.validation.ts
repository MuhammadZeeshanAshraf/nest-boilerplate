import * as Joi from 'joi';
import { THROTTLE } from '../../common/constants';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().port().required(),
  THROTTLE_TTL: Joi.number()
    .min(THROTTLE.TTL.MIN)
    .max(THROTTLE.TTL.MAX)
    .required(),
  THROTTLE_LIMIT: Joi.number()
    .min(THROTTLE.LIMIT.MIN)
    .max(THROTTLE.LIMIT.MAX)
    .required(),
});
