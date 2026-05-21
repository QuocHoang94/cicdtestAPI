import { test, expect } from '@playwright/test';
import { validateBreedDetail } from '../schemas/breed_detail.schema';
import { setupApiCredentialsHook, apiKey, baseEndpoint } from './setup/api.setup';

test.describe("The Dog API - GET Specific Breed", () => {
    // ✅ Hook: Setup API credentials từ file setup
    setupApiCredentialsHook();

    test("should retrieve information about a specific breed successfully", async ({ request }) => {
        // ✅ Sử dụng apiKey và baseEndpoint từ hook
        const breedId = '2'; // Afghan Hound

        // Gọi API để lấy thông tin chi tiết về một giống chó cụ thể
        const response = await request.get(`${baseEndpoint}/${breedId}`, {
            headers: {
                'x-api-key': apiKey
            }
        });

        // Kiểm tra status code
        console.log('Status Code:', response.status());
        expect(response.status()).toBe(200);

        // Lấy dữ liệu response
        const data = await response.json();

        // Kiểm tra response không rỗng và có tên giống chó
        expect(data).toBeDefined();
        expect(data.id).toBeDefined();
        expect(data.name).toBeDefined();

        // ✅ Verify Field: id trả về chính xác
        expect(data.id).toBe('2');
        // ✅ Verify Field: name trả về chính xác
        expect(data.name).toBe('Afghan Hound');

        // Validate response against schema
        const schemaValidation = validateBreedDetail(data);

        if (schemaValidation.error) {
            console.error('❌ Schema Validation Errors:');
            schemaValidation.error.details.forEach(detail => {
                console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
            });
            expect(schemaValidation.error).toBeNull();
        } else {
            console.log('\n✅ Schema validation passed!');
        }

        // In ra chi tiết giống chó
        console.log('\n🐶 Breed Details:');
        console.log(`  ID: ${data.id}`);
        console.log(`  Name: ${data.name}`);
        console.log(`  Temperament: ${data.temperament}`);
        console.log(`  Origin: ${data.origin}`);
        console.log(`  Life Span: ${data.life_span}`);
        console.log(`  Breed Group: ${data.breed_group}`);

        if (data.weight) {
            console.log(`  Weight: ${data.weight.metric} kg (${data.weight.imperial} lbs)`);
        }

        if (data.height) {
            console.log(`  Height: ${data.height.metric} cm (${data.height.imperial} in)`);
        }

        if (data.description) {
            console.log(`  Description: ${data.description}`);
        }

        if (data.history) {
            console.log(`  History: ${data.history}`);
        }

        console.log('\n✅ Successfully retrieved breed information!');
    });

    test("should return 404 for non-existent breed", async ({ request }) => {
        // ✅ Sử dụng apiKey và baseEndpoint từ hook
        const invalidBreedId = '99999'; // Non-existent breed

        const response = await request.get(`${baseEndpoint}/${invalidBreedId}`, {
            headers: {
                'x-api-key': apiKey
            }
        });

        // Kiểm tra status code là 404
        console.log('Status Code for non-existent breed:', response.status());
        expect(response.status()).toBe(404);
        console.log('✅ Correctly returned 404 for non-existent breed');
    });

    test("should validate breed details structure", async ({ request }) => {
        // ✅ Sử dụng apiKey và baseEndpoint từ hook
        const breedId = '1'; // Test with first breed

        const response = await request.get(`${baseEndpoint}/${breedId}`, {
            headers: {
                'x-api-key': apiKey
            }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();

        // Kiểm tra các field bắt buộc
        console.log('\n🔍 Validating required fields:');
        expect(data.id).toBeDefined();
        console.log(`  ✅ ID: ${data.id}`);

        expect(data.name).toBeDefined();
        console.log(`  ✅ Name: ${data.name}`);

        expect(data.species_id).toBeDefined();
        console.log(`  ✅ Species ID: ${data.species_id}`);

        // Kiểm tra nested objects
        if (data.weight) {
            expect(data.weight.imperial).toBeDefined();
            expect(data.weight.metric).toBeDefined();
            console.log(`  ✅ Weight object is valid`);
        }

        if (data.height) {
            expect(data.height.imperial).toBeDefined();
            expect(data.height.metric).toBeDefined();
            console.log(`  ✅ Height object is valid`);
        }

        if (data.image) {
            expect(data.image.id).toBeDefined();
            expect(data.image.url).toBeDefined();
            expect(data.image.width).toBeDefined();
            expect(data.image.height).toBeDefined();
            console.log(`  ✅ Image object is valid`);
        }

        console.log('\n✅ All required fields are present and valid!');
    });
});

