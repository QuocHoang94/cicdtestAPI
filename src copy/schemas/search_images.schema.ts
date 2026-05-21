import Joi from 'joi';

const searchImageBreedSchema = Joi.object({
    id: Joi.string().allow(null).required(),
    name: Joi.string().allow(null).required(),
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
}).unknown(true);

const searchImageCategorySchema = Joi.object({
    id: Joi.number().allow(null),
    name: Joi.string().allow(null),
}).unknown(true);

export const searchImageSchema = Joi.object({
    id: Joi.string().required(),
    url: Joi.string().uri().required(),
    width: Joi.number().required(),
    height: Joi.number().required(),
    breeds: Joi.array().items(searchImageBreedSchema).required(),
    categories: Joi.array().items(searchImageCategorySchema).required(),
    categories: Joi.array().items(searchImageCategorySchema).required(),
}).required();

export const searchImagesArraySchema = Joi.array().items(searchImageSchema).required();

export const validateSearchImage = (data: unknown) => {
    return searchImageSchema.validate(data, { abortEarly: false });
};

export const validateSearchImagesResponse = (data: unknown) => {
    return searchImagesArraySchema.validate(data, { abortEarly: false });
};

