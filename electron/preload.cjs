const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('sanfengOcr', {
  getEngineInfo: () => ipcRenderer.invoke('sanfeng-ocr:engine-info'),
  recognizeBudgetImage: (payload) => ipcRenderer.invoke('sanfeng-ocr:recognize-budget-image', payload),
})
