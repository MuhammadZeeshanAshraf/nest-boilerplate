import * as Joi from 'joi';
import { THROTTLE } from 'src/common/constants';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').required(),
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
