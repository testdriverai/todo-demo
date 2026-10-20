import { defineConfig } from 'vitest/config';
import TestDriver from 'testdriverai/vitest';

// TestDriver end-to-end tests live in tests/; Node unit tests live in test/.
// Note: dotenv is loaded automatically by the TestDriver SDK
export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    testTimeout: 300000,
    hookTimeout: 300000,
    reporters: [
      'default',
      TestDriver(),
    ],
    setupFiles: ['testdriverai/vitest/setup'],
  },
});
