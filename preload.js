const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('Player', {
  pause: () => ipcRenderer.send('player', {eventName: 'PAUSE'}),
  play: () => ipcRenderer.send('player', {eventName: 'PLAY'}),
  mute: () => ipcRenderer.send('player', {eventName: 'MUTE'}),
  prev: () => ipcRenderer.send('player', {eventName: 'PREV'}),
  next: () => ipcRenderer.send('player', {eventName: 'NEXT'}),
  minimize: () => ipcRenderer.send('player', { eventName: 'minimize'}),
  close: () => ipcRenderer.send('player', {eventName: 'close'}),
});