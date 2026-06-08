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
    server: {
      deps: {
        inline: [/@corvu/],
      },
    },
  },
})
