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

test.describe('The Dog API - Display Uploaded Image In Browser', () => {
    // ✅ Hook: Setup API credentials từ file setup
    setupApiCredentialsHook();

    test('should display a previously uploaded image visibly in the browser', async ({ request, page }) => {
        // ✅ Sử dụng apiKey và baseEndpoint từ hook
        const imageId = '5UfpQCek72';
        const imageEndpoint = resolveImageEndpoint(baseEndpoint, imageId);

        // Bước 1: Gọi API lấy thông tin image
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

        // Validate response against schema
        const schemaValidation = validateGetUploadedImageResponse(data);

        if (schemaValidation.error) {
            console.error('❌ Schema Validation Errors:');
            schemaValidation.error.details.forEach(detail => {
                console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
            });
            expect(schemaValidation.error).toBeNull();
        } else {
            console.log('✅ Schema validation passed!');
        }

        expect(data.id).toBe('5UfpQCek72');
        expect(data.url).toBeDefined();

        // Bước 2: Hiển thị image trong browser
        await page.setContent(`
            <html>
                <head>
                    <style>
                        body {
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background: #f5f5f5;
                        }
                        #uploaded-image {
                            max-width: 90vw;
                            max-height: 90vh;
                            border: 2px solid #333;
                        }
                    </style>
                </head>
                <body>
                    <img id="uploaded-image" src="${data.url}" alt="Uploaded dog image" />
                </body>
            </html>
        `);

        const uploadedImage = page.locator('#uploaded-image');

        // Kiểm tra ảnh visible trong browser
        await expect(uploadedImage).toBeVisible();

        // Kiểm tra ảnh load thành công trong browser
        await page.waitForFunction(() => {
            const image = document.querySelector('#uploaded-image') as HTMLImageElement | null;
            return !!image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
        });

        const imageInfo = await uploadedImage.evaluate((img: HTMLImageElement) => ({
            src: img.src,
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
        }));

        expect(imageInfo.src).toBe(data.url);
        expect(imageInfo.complete).toBeTruthy();
        expect(imageInfo.naturalWidth).toBeGreaterThan(0);
        expect(imageInfo.naturalHeight).toBeGreaterThan(0);

        console.log('\n🖼️ Browser Image Display Details:');
        console.log(`  Image ID: ${data.id}`);
        console.log(`  Image URL: ${data.url}`);
        console.log(`  Natural Width: ${imageInfo.naturalWidth}`);
        console.log(`  Natural Height: ${imageInfo.naturalHeight}`);
        console.log('\n✅ Uploaded image is visible in the browser!');
    });
});

