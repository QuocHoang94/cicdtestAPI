import Joi from 'joi';

const uploadedImageBreedSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    species_id: Joi.string().allow(null).required(),
    life_span: Joi.string().allow(null).required(),
    temperament: Joi.string().allow(null).required(),
    origin: Joi.string().allow(null).required(),
    country_code: Joi.string().allow(null).required(),
    description: Joi.string().allow(null).required(),
    bred_for: Joi.string().allow(null).required(),
    perfect_for: Joi.string().allow(null).required(),
    breed_group: Joi.string().allow(null).required(),
    history: Joi.string().allow(null).required(),
    alt_names: Joi.string().allow(null).required(),
    wikipedia_url: Joi.string().uri().allow(null).required(),
    reference_image_id: Joi.string().allow(null).required(),
});

export const getUploadedImageSchema = Joi.object({
    id: Joi.string().required(),
    url: Joi.string().uri().required(),
    width: Joi.number().required(),
    height: Joi.number().required(),
    breeds: Joi.array().items(uploadedImageBreedSchema).required(),
    categories: Joi.array().required(),
}).required();

export const validateGetUploadedImageResponse = (data: unknown) => {
    return getUploadedImageSchema.validate(data, { abortEarly: false });
};

