/**
 * Applies security patches to node_modules that cannot be upgraded safely.
 * Runs via postinstall so patches survive every `npm install`.
 *
 * Current patches:
 *   js-yaml@3.14.2 — merge-key ReDoS (GHSA-h67p-54hq-rp68)
 *     Deduplicate alias references in <<: [...] sequences so repeated aliases
 *     are no-ops rather than O(K*M) re-processing.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root   = path.resolve(fileURLToPath(import.meta.url), '../../')
const target = path.join(root, 'node_modules/js-yaml/lib/js-yaml/loader.js')

if (!fs.existsSync(target)) {
  console.log('[apply-patches] js-yaml not found — skipping')
  process.exit(0)
}

const original = fs.readFileSync(target, 'utf8')

// Sentinel: patch already applied
if (original.includes('var seen = typeof Set')) {
  console.log('[apply-patches] js-yaml already patched — skipping')
  process.exit(0)
}

const patched = original.replace(
  `if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {`,
  `if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      var seen = typeof Set !== 'undefined' ? new Set() : null;
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        var src = valueNode[index];
        if (seen) {
          if (seen.has(src)) continue;
          seen.add(src);
        }
        mergeMappings(state, _result, src, overridableKeys);
      }
    } else {`
)

if (patched === original) {
  console.warn('[apply-patches] WARNING: js-yaml patch target not found — file may have changed')
  process.exit(0)
}

fs.writeFileSync(target, patched, 'utf8')
console.log('[apply-patches] js-yaml merge-key ReDoS patch applied ✔')
