const fs = require('fs')
const path = require('path')

module.exports = async function (context) {
  const appOutDir = context.appOutDir
  const resourcesDir = path.join(appOutDir, 'resources')
  const destNodeModules = path.join(resourcesDir, 'app', 'node_modules')
  const srcNodeModules = path.join(context.packager.projectDir, '.next', 'standalone', 'node_modules')

  console.log(`\n[afterPack Hook] Copying node_modules from standalone...`)
  console.log(`  Source: ${srcNodeModules}`)
  console.log(`  Destination: ${destNodeModules}`)

  if (!fs.existsSync(srcNodeModules)) {
    console.warn(`  [Warning] Source node_modules not found at ${srcNodeModules}`)
    return
  }

  try {
    fs.mkdirSync(path.dirname(destNodeModules), { recursive: true })
    fs.cpSync(srcNodeModules, destNodeModules, { recursive: true })
    console.log(`  ✓ node_modules copied successfully to unpacked resources!`)
  } catch (err) {
    console.error(`  ✗ Failed to copy node_modules: ${err.message}`)
    throw err
  }
}

module.exports.default = module.exports
