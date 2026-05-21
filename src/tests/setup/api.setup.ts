import { test } from '@playwright/test';

// ✅ Global API Configuration - Khởi tạo một lần
export let apiKey: string;
export let baseEndpoint: string;

/**
 * Setup API Credentials Hook
 * Gọi function này trong test.describe để khởi tạo API credentials
 *
 * Cách sử dụng:
 * test.describe("...", () => {
 *     setupApiCredentialsHook();
 *     // Giờ có thể sử dụng apiKey và baseEndpoint
 * });
 */
export const setupApiCredentialsHook = () => {
    test.beforeAll(() => {
        apiKey = process.env.DOG_API_KEY || 'your_api_key_here';
        baseEndpoint = process.env.DOG_API_ENDPOINT || 'https://api.thedogapi.com/v1/breeds';
        console.log('🔧 Setup: API Key and Endpoint initialized');
        console.log(`   API Endpoint: ${baseEndpoint}`);
    });
};


