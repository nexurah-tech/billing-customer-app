/**
 * prepare-standalone.mjs
 *
 * Run after `next build` and before `electron-builder`.
 * 
 * Next.js with Turbopack does NOT reliably copy all required packages into
 * .next/standalone/node_modules/ (notably the `next` package itself).
 * This script bridges that gap by copying any package that:
 *   1. Is listed as a dependency in the root package.json, AND
 *   2. Exists in the root node_modules/, AND
 *   3. Is NOT yet present in .next/standalone/node_modules/
 */

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const standaloneModules = join(root, '.next', 'standalone', 'node_modules')
const projectModules    = join(root, 'node_modules')

// Ensure the target directory exists
mkdirSync(standaloneModules, { recursive: true })

// Read all declared deps (prod + dev — we want next, electron-related, etc.)
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const allDeps = Object.keys({
  ...(pkg.dependencies   || {}),
  ...(pkg.devDependencies || {}),
})

// These are always required to run the standalone Next.js server,
// regardless of file tracing results.
const critical = [
  'next',
  '@next/env',
  '@swc/helpers',
]

// Union: critical first, then everything declared in package.json
const packages = [...new Set([...critical, ...allDeps])]

let copied  = 0
let skipped = 0
let missing = 0

for (const name of packages) {
  // Handle scoped packages like @next/env → node_modules/@next/env
  const src  = join(projectModules, name)
  const dest = join(standaloneModules, name)

  if (!existsSync(src)) {
    missing++
    continue
  }

  const isCritical = critical.includes(name)
  if (existsSync(dest)) {
    if (isCritical) {
      console.log(`  ! force-overwriting critical package: ${name}`)
      try {
        rmSync(dest, { recursive: true, force: true })
      } catch (e) {
        console.warn(`  ✗ failed to remove old critical package: ${name} — ${e.message}`)
      }
    } else {
      skipped++
      continue   // already copied by file tracing — don't overwrite
    }
  }

  try {
    // Ensure parent directory for scoped packages (e.g. @next/)
    mkdirSync(dirname(dest), { recursive: true })
    cpSync(src, dest, { recursive: true, errorOnExist: false })
    console.log(`  ✓ copied: ${name}`)
    copied++
  } catch (e) {
    console.warn(`  ✗ failed: ${name} — ${e.message}`)
  }
}

// Copy .env.local (or .env) to .next/standalone/.env
const envSrc = existsSync(join(root, '.env.local')) ? join(root, '.env.local') : join(root, '.env')
const envDest = join(root, '.next', 'standalone', '.env')
if (existsSync(envSrc)) {
  try {
    cpSync(envSrc, envDest, { force: true })
    console.log(`\n  ✓ env file copied from ${envSrc} to ${envDest}`)
  } catch (e) {
    console.warn(`\n  ✗ failed to copy env file: ${e.message}`)
  }
} else {
  console.log('\n  ! no .env.local or .env file found to bundle')
}

console.log(`\nStandalone node_modules prepared:`)
console.log(`  ${copied}  packages copied`)
console.log(`  ${skipped} packages already present (file tracing)`)
console.log(`  ${missing} packages not found in root node_modules (skipped)`)
