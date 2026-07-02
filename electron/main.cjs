const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const { getOcrEngineInfo, recognizeBudgetImage } = require('./ocr-engine.cjs')

const appTitle = '三峰整装财务收支管理系统'

function getAssetPath(...segments) {
  return path.join(__dirname, '..', ...segments)
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1180,
    minHeight: 760,
    title: appTitle,
    autoHideMenuBar: true,
    backgroundColor: '#eef3f1',
    icon: getAssetPath('public', 'sanfeng-official-mark.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  win.loadFile(getAssetPath('dist', 'index.html'))

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })
}

app.setName(appTitle)

ipcMain.handle('sanfeng-ocr:engine-info', () => getOcrEngineInfo())

ipcMain.handle('sanfeng-ocr:recognize-budget-image', async (_event, payload) => recognizeBudgetImage(payload))

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
