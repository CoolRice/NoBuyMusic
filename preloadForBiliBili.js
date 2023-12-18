const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('BiliBridge', {
  status: (value) => ipcRenderer.send('bili', { eventName: 'status' , key: value}),
  getLastFidAndBvid: () => ipcRenderer.sendSync('bili', { eventName: 'getLastFidAndBvid'}),
})