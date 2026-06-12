import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['iife'],
  globalName: 'Cognity',
  outExtension: () => ({ js: '.js' }),
  clean: true,
  minify: true,
  // No dts — browser scripts don't need type declarations
})
