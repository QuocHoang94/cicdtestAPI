# Dog API Test Automation

[!-- CI Status Badge -->
[![Playwright API Tests](https://github.com/curryhoang/cicdtestAPI/actions/workflows/playwright-api.yml/badge.svg)](https://github.com/curryhoang/cicdtestAPI/actions/workflows/playwright-api.yml)


This repository contains an API test automation project built with **TypeScript**, **Playwright**, and **Joi** for validating The Dog API.

The current test coverage focuses on:
- retrieving all breeds
- retrieving a specific breed by ID
- retrieving a previously uploaded image by image ID
- retrieving a random list of images and their URLs
- uploading an image
- displaying an uploaded image in the browser
- deleting an image
- upload → delete flow validation

---

## 1. Installation

### Prerequisites
- Node.js installed
- npm installed
- A valid The Dog API key

> Each user should create and use their own `DOG_API_KEY` from The Dog API instead of reusing someone else's key.

### Setup steps

```bash
npm install
npx playwright install chromium
```

> `chromium` is required because the current Playwright projects are configured to run with Chromium.

---

## 2. Required Environment Variables

Create a `.env` file in the project root.

You should generate your own API key from The Dog API and store it locally in this file.

### How to get your `DOG_API_KEY`

> **Important:** Create your own personal API key, keep it private, and do not commit it to GitHub.

1. Go to: `https://account.thedogapi.com/`
2. Register for a new account.
3. Verify the email address you used during registration.
4. After email verification, sign in to your The Dog API account.
5. Open your account dashboard and copy **Your API Key**.
6. Paste that key into your local `.env` file.

Example:

```env
DOG_API_KEY=your_api_key_here
DOG_API_ENDPOINT=https://api.thedogapi.com/v1/breeds
```

### Variables used by the test suite

#### `DOG_API_KEY`
Used to authenticate requests to The Dog API through the `x-api-key` header.

#### `DOG_API_ENDPOINT`
Base endpoint used by the shared API setup.

Current default fallback in the code:

```ts
https://api.thedogapi.com/v1/breeds
```

The tests dynamically convert this base endpoint into other endpoints such as:
- `/v1/images/upload`
- `/v1/images/:image_id`
- `/v1/images/search?limit=20`

---

## 3. How to Run Tests

### Run all tests

```bash
npm run test:all
```

### Run specific test files

```bash
npm run test:api
npm run test:breed
npm run test:get-uploaded-image
npm run test:get-random-images
npm run test:display-uploaded-image
npm run test:upload
npm run test:delete-image
npm run test:upload-delete-204
npm run test:ci
```

### Run a spec directly with Playwright

```bash
npx playwright test src/tests/getRetrieveAllBreeds_api.spec.ts
npx playwright test src/tests/getRetrieve_specific_breed.spec.ts
npx playwright test src/tests/getUploadedImageById.spec.ts
npx playwright test src/tests/getRandomImages.spec.ts
npx playwright test src/tests/displayUploadedImage.spec.ts
npx playwright test src/tests/uploadImage.spec.ts
npx playwright test src/tests/deleteImageFromSpecificBreed.spec.ts
npx playwright test src/tests/uploadThenDeleteImage.spec.ts
```

### Open the last HTML report

```bash
npx playwright show-report
```

### Run in CI mode locally

```bash
npm run test:ci
```

---

## 4. CI Readiness

A minimal GitHub Actions workflow is available at:

```text
.github/workflows/playwright-api.yml
```

### CI environment variables

Configure the following in GitHub:

- **GitHub Secret**: `DOG_API_KEY` *(required)*
- **GitHub Variable**: `DOG_API_ENDPOINT` *(optional)*

If `DOG_API_ENDPOINT` is not provided in GitHub, the workflow uses this default value:

```text
https://api.thedogapi.com/v1/breeds
```

### CI artifacts

The workflow uploads these artifacts after every run:

- `playwright-report/`
- `test-results/`

---

## 5. Assumptions

The current test suite was built with the following assumptions:

1. The Dog API is reachable from the test environment.
2. The API key used in `.env` is valid.
3. `DOG_API_ENDPOINT` points to the breeds base endpoint:
   - `https://api.thedogapi.com/v1/breeds`
4. Some read-only tests use stable known IDs, for example:
   - breed ID `2`
   - uploaded image ID `5UfpQCek72`
5. The local image file used for upload flows exists in the repository at:
   - `img/breed_profile_germansheperd.jpg`
6. Browser-based image display tests are executed with Playwright Chromium installed.
7. Random image tests request 20 images, but the suite accepts a dynamic count as long as the API returns a non-empty list and valid URLs.

---

## 6. Limitations

The current project has some known limitations:

1. **External API dependency**  
   The suite depends on live responses from The Dog API. If the service is unavailable or changed, tests may fail.

2. **Upload quota limitation**  
   Image upload tests may be skipped or blocked if the API account reaches the monthly upload quota.

3. **Delete permission limitation**  
   Deleting a public `reference_image_id` from breed data does not succeed and typically returns `403 Forbidden` because the image is not owned by the current API key.

4. **Hard-coded sample IDs**  
   Some tests rely on fixed breed IDs and fixed uploaded image IDs. If those resources change or are removed in the external API, the tests may need updates.

5. **Bundled local image dependency**  
   Upload-related tests depend on the repository image fixture `img/breed_profile_germansheperd.jpg` being present in the workspace.

6. **Live data variability**  
   Random image endpoints return live dynamic content, so the exact returned images may differ between runs.

7. **Limited implementation time**  
   The assessment time window was relatively short, so deeper API exploration and broader test implementation were limited by time.

---

## 7. Notes

- Response validation is implemented with **Joi schemas**.
- Shared API setup is handled by `setupApiCredentialsHook()`.
- The project uses Playwright's **HTML reporter**, trace capture on first retry, screenshots on failure, and video recording.

If needed, refer to `API_TEST_STRATEGY.md` for a short overall strategy document for this test suite.

---

## Securing `.env` and CI Secrets

- **Do NOT commit** your real `.env` file. The repository already ignores `.env` via `.gitignore`.
- Create a `.env.example` with the keys (no secret values) and commit it. Example provided in `.env.example`.
- Add secrets in the GitHub repository: Settings → Secrets and variables → Actions → New repository secret.
   - Name: `DOG_API_KEY` — Value: *your real API key*
   - Optionally add `DOG_API_ENDPOINT` if you use a custom endpoint.

If you accidentally committed `.env`, stop tracking it and remove it from the index locally:

```bash
git rm --cached .env
git commit -m "Stop tracking .env"
git push
```

To purge `.env` from the repository history (optional, irreversible):

- Using `git filter-repo` (recommended):

```bash
pip install git-filter-repo
git clone --mirror <repo-url>
cd repo.git
git filter-repo --path .env --invert-paths
git push --force
```

- Or use the BFG Repo Cleaner: https://rtyley.github.io/bfg-repo-cleaner/

After purging history, inform collaborators to re-clone the repository.

## CI/CD — How to run and view reports

This project uses GitHub Actions (`.github/workflows/playwright-api.yml`) to run the Playwright test suite and produce test artifacts (HTML report, `test-results/`, and an Allure HTML report when results exist).

Quick checklist to run CI on GitHub:
- Add your `DOG_API_KEY` to the repository secrets (required):
   - GUI: Repository → Settings → Secrets and variables → Actions → New repository secret → Name: `DOG_API_KEY` → Value: your key.
   - CLI: `echo -n "your_real_api_key" | gh secret set DOG_API_KEY --repo OWNER/REPO`
- Push a commit to `main`/`master` or run the workflow manually: Actions → Playwright API Tests → Run workflow (choose branch).

What the workflow produces:
- `playwright-report/` (Playwright HTML reporter)
- `test-results/` (raw Playwright results)
- `allure-report/` (Allure HTML, generated from `allure-results` if present)

How to view reports after a workflow run:
- In the workflow run UI, open the step logs and look for uploads; artifacts are attached at the top-right "Artifacts" section.
- Download the `allure-report` (or `playwright-report`) artifact, unzip it locally and open `index.html` in your browser to view the full HTML report.

Generate or open Allure report locally (optional):
1. Ensure `allure-commandline` is installed (we added it as a devDependency). Generate from results produced by Playwright:
```bash
npm run allure:generate
```
2. Open the generated report locally:
```bash
npm run allure:open
```

Notes and troubleshooting:
- If the workflow does not run on a pull request from a fork, that's intentional: repository secrets are not exposed to forked PRs. Use a branch in the same repo or run the workflow manually.
- If `allure-report` artifact is not present, confirm that tests produced `allure-results/` (the reporter configuration `allure-playwright` writes to that directory).


Tóm tắt ngắn:

Vấn đề: GitHub Actions upload artifact không hiển thị HTML trực tiếp trong giao diện; artifacts chỉ để tải về.
Giải pháp đã áp dụng: cập nhật playwright-api.yml để
chạy npx playwright test (không ghi đè reporter),
tạo allure-report từ allure-results,
nếu allure-report tồn tại -> upload-pages-artifact và deploy-pages để publish lên GitHub Pages,
vẫn giữ upload artifact (downloadable) như trước.
File đã sửa: playwright-api.yml:1-220
Tiếp theo bạn có thể làm 1 trong các bước sau (chọn 1):

Kích hoạt CI (push commit) để workflow chạy và publish report lên Pages:
Sau job chạy xong, report sẽ có ở Pages URL kiểu:
https://<GITHUB_USERNAME_OR_ORG>.github.io/<REPO_NAME>/
(kiểm tra trang Settings → Pages nếu cần, và đảm bảo pages: write permission chấp nhận)

