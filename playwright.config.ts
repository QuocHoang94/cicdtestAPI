import { defineConfig } from '@playwright/test';
import type { TestOptions } from './test_option';

import dotenv from 'dotenv';
dotenv.config();

export default defineConfig<TestOptions>({
  testDir: './src/tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    launchOptions: {
      args: ['--start-maximized'],
    },
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: {
      mode: 'on',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'apiTests',
      testMatch: 'getRetrieveAllBreeds_api.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: null,
      },
    },
    {
      name: 'breedDetailTests',
      testMatch: 'getRetrieve_specific_breed.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: null,
      },
    },
    {
      name: 'uploadImageTests',
      testMatch: 'uploadImage.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: null,
      },
    },
    {
      name: 'deleteImageTests',
      testMatch: 'deleteImageFromSpecificBreed.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: null,
      },
    },
    {
      name: 'getUploadedImageTests',
      testMatch: 'getUploadedImageById.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: null,
      },
    },
    {
      name: 'randomImagesTests',
      testMatch: 'getRandomImages.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: null,
      },
    },
    {
      name: 'displayUploadedImageTests',
      testMatch: 'displayUploadedImage.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: null,
      },
    },
    {
      name: 'uploadDelete204Tests',
      testMatch: 'uploadThenDeleteImage.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: null,
      },
    },
  ],
});
