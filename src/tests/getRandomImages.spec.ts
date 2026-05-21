import { test, expect } from '@playwright/test';
import { validateSearchImagesResponse, validateSearchImage } from '../schemas/search_images.schema';
import { setupApiCredentialsHook, apiKey, baseEndpoint } from './setup/api.setup';

const resolveSearchImagesEndpoint = (configuredBaseEndpoint: string, limit: number) => {
    const normalizedEndpoint = configuredBaseEndpoint.replace(/\/+$/, '');
    const query = `limit=${limit}`;

    if (normalizedEndpoint.endsWith('/images/search')) {
        return `${normalizedEndpoint}?${query}`;
    }

    if (normalizedEndpoint.endsWith('/breeds')) {
        return normalizedEndpoint.replace(/\/breeds$/, `/images/search?${query}`);
    }

    if (normalizedEndpoint.endsWith('/v1')) {
        return `${normalizedEndpoint}/images/search?${query}`;
    }

    return normalizedEndpoint.includes('/v1')
        ? `${normalizedEndpoint}/images/search?${query}`
        : `${normalizedEndpoint}/v1/images/search?${query}`;
};

test.describe("The Dog API - GET Random Images", () => {
    // ✅ Hook: Setup API credentials từ file setup
    setupApiCredentialsHook();

    test("should retrieve a random list of images with their respective urls successfully", async ({ request }) => {
        // ✅ Sử dụng apiKey và baseEndpoint từ hook
        const requestedLimit = 20;
        const searchImagesEndpoint = resolveSearchImagesEndpoint(baseEndpoint, requestedLimit);

        // Gọi API để lấy random list of images
        const response = await request.get(searchImagesEndpoint, {
            headers: {
                'x-api-key': apiKey
            }
        });

        // Kiểm tra status code
        console.log('Status Code:', response.status());
        expect(response.status()).toBe(200);

        // Lấy dữ liệu response
        const data = await response.json();

        // Kiểm tra response là array và không rỗng
        expect(Array.isArray(data)).toBeTruthy();
        expect(data.length).toBeGreaterThan(0);
        expect(data.length).toBeLessThanOrEqual(requestedLimit);

        // Dynamic counter accepted: nếu API trả đúng 20 thì verify 20, nếu không thì chỉ cần > 0 và <= limit
        console.log(`Requested image count: ${requestedLimit}`);
        console.log(`Actual returned image count: ${data.length}`);

        // Validate response against schema
        const schemaValidation = validateSearchImagesResponse(data);

        if (schemaValidation.error) {
            console.error('❌ Schema Validation Errors:');
            schemaValidation.error.details.forEach(detail => {
                console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
            });
            expect(schemaValidation.error).toBeNull();
        } else {
            console.log('\n✅ Schema validation passed!');
        }

        // Validate individual image items
        console.log('\n🔍 Validating random image items:');
        data.forEach((image: any, index: number) => {
            const imageValidation = validateSearchImage(image);

            if (imageValidation.error) {
                console.error(`  ❌ Image #${index + 1} (${image.id}): ${imageValidation.error.message}`);
            } else {
                console.log(`  ✅ Image #${index + 1} (${image.id}): Valid`);
            }

            expect(image.id).toBeDefined();
            expect(image.url).toBeDefined();
            expect(image.id).not.toEqual('');
            expect(image.url).toMatch(/^https?:\/\//);
        });

        // In ra danh sách image id và url
        console.log('\n🖼️ Random Images List:');
        data.forEach((image: any, index: number) => {
            console.log(`${index + 1}. ID: ${image.id}`);
            console.log(`   URL: ${image.url}`);
        });

        console.log(`\n✅ Successfully retrieved ${data.length} random images with URLs!`);
    });
});

