import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('BiliBridge', {
  status: (value: object) => ipcRenderer.send('bili', { eventName: 'status' , key: value}),
  getLastFidAndBvid: () => ipcRenderer.sendSync('bili', { eventName: 'getLastFidAndBvid'}),
});