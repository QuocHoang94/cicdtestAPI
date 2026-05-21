import { test, expect } from '@playwright/test';
import { validateGetUploadedImageResponse } from '../schemas/get_uploaded_image.schema';
import { setupApiCredentialsHook, apiKey, baseEndpoint } from './setup/api.setup';

const resolveImageEndpoint = (configuredBaseEndpoint: string, imageId: string) => {
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

test.describe("The Dog API - GET Uploaded Image By ID", () => {
    // ✅ Hook: Setup API credentials từ file setup
    setupApiCredentialsHook();

    test("should retrieve a previously uploaded image successfully", async ({ request }) => {
        // ✅ Sử dụng apiKey và baseEndpoint từ hook
        const imageId = '5UfpQCek72';
        const imageEndpoint = resolveImageEndpoint(baseEndpoint, imageId);

        // Gọi API để lấy thông tin image theo image id
        const response = await request.get(imageEndpoint, {
            headers: {
                'x-api-key': apiKey
            }
        });

        // Kiểm tra status code
        console.log('Status Code:', response.status());
        expect(response.status()).toBe(200);

        // Lấy dữ liệu response
        const data = await response.json();

        // Kiểm tra response không rỗng
        expect(data).toBeDefined();
        expect(data.id).toBeDefined();
        expect(data.url).toBeDefined();

        // ✅ Verify field chính trả về chính xác
        expect(data.id).toBe('5UfpQCek72');
        expect(data.url).toBe('https://storage.googleapis.com/dog-api-uploads-prod/originals/11c76795-9f6b-4a72-aa7a-c3d66c2bf74a.jpeg');
        expect(data.width).toBe(421);
        expect(data.height).toBe(500);

        // Validate response against schema
        const schemaValidation = validateGetUploadedImageResponse(data);

        if (schemaValidation.error) {
            console.error('❌ Schema Validation Errors:');
            schemaValidation.error.details.forEach(detail => {
                console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
            });
            expect(schemaValidation.error).toBeNull();
        } else {
            console.log('\n✅ Schema validation passed!');
        }

        // Verify breeds data
        expect(Array.isArray(data.breeds)).toBeTruthy();
        expect(data.breeds.length).toBeGreaterThan(0);
        expect(data.breeds[0].id).toBe('115');
        expect(data.breeds[0].name).toBe('German Shepherd');
        expect(data.breeds[0].reference_image_id).toBe('kc6oAx2b3X');

        // Verify categories array
        expect(Array.isArray(data.categories)).toBeTruthy();
        expect(data.categories.length).toBe(0);

        console.log('\n🖼️ Uploaded Image Details:');
        console.log(`  ID: ${data.id}`);
        console.log(`  URL: ${data.url}`);
        console.log(`  Width: ${data.width}`);
        console.log(`  Height: ${data.height}`);
        console.log(`  Breed Name: ${data.breeds[0].name}`);
        console.log(`  Breed ID: ${data.breeds[0].id}`);
        console.log('\n✅ Successfully retrieved uploaded image information!');
    });
});

