import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';
import {
	validateUploadImageResponse,
	validateUploadQuotaExceededResponse,
	validUploadStatuses,
} from '../schemas/upload_image.schema';
import { setupApiCredentialsHook, apiKey, baseEndpoint } from './setup/api.setup';

const imagePath = path.resolve(__dirname, '../../img/breed_profile_germansheperd.jpg');

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
	return generateRandomString('qe_automation_test');
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

const isUploadQuotaExceeded = (data: unknown): data is UploadQuotaErrorResponse => {
	if (!data || typeof data !== 'object') {
		return false;
	}

	const message = (data as UploadQuotaErrorResponse).message;
	return typeof message === 'string' && message.toLowerCase().includes('upload quota reached');
};

test.describe("The Dog API - POST Image Upload", () => {
	// ✅ Hook: Setup API credentials từ file setup
	setupApiCredentialsHook();

	test("should upload image successfully and validate schema", async ({ request }) => {
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

		// Gọi API upload image
		const response = await request.post(uploadEndpoint, {
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

		// Kiểm tra status code
		console.log('Status Code:', response.status());

		// Lấy dữ liệu response
		const data = await response.json();
		console.log('Response Body:', JSON.stringify(data, null, 2));

		// Nếu API ngoài hết quota upload thì verify schema lỗi và skip
		if (response.status() === 400 && isUploadQuotaExceeded(data)) {
			const quotaValidation = validateUploadQuotaExceededResponse(data);

			if (quotaValidation.error) {
				console.error('❌ Quota Error Schema Validation Errors:');
				quotaValidation.error.details.forEach(detail => {
					console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
				});
				expect(quotaValidation.error).toBeNull();
			} else {
				console.log('✅ Quota error schema validation passed!');
			}

			test.skip(true, `Dog API monthly upload quota reached: ${data.message}`);
		}

		expect(response.ok()).toBeTruthy();
		expect([200, 201, 202]).toContain(response.status());

		// Validate response against schema
		const schemaValidation = validateUploadImageResponse(data);

		if (schemaValidation.error) {
			console.error('❌ Schema Validation Errors:');
			schemaValidation.error.details.forEach(detail => {
				console.error(`  - ${detail.path.join('.')}: ${detail.message}`);
			});
			expect(schemaValidation.error).toBeNull();
		} else {
			console.log('✅ Schema validation passed!');
		}

		// Kiểm tra các field bắt buộc
		expect(data).toBeDefined();
		expect(data.id).toBeDefined();
		expect(data.status).toBeDefined();
		expect(data.upload_timestamp).toBeDefined();
		expect(data.links).toBeDefined();
		expect(data.links.self).toBeDefined();
		expect(data.links.status).toBeDefined();

		// Verify giá trị response hợp lệ
		expect(data.id).not.toEqual('');
		expect(validUploadStatuses).toContain(data.status);
		expect(data.links.self).toBe(`/images/${data.id}`);
		expect(data.links.status).toBe(`/images/${data.id}/status`);

		console.log('✅ Upload image thành công!');
		console.log(`📷 Upload ID: ${data.id}`);
		console.log(`📌 Upload Status: ${data.status}`);
		console.log(`🕒 Upload Timestamp: ${data.upload_timestamp}`);
	});
});

