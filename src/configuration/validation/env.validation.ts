import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').required(),
    PORT: Joi.number().port().required(),
    THROTTLE_TTL: Joi.number().required(),
    THROTTLE_LIMIT: Joi.number().required(),
});
