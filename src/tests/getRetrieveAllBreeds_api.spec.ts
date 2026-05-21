import { test, expect } from '@playwright/test';
import { validateDogBreedsArray, validateDogBreed } from '../schemas/all_breed.schema';
import { setupApiCredentialsHook, apiKey, baseEndpoint } from './setup/api.setup';

test.describe("The Dog API - GET All Breeds", () => {
    // ✅ Hook: Setup API credentials từ file setup
    setupApiCredentialsHook();

    test("should fetch list of dog breeds successfully", async ({ request }) => {
        // ✅ Sử dụng apiKey và baseEndpoint từ file setup

        // Gọi API
        const response = await request.get(baseEndpoint, {
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
        expect(Array.isArray(data)).toBeTruthy();
        expect(data.length).toBeGreaterThan(0);

        // Validate response against schema
        const schemaValidation = validateDogBreedsArray(data);

        if (schemaValidation.error) {
            console.error('❌ Schema Validation Errors:');
            schemaValidation.error.details.forEach(detail => {
                console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
            });
            expect(schemaValidation.error).toBeNull();
        } else {
            console.log('✅ Schema validation passed!');
        }

        // Validate individual breeds
        console.log('\n🔍 Validating individual breeds:');
        let invalidBreeds = 0;
        data.slice(0, 5).forEach((breed, index) => {
            const breedValidation = validateDogBreed(breed);
            if (breedValidation.error) {
                console.error(`  ❌ Breed #${index + 1} (${breed.name}): ${breedValidation.error.message}`);
                invalidBreeds++;
            } else {
                console.log(`  ✅ Breed #${index + 1} (${breed.name}): Valid`);
            }
        });

        if (invalidBreeds === 0) {
            console.log('✅ All sample breeds are valid!');
        }

        console.log(`✅ API Key hợp lệ! Lấy được ${data.length} giống chó`);
        console.log(`🐶 Danh sách các giống chó:`);

        // In ra danh sách tất cả giống chó
        data.forEach((breed, index) => {
            console.log(`${index + 1}. ${breed.name} (ID: ${breed.id})`);
        });

        console.log(`\n✅ Tổng cộng: ${data.length} giống chó`);
    });
});

