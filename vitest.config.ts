import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: ['node_modules', 'PRIVATE/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
