/**
 * Shared TypeScript types for element selectors used by the Tours feature.
 * The actual selector-generation logic runs client-side in the SDK (packages/sdk/src/picker.ts).
 */

export interface ElementSelector {
  primary: string
  fallbacks: string[]
}
