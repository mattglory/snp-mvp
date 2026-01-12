import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      reportsDirectory: './coverage',
      // Exclude Clarity contracts - V8 coverage cannot parse them
      // Clarity contracts are tested by Clarinet's built-in testing framework
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test-*.ts',
        'PRIVATE/**',
        'frontend/**',
        'contracts/**/*.clar',  // Clarity contracts excluded
        '**/*.clar',            // All Clarity files excluded
      ],
      // Only include TypeScript test utilities
      include: [
        'tests/**/*.ts',
        '!tests/**/*.test.ts',  // Exclude test files themselves
      ],
      all: false,  // Disabled since we're not covering Clarity contracts
      // Thresholds disabled for now since main codebase is Clarity
      // Re-enable when TypeScript utilities are added
      enabled: false,
    },
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/test-setup.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
