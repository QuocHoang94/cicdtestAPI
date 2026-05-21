# API Test Strategy

## 1. Objective
This test strategy defines a lightweight and practical approach for validating The Dog API using Playwright and TypeScript. The goal is to verify that core API features behave correctly, return expected status codes, provide valid response data, and support reliable user-facing flows such as image retrieval, upload, display, and delete operations.

## 2. Scope
The current API test scope includes:
- Retrieving all dog breeds
- Retrieving a specific breed by ID
- Retrieving a previously uploaded image by image ID
- Retrieving a random list of images and their URLs
- Uploading an image
- Displaying an uploaded image in the browser
- Deleting an image
- Upload-then-delete flow validation

Out of scope:
- Performance and load testing
- Security penetration testing
- Contract testing with external service mocks
- Full frontend UI workflows beyond basic browser image display validation

## 3. Test Approach
The API suite follows these principles:
- Validate HTTP status codes for every request
- Validate response body structure with Joi schemas
- Verify critical business fields such as `id`, `name`, `url`, and image metadata
- Use reusable hooks for API key and base endpoint setup
- Keep test cases independent where possible
- Use real API responses for end-to-end confidence

## 4. Test Types
### Functional Testing
Confirms that each endpoint returns the expected business result.
Examples:
- `GET /breeds` returns a non-empty list
- `GET /breeds/{id}` returns the correct breed
- `GET /images/{image_id}` returns the correct image details
- `DELETE /images/{image_id}` returns the expected authorization result or success status

### Schema Validation
Joi schemas are used to verify response contracts and required fields.
This helps detect missing fields, invalid types, or unexpected payload structure changes.

### End-to-End API Workflow Testing
Some tests validate multi-step flows, for example:
- upload image -> get image -> display image
- upload image -> delete image -> verify `204 No Content`

### Basic Browser Validation
For image display scenarios, Playwright browser checks confirm that the image URL can be rendered visibly and loaded successfully in a real browser context.

## 5. Test Data Strategy
- Static breed IDs and image IDs may be used for stable read-only tests
- Dynamic data should be used for upload/delete workflows where ownership matters
- Uploaded test data should be cleaned up when possible
- Tests must tolerate external API constraints such as upload quota limits

## 6. Environment and Configuration
- Framework: Playwright with TypeScript
- Validation library: Joi
- Authentication: API key passed through request headers
- Configuration source: environment variables loaded from `.env`
- Shared setup: `setupApiCredentialsHook()`

Required environment variables:
- `DOG_API_KEY`
- `DOG_API_ENDPOINT`

## 7. Entry and Exit Criteria
### Entry Criteria
- API key is valid
- Test environment is reachable
- Playwright dependencies and browsers are installed
- Required image test files are available

### Exit Criteria
- Critical API scenarios pass
- Schema validation passes for targeted endpoints
- Known external limitations are documented (for example upload quota reached)
- No unresolved blocker remains for core API coverage

## 8. Risks and Assumptions
- Some endpoints depend on external service availability
- Upload tests may be blocked by monthly quota limits
- Public image resources may not be deletable and can return `403 Forbidden`
- Response payloads may evolve over time, requiring schema updates

## 9. Maintenance Guidelines
- Keep schemas aligned with real API responses
- Prefer reusable helpers for endpoint resolution and shared setup
- Separate read-only tests from destructive tests
- Update test scripts and Playwright project entries when adding new specs
- Review failed tests to distinguish code issues from external API limitations

## 10. Success Measure
The strategy is successful when the API test suite gives fast, readable, and trustworthy feedback about the correctness of The Dog API integrations and the most important image and breed workflows.

