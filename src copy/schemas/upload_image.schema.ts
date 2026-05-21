import Joi from 'joi';

export const validUploadStatuses = ['to_be_reviewed', 'approved', 'rejected', 'labelled'] as const;

const uploadImageLinksSchema = Joi.object({
	self: Joi.string().pattern(/^\/images\/[A-Za-z0-9_-]+$/).required(),
	status: Joi.string().pattern(/^\/images\/[A-Za-z0-9_-]+\/status$/).required(),
}).required();

export const uploadImageResponseSchema = Joi.object({
	id: Joi.string().trim().required(),
	status: Joi.string().valid(...validUploadStatuses).required(),
	upload_timestamp: Joi.string().isoDate().required(),
	links: uploadImageLinksSchema,
}).required();

export const uploadQuotaExceededResponseSchema = Joi.object({
	message: Joi.string().pattern(/upload quota reached/i).required(),
	error: Joi.string().valid('Bad Request').required(),
	statusCode: Joi.number().valid(400).required(),
}).required();

export const validateUploadImageResponse = (data: unknown) => {
	return uploadImageResponseSchema.validate(data, { abortEarly: false });
};

export const validateUploadQuotaExceededResponse = (data: unknown) => {
	return uploadQuotaExceededResponseSchema.validate(data, { abortEarly: false });
};

