import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import {
    validateUploadImageResponse,
    validateUploadQuotaExceededResponse,
    validUploadStatuses,
} from '../schemas/upload_image.schema';
import { setupApiCredentialsHook, apiKey, baseEndpoint } from './setup/api.setup';

const imagePath = '/Users/curryhoang/API_TEST/img/breed_profile_germansheperd.jpg';

type UploadQuotaErrorResponse = {
    message?: string;
    error?: string;
    statusCode?: number;
};

const resolveMimeType = (filePath: string) => {
    const extension = path.extname(filePath).toLowerCase();

    switch (extension) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        case '.webp':
            return 'image/webp';
        default:
            throw new Error(`Unsupported image extension: ${extension}`);
    }
};

const resolveUploadEndpoint = (configuredBaseEndpoint: string) => {
    const normalizedEndpoint = configuredBaseEndpoint.replace(/\/+$/, '');

    if (normalizedEndpoint.endsWith('/images/upload')) {
        return normalizedEndpoint;
    }

    if (normalizedEndpoint.endsWith('/breeds')) {
        return normalizedEndpoint.replace(/\/breeds$/, '/images/upload');
    }

    if (normalizedEndpoint.endsWith('/v1')) {
        return `${normalizedEndpoint}/images/upload`;
    }

    return normalizedEndpoint.includes('/v1')
        ? `${normalizedEndpoint}/images/upload`
        : `${normalizedEndpoint}/v1/images/upload`;
};

const generateRandomString = (prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const generateDynamicSubId = () => {
    return generateRandomString('qe_automation_delete_flow');
};

const generateDynamicBreedId = async (request: any) => {
    const response = await request.get(baseEndpoint, {
        headers: {
            'x-api-key': apiKey
        }
    });

    expect(response.status()).toBe(200);
    const breeds = await response.json();

    expect(Array.isArray(breeds)).toBeTruthy();
    expect(breeds.length).toBeGreaterThan(0);

    const randomIndex = Math.floor(Math.random() * breeds.length);
    return String(breeds[randomIndex].id);
};

const resolveDeleteEndpoint = (configuredBaseEndpoint: string, imageId: string) => {
    const normalizedEndpoint = configuredBaseEndpoint.replace(/\/+$/, '');

    if (normalizedEndpoint.endsWith('/images')) {
        return `${normalizedEndpoint}/${imageId}`;
    }

    if (normalizedEndpoint.endsWith('/breeds')) {
        return normalizedEndpoint.replace(/\/breeds$/, `/images/${imageId}`);
    }

    if (normalizedEndpoint.endsWith('/v1')) {
        return `${normalizedEndpoint}/images/${imageId}`;
    }

    return normalizedEndpoint.includes('/v1')
        ? `${normalizedEndpoint}/images/${imageId}`
        : `${normalizedEndpoint}/v1/images/${imageId}`;
};

const isUploadQuotaExceeded = (data: unknown): data is UploadQuotaErrorResponse => {
    if (!data || typeof data !== 'object') {
        return false;
    }

    const message = (data as UploadQuotaErrorResponse).message;
    return typeof message === 'string' && message.toLowerCase().includes('upload quota reached');
};

test.describe('The Dog API - Upload Then Delete Image', () => {
    // ✅ Hook: Setup API credentials từ file setup
    setupApiCredentialsHook();

    test.skip('should upload image successfully then delete it and verify 204', async ({ request }) => {
        // ✅ Sử dụng apiKey và baseEndpoint từ file setup
        expect(fs.existsSync(imagePath)).toBeTruthy();

        const uploadEndpoint = resolveUploadEndpoint(baseEndpoint);
        const imageBuffer = fs.readFileSync(imagePath);
        const imageName = path.basename(imagePath);
        const mimeType = resolveMimeType(imagePath);
        const dynamicSubId = generateDynamicSubId();
        const dynamicBreedId = await generateDynamicBreedId(request);

        console.log(`Upload Endpoint: ${uploadEndpoint}`);
        console.log(`Image Path: ${imagePath}`);
        console.log(`Dynamic sub_id: ${dynamicSubId}`);
        console.log(`Dynamic breed_ids: ${dynamicBreedId}`);

        // Bước 1: Upload image
        const uploadResponse = await request.post(uploadEndpoint, {
            headers: {
                'x-api-key': apiKey
            },
            multipart: {
                file: {
                    name: imageName,
                    mimeType,
                    buffer: imageBuffer,
                },
                sub_id: dynamicSubId,
                breed_ids: dynamicBreedId,
            }
        });

        console.log('Upload Status Code:', uploadResponse.status());
        const uploadData = await uploadResponse.json();
        console.log('Upload Response Body:', JSON.stringify(uploadData, null, 2));

        // Nếu API ngoài hết quota upload thì verify schema lỗi và skip
        if (uploadResponse.status() === 400 && isUploadQuotaExceeded(uploadData)) {
            const quotaValidation = validateUploadQuotaExceededResponse(uploadData);

            if (quotaValidation.error) {
                console.error('❌ Quota Error Schema Validation Errors:');
                quotaValidation.error.details.forEach(detail => {
                    console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
                });
                expect(quotaValidation.error).toBeNull();
            } else {
                console.log('✅ Quota error schema validation passed!');
            }

            test.skip(true, `Dog API monthly upload quota reached: ${uploadData.message}`);
        }

        expect(uploadResponse.ok()).toBeTruthy();
        expect([200, 201, 202]).toContain(uploadResponse.status());

        // Validate upload response schema
        const uploadSchemaValidation = validateUploadImageResponse(uploadData);

        if (uploadSchemaValidation.error) {
            console.error('❌ Upload Schema Validation Errors:');
            uploadSchemaValidation.error.details.forEach(detail => {
                console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
            });
            expect(uploadSchemaValidation.error).toBeNull();
        } else {
            console.log('✅ Upload schema validation passed!');
        }

        expect(uploadData.id).toBeDefined();
        expect(uploadData.id).not.toEqual('');
        expect(validUploadStatuses).toContain(uploadData.status);

        const uploadedImageId = uploadData.id;
        const deleteEndpoint = resolveDeleteEndpoint(baseEndpoint, uploadedImageId);

        console.log(`Uploaded Image ID: ${uploadedImageId}`);
        console.log(`Delete Endpoint: ${deleteEndpoint}`);

        // Bước 2: Delete image vừa upload
        const deleteResponse = await request.delete(deleteEndpoint, {
            headers: {
                'x-api-key': apiKey
            }
        });

        console.log('Delete Status Code:', deleteResponse.status());
        const deleteResponseText = await deleteResponse.text();

        if (deleteResponseText) {
            console.log('Delete Response Body:', deleteResponseText);
        }

        // Verify delete thành công
        expect(deleteResponse.status()).toBe(204);
        expect(deleteResponseText).toBe('');

        console.log('✅ Upload -> Delete flow completed successfully with status 204');
    });
});

