import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['tests/**/*.test.ts'],
        // Each test file spins up a fresh jsdom environment, so run files
        // sequentially — spawning N workers in parallel is slow and flaky
        // on constrained machines.
        fileParallelism: false,
    },
});