const { app, BrowserWindow, shell, Menu, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')
const http = require('http')

let mainWindow
let nextServer

// ─── Logging Setup ─────────────────────────────────────────────────────────────
const logFilePath = path.join(app.getPath('userData'), 'app.log')
try {
  fs.writeFileSync(logFilePath, `--- NexBilling Startup at ${new Date().toISOString()} ---\n`, 'utf8')
} catch (e) {}

function logToFile(level, ...args) {
  const msg = args.map(arg => {
    if (arg instanceof Error) return arg.stack || arg.message
    if (typeof arg === 'object') {
      try { return JSON.stringify(arg) } catch (e) { return String(arg) }
    }
    return String(arg)
  }).join(' ')
  try {
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} ${level} ${msg}\n`, 'utf8')
  } catch (e) {}
}

const originalLog = console.log
const originalError = console.error

console.log = (...args) => {
  originalLog.apply(console, args)
  logToFile('[INFO]', ...args)
}

console.error = (...args) => {
  originalError.apply(console, args)
  logToFile('[ERROR]', ...args)
}


// ─── Environment Loading ───────────────────────────────────────────────────────

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {}
  try {
    const content = fs.readFileSync(envPath, 'utf8')
    const env = {}
    content.split(/\r?\n/).forEach(line => {
      line = line.trim()
      if (!line || line.startsWith('#')) return
      const delimiterIndex = line.indexOf('=')
      if (delimiterIndex > -1) {
        const key = line.substring(0, delimiterIndex).trim()
        let val = line.substring(delimiterIndex + 1).trim()
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1)
        }
        env[key] = val
      }
    })
    return env
  } catch (e) {
    console.error('Error loading env file:', e)
    return {}
  }
}

function setupEnvironment() {
  if (!app.isPackaged) return

  const userDataPath = app.getPath('userData')
  const envFilePath = path.join(userDataPath, '.env')

  // On first run, create a blank override .env so the user knows where to add
  // custom environment variables. The real credentials (MongoDB Atlas URI, JWT
  // secret, etc.) are already bundled inside resources/app/.env by the build.
  if (!fs.existsSync(envFilePath)) {
    try {
      fs.mkdirSync(userDataPath, { recursive: true })
      fs.writeFileSync(
        envFilePath,
        [
          '# NexBill – User Environment Overrides',
          '# Add variables here to override the built-in configuration.',
          '# Example:',
          '#   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nexbill',
          '#   JWT_SECRET=my-custom-secret',
          '',
        ].join('\n'),
        'utf8'
      )
      console.log('Created override .env template at:', envFilePath)
    } catch (e) {
      console.error('Failed to create .env template:', e)
    }
  }

  // Apply any user-supplied overrides (only fills gaps, never overrides built-in values)
  const fileEnv = loadEnvFile(envFilePath)
  for (const key of Object.keys(fileEnv)) {
    if (!process.env[key]) process.env[key] = fileEnv[key]
  }
}

// ─── Find a usable Node.js binary ─────────────────────────────────────────────

function findNodeBinary() {
  if (app.isPackaged) {
    // In production, we use the Electron executable itself with ELECTRON_RUN_AS_NODE=1.
    // This removes the dependency on a globally installed Node.js on the user's machine.
    return process.execPath
  }
  return 'node'
}

// ─── Server lifecycle ──────────────────────────────────────────────────────────

const PORT = 3120

function waitForServer(url, retries = 40, delay = 500) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(url, (res) => {
        res.resume()   // consume response so socket is freed
        resolve()
      })
      req.on('error', () => {
        if (retries-- > 0) {
          setTimeout(attempt, delay)
        } else {
          reject(new Error(`Server at ${url} did not become ready in time`))
        }
      })
      req.setTimeout(2000, () => {
        req.destroy()
        if (retries-- > 0) setTimeout(attempt, delay)
        else reject(new Error(`Server at ${url} timed out`))
      })
    }
    attempt()
  })
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    const isDev = !app.isPackaged

    // ── DEV ─────────────────────────────────────────────────────────────────
    if (isDev) {
      http.get('http://localhost:3000', (res) => {
        console.log('Next.js dev server already running on :3000')
        res.resume()
        resolve(3000)
      }).on('error', () => {
        console.log('Spawning Next.js dev server…')
        const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
        nextServer = spawn(cmd, ['next', 'dev'], {
          cwd: path.join(__dirname, '..'),
          env: { ...process.env },
          shell: true,
        })
        nextServer.stdout.on('data', d => console.log('[Next.js Dev]', d.toString()))
        nextServer.stderr.on('data', d => console.error('[Next.js Dev err]', d.toString()))
        nextServer.on('error', reject)
        waitForServer('http://localhost:3000').then(() => resolve(3000)).catch(reject)
      })
      return
    }

    // ── PRODUCTION ──────────────────────────────────────────────────────────
    const serverPath   = path.join(process.resourcesPath, 'app', 'server.js')
    const resourcesDir = path.join(process.resourcesPath, 'app')

    if (!fs.existsSync(serverPath)) {
      return reject(new Error(`server.js not found at: ${serverPath}`))
    }

    const nodeBinary = findNodeBinary()
    console.log('Using Node binary:', nodeBinary)

    // Load the bundled .env from resources/app/.env so the Atlas URI and
    // other credentials are available to the spawned server process.
    const bundledEnvPath = path.join(resourcesDir, '.env')
    const bundledEnv = loadEnvFile(bundledEnvPath)
    console.log('Bundled env keys:', Object.keys(bundledEnv).join(', '))

    const env = {
      ...bundledEnv,          // bundled credentials first (Atlas URI, JWT_SECRET, etc.)
      ...process.env,         // system env can override
      PORT:      String(PORT),
      NODE_ENV:  'production',
      // Help Node resolve modules from the standalone bundle's node_modules
      NODE_PATH: path.join(resourcesDir, 'node_modules'),
      NEXT_PUBLIC_BASE_PATH: '',
    }

    if (nodeBinary === process.execPath) {
      env.ELECTRON_RUN_AS_NODE = '1'
    }

    // Collect stderr so we can show the real crash reason in the error dialog
    const stderrLines = []
    let rejected = false
    const rejectOnce = (err) => { if (!rejected) { rejected = true; reject(err) } }

    nextServer = spawn(nodeBinary, [serverPath], {
      cwd: resourcesDir,
      env,
      stdio: 'pipe',
    })

    nextServer.stdout.on('data', d => console.log('[Next.js]', d.toString()))
    nextServer.stderr.on('data', d => {
      const txt = d.toString()
      console.error('[Next.js err]', txt)
      stderrLines.push(txt.trim())
      if (stderrLines.length > 20) stderrLines.shift()   // keep last 20 lines
    })
    nextServer.on('error', (err) => {
      console.error('Failed to spawn Next.js server:', err)
      rejectOnce(err)
    })
    nextServer.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        const detail = stderrLines.slice(-10).join('\n') || '(no stderr captured)'
        console.error(`Next.js server exited with code ${code}:\n${detail}`)
        rejectOnce(new Error(`Next.js server crashed (exit code ${code}).\n\n${detail}`))
      }
    })

    waitForServer(`http://localhost:${PORT}`)
      .then(() => resolve(PORT))
      .catch(rejectOnce)
  })
}

// ─── Window ────────────────────────────────────────────────────────────────────

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '..', 'public', 'logo.ico'),
    show: false,
  })

  Menu.setApplicationMenu(null)

  mainWindow.loadURL(`http://localhost:${port}`)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(`http://localhost:${port}`)) return { action: 'allow' }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

// ─── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  setupEnvironment()

  try {
    const port = await startNextServer()
    createWindow(port)
  } catch (err) {
    console.error('Startup error:', err)
    const detail = err && err.message ? err.message : String(err)
    dialog.showErrorBox(
      'NexBilling – Failed to start',
      `The application server could not start.\n\n${detail}\n\nPlease ensure Node.js is installed and MongoDB is running.`
    )
    app.quit()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startNextServer().then(createWindow).catch(console.error)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('quit', () => {
  if (nextServer) {
    try { nextServer.kill() } catch (_) {}
  }
})
