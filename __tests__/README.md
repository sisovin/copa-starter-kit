# Payment Gateway Testing Suite

This directory contains E2E tests and mock servers for testing the Cambodia payment gateway integrations (PayWay and Bakong).

## Test Coverage

The test suite covers the following scenarios:

1. **Happy path PayWay flow** - Successful payment processing through PayWay
2. **Bakong QR code failure case** - Error handling when QR code generation fails
3. **Concurrent payment attempts** - Testing multiple simultaneous payment attempts
4. **Webhook timeout scenarios** - Handling delayed or failed webhook deliveries
5. **Mobile viewport testing** - Payment flows on different mobile device sizes
6. **Accessibility checks** - WCAG 2.1 AA compliance testing

## Mock Servers

The test suite includes mock implementations of both payment gateway APIs:

### PayWay Mock Server

- Configurable response delays and errors
- Signature verification simulation
- Transaction status updates
- Webhook delivery simulation

### Bakong Mock Server

- QR code generation
- Status updates
- Phone number validation
- Webhook simulation

## Environment Switcher

A utility is provided to switch between different environment configurations:

- **Development** - Fast responses, no errors (good for rapid development)
- **Staging** - Moderate delays, occasional errors (good for integration testing)
- **Production** - Realistic delays, rare errors (good for end-to-end testing)

Custom environments are also available for specific test scenarios:

- **Error-prone** - High error rates for error handling tests
- **Slow-response** - Very slow responses for timeout testing
- **Mixed** - Combination of errors and delays for realistic testing

## Running the Tests

### Prerequisites

Make sure you have the following installed:

- Node.js 16+
- Playwright dependencies (`npx playwright install`)

### Start the mock servers

```bash
npm run mock-servers
```

For specific environments:

```bash
npm run mock-servers:error
npm run mock-servers:slow
npm run mock-servers:mixed
```

### Run the tests

Run all E2E tests:

```bash
npm run test:e2e
```

Run specific test suites:

```bash
npm run test:e2e:payment-flows
npm run test:e2e:mobile
npm run test:e2e:accessibility
npm run test:e2e:concurrent
npm run test:e2e:webhooks
npm run test:e2e:bakong-failures
```

Run tests in debug mode:

```bash
npm run test:e2e:debug
```

## Test Reports

After running tests, reports are available in:

- HTML: `test-results/html/index.html`
- JSON: `test-results/results.json`

## Accessibility Reports

Accessibility test reports are available in:

- `test-results/accessibility/html-report/index.html`
- `test-results/accessibility/reports/`
