import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  // Bundle everything — no relative import extension issues
  bundle: true,
  // Don't bundle native Node modules or large deps that have issues with bundling
  external: [
    'pg-native',
    'bufferutil',
    'utf-8-validate',
    'mock-aws-s3',
    'aws-sdk',
    'nock',
  ],
  // Keep __dirname working via shims
  shims: true,
})
