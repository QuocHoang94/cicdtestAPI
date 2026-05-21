import { test, expect } from '@playwright/test';
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

test.describe("The Dog API - DELETE Image From Specific Breed", () => {
    // ✅ Hook: Setup API credentials từ file setup
    setupApiCredentialsHook();

    test("should get all breeds, pick reference_image_id and verify delete status code", async ({ request }) => {
        // ✅ Sử dụng apiKey và baseEndpoint từ file setup

        // Gọi API lấy danh sách breeds
        const breedResponse = await request.get(baseEndpoint, {
            headers: {
                'x-api-key': apiKey
            }
        });

        // Kiểm tra status code của API breeds
        console.log('Get All Breeds Status Code:', breedResponse.status());
        expect(breedResponse.status()).toBe(200);

        // Lấy dữ liệu response
        const breeds = await breedResponse.json();

        // Kiểm tra response không rỗng
        expect(Array.isArray(breeds)).toBeTruthy();
        expect(breeds.length).toBeGreaterThan(0);

        // Tìm breed có reference_image_id
        const breedWithReferenceImage = breeds.find((breed: any) => breed.reference_image_id);

        expect(breedWithReferenceImage).toBeDefined();
        expect(breedWithReferenceImage.reference_image_id).toBeDefined();

        const imageId = breedWithReferenceImage.reference_image_id;
        const deleteEndpoint = resolveImageEndpoint(baseEndpoint, imageId);

        console.log(`Selected Breed: ${breedWithReferenceImage.name}`);
        console.log(`Reference Image ID: ${imageId}`);
        console.log(`Delete Endpoint: ${deleteEndpoint}`);

        // Gọi API delete image theo reference_image_id của breed
        const deleteResponse = await request.delete(deleteEndpoint, {
            headers: {
                'x-api-key': apiKey
            }
        });

        // Kiểm tra status code trả về
        console.log('Delete Image Status Code:', deleteResponse.status());

        // Với reference_image_id lấy từ breed public, The Dog API thực tế trả về 403 Forbidden
        expect(deleteResponse.status()).toBe(403);

        const responseText = await deleteResponse.text();
        if (responseText) {
            console.log('Delete Image Response Body:', responseText);
        }

        console.log('✅ Delete image API returned expected status code: 403');
    });
});

