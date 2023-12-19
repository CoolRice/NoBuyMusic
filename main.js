const { app, BrowserWindow, ipcMain, } = require('electron');
const Store = require('electron-store');
const path = require('path');
const fs = require('fs');

function isDev() {
  return process.argv[2] == '--dev';
}

let content = fs.readFileSync('./bilibiliScript.js');
let isChildWindowShowing = false;

function time2Seconds(str) {
  const result = str.split(':');
  if (result.length === 3) {
    return Number(result[0]) * 3600 + Number(result[1]) * 60 + Number(result[2]);
  } else {
    return Number(result[0]) * 60 + Number(result[1]);
  }
}

const store = new Store();

console.log(store.get('currentFid'))
console.log(store.get('currentBvid'))

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 350,
    height: 125,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: false,
    frame: false,
    autoHideMenuBar: true,
    fullscreen: false,
    maximizable: false,
  })
  if (process.platform === 'darwin') {
    mainWindow.setWindowButtonVisibility(true)
  }

  const child = new BrowserWindow({
    width: 1000,
    height: 550,
    parent: mainWindow,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preloadForBiliBili.js')
    },
  });

  child.loadURL('https://www.bilibili.com')
  child.webContents.on('dom-ready', () => {
    child.webContents.executeJavaScript(content)
  });

  // child.once('ready-to-show', () => {
  //   child.show()
  //   // child.hide()
  // })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  if (isDev()) {
    mainWindow.webContents.openDevTools({
      mode: 'detach'
    });
    child.webContents.openDevTools({
      mode: 'detach'
    });
  }

  const handleMainPlayEvent = (event, value) => {
    let targetEleSelector;
    if ('minimize' === value.eventName) {
      mainWindow.minimize();
      return;
    }
    if ('close' === value.eventName) {
      mainWindow.close();
      return;
    }
    if (['PAUSE', 'PLAY'].includes(value.eventName)) {
      targetEleSelector = '.bpx-player-control-wrap .bpx-player-ctrl-play';
    } else if (value.eventName === 'MUTE') {
      targetEleSelector = '.bpx-player-control-wrap .bpx-player-ctrl-volume';
    } else if (value.eventName === 'NEXT') {
      targetEleSelector = '.bpx-player-control-wrap .bpx-player-ctrl-next';
    } else if (value.eventName === 'PREV') {
      targetEleSelector = '.bpx-player-control-wrap .bpx-player-ctrl-prev';
    }
    const scriptString = `document.querySelector('${targetEleSelector}').click();`

    child.webContents.executeJavaScript(scriptString);
  }

  ipcMain.on('player', handleMainPlayEvent);

  const handleBiliEvent = (event, value) => {
    if (value.eventName === 'status') {
      const { auth, page, play } = value.key;
      if (auth.isAuthenticated && isChildWindowShowing) {
        isChildWindowShowing = false;
        child.hide()
      }
      if (!auth.isAuthenticated && !isChildWindowShowing) {
        isChildWindowShowing = true;
        child.show()
      }
      if (play.currentFid) {
        store.set('currentFid', play.currentFid);
      }
      if (play.currentBvid) {
        store.set('currentBvid', play.currentBvid);
      }

      let progress = 0;
      if (play.currentTime) {
        progress = time2Seconds(play.currentTime) / time2Seconds(play.totalTime);
      }
      let title = play.title;
      // if (play?.title?.indexOf('《') >= 0 && play.title.indexOf('《') < play.title.indexOf('》')) {
      //   title = play.title.split('《')[1].split('》')[0];
      // }
      const updateStr = `
        document.querySelector('#title').innerHTML = '${title || '&nbsp;'}';
        var duration = 1000;
        if (!lineProgressBar.value()) {
          duration = 0;
        }
        document.querySelector('#currentTime').innerHTML = '${play.currentTime || '&nbsp;'}';
        document.querySelector('#totalTime').innerHTML = '${play.totalTime || '&nbsp;'}';
        lineProgressBar.animate(${progress}, {
          duration,
        });
        // playListElement = document.querySelector('#play-list');
        // playListElement.innerHTML = ${JSON.stringify(play.list)}.map((item, index) => {
        //   return '<div class="item">' + item + '</div>';
        // }).join('');
      `
      mainWindow.webContents.executeJavaScript(updateStr);
    } else if (value.eventName === 'getLastFidAndBvid') {
      event.returnValue = {
        lastFid: store.get('currentFid'),
        lastBvid: store.get('currentBvid'),
      }
    }
  }

  ipcMain.on('bili', handleBiliEvent);
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

