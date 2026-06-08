import { defineConfig } from 'tsdown'
import solid from 'rolldown-plugin-solid'

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/curves.ts'],
    outDir: 'dist/',
    format: 'esm',
    platform: 'browser',
    target: 'esnext',
    clean: true,
    dts: true,
    plugins: [solid({ solid: { generate: 'dom' } })],
  },
  {
    entry: ['src/index.ts', 'src/curves.ts'],
    outDir: 'dist/',
    format: 'esm',
    platform: 'browser',
    target: 'esnext',
    outExtensions: () => ({ js: '.jsx' }),
    jsx: 'preserve',
  },
])
