import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  plugins: [solid({ hot: false, solid: { generate: 'dom' } })],
  resolve: {
    alias: {
      '@src': resolve(__dirname, 'packages/peculiar-charts/src'),
    },
  },
  test: {
    include: ['packages/**/*.test.{ts,tsx}'],
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
    server: {
      deps: {
        inline: [/@corvu/],
      },
    },
    coverage: {
      provider: 'v8',
      include: ['packages/peculiar-charts/src/**/*.{ts,tsx}'],
      exclude: [
        'packages/peculiar-charts/src/**/__tests__/**',
        'packages/peculiar-charts/src/**/*.test.{ts,tsx}',
        'packages/peculiar-charts/src/**/*.d.ts',
      ],
    },
  },
})
