import Joi from 'joi';

// Schema cho Weight object
const weightSchema = Joi.object({
    imperial: Joi.string().allow(null).required(),
    metric: Joi.string().allow(null).required(),
});

// Schema cho Height object
const heightSchema = Joi.object({
    imperial: Joi.string().allow(null).required(),
    metric: Joi.string().allow(null).required(),
});

// Schema cho Image object
const imageSchema = Joi.object({
    id: Joi.string().allow(null).required(),
    url: Joi.string().uri().allow(null).required(),
    width: Joi.number().allow(null).required(),
    height: Joi.number().allow(null).required(),
}).allow(null);

// Schema cho Dog Breed object
export const dogBreedSchema = Joi.object({
    id: Joi.string().required(),
    name: Joi.string().required(),
    species_id: Joi.string().allow(null).required(),
    life_span: Joi.string().allow(null).required(),
    temperament: Joi.string().allow(null).required(),
    origin: Joi.string().allow(null).required(),
    country_codes: Joi.string().allow(null).required(),
    country_code: Joi.string().allow(null).required(),
    description: Joi.string().allow(null).required(),
    bred_for: Joi.string().allow(null).required(),
    perfect_for: Joi.string().allow(null).required(),
    breed_group: Joi.string().allow(null).required(),
    history: Joi.string().allow(null).required(),
    reference_image_id: Joi.string().allow(null).required(),
    weight: weightSchema.allow(null).required(),
    height: heightSchema.allow(null).required(),
    image: imageSchema,
});

// Schema cho array của Dog Breeds
export const dogBreedsArraySchema = Joi.array().items(dogBreedSchema).required();

// Hàm validate single breed
export const validateDogBreed = (data: any) => {
    return dogBreedSchema.validate(data, { abortEarly: false });
};

// Hàm validate array of breeds
export const validateDogBreedsArray = (data: any) => {
    return dogBreedsArraySchema.validate(data, { abortEarly: false });
};

