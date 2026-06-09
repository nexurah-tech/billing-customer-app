const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const http = require('http')

let mainWindow
let nextServer

const PORT = 3120

function waitForServer(url, retries = 30, delay = 500) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get(url, (res) => {
        resolve()
      }).on('error', () => {
        if (retries-- > 0) {
          setTimeout(attempt, delay)
        } else {
          reject(new Error('Next.js server did not start in time'))
        }
      })
    }
    attempt()
  })
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    const isDev = !app.isPackaged

    if (isDev) {
      // In dev, assume `next dev` is already running on port 3000
      resolve(3000)
      return
    }

    // In production, start the bundled Next.js standalone server
    const serverPath = path.join(process.resourcesPath, 'app', 'server.js')
    const env = {
      ...process.env,
      PORT: String(PORT),
      NODE_ENV: 'production',
      // Point static/public assets to the bundled resource paths
      NEXT_PUBLIC_BASE_PATH: '',
    }

    nextServer = spawn(process.execPath, [serverPath], {
      env,
      cwd: path.join(process.resourcesPath, 'app'),
    })

    nextServer.stdout.on('data', (data) => {
      console.log('[Next.js]', data.toString())
    })

    nextServer.stderr.on('data', (data) => {
      console.error('[Next.js err]', data.toString())
    })

    nextServer.on('error', reject)

    waitForServer(`http://localhost:${PORT}`)
      .then(() => resolve(PORT))
      .catch(reject)
  })
}

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

  mainWindow.loadURL(`http://localhost:${port}`)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(`http://localhost:${port}`)) {
      return { action: 'allow' }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  try {
    const port = await startNextServer()
    createWindow(port)
  } catch (err) {
    console.error('Failed to start Next.js server:', err)
    app.quit()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      startNextServer().then(createWindow)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', () => {
  if (nextServer) {
    nextServer.kill()
  }
})
