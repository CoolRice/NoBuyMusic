import { BrowserWindow, app, ipcMain, Tray, Menu, dialog, IpcMainEvent } from "electron";

import Store from 'electron-store';
import path from 'path';
import fs from 'fs';
import { BILI_BASE } from './constants';

import { isLogin, getMusicFav, waitForLogin } from './util';

let mainWindow: BrowserWindow;
let childWindow: BrowserWindow;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function isDev() {
  return process.argv[2] == '--dev';
}

const content = fs.readFileSync(__dirname + '/' + 'bilibiliScript.js').toString();

let isChildWindowShowing = false;

function time2Seconds(str:string) {
  const result = str.split(':');
  if (result.length === 3) {
    return Number(result[0]) * 3600 + Number(result[1]) * 60 + Number(result[2]);
  } else {
    return Number(result[0]) * 60 + Number(result[1]);
  }
}

const store = new Store();

console.log(store.get('currentFid'));
console.log(store.get('currentBvid'));
console.log(store.get('latestUrl'));

async function createWindow () {
  mainWindow = new BrowserWindow({
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
  });
  if (process.platform === 'darwin') {
    mainWindow.setWindowButtonVisibility(true);
  }

  childWindow = new BrowserWindow({
    width: 1000,
    height: 550,
    parent: mainWindow,
    show: isDev(),
    webPreferences: {
      preload: path.join(__dirname, 'preloadForBiliBili.js')
    },
  });

  const latestUrl = store.get('latestUrl') as string;

  let user = await isLogin();
  if (!user) {
    // 未登录
    user = await waitForLogin(childWindow);
  }

  const musicFav = await getMusicFav(user.mid);
  if (!musicFav) {
    const buttonId = dialog.showMessageBoxSync(mainWindow, { message: '请创建"NoBuyMusic"收藏夹并收藏视频后再启动' });
    if (buttonId === 0) {
      app.quit();
    }
  }

  childWindow.loadURL(latestUrl || `${BILI_BASE}/list/ml${musicFav.id}`);
  childWindow.webContents.on('dom-ready', () => {
    childWindow.webContents.executeJavaScript(content);
  });

  // childWindow.once('ready-to-show', () => {
  //   childWindow.show()
  //   // childWindow.hide()
  // })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  if (isDev()) {
    mainWindow.webContents.openDevTools({
      mode: 'detach'
    });
    childWindow.webContents.openDevTools({
      mode: 'detach'
    });
  }

  let prevTitle = '&nbsp;';
  let prevVolume: number = -1;
  const handleMainPlayEvent = (event:IpcMainEvent, value: any) => {

    if ('minimize' === value.eventName) {
      mainWindow.minimize();
      return;
    }
    if ('close' === value.eventName) {
      mainWindow.close();
      return;
    }

    if ('SET_VOLUME' === value.eventName) {
      const scriptString = `window.player.setVolume(${value.volumeValue});`;
      childWindow.webContents.executeJavaScript(scriptString);
      return;
    }

    if ('MUTE' === value.eventName) {
      childWindow.webContents.executeJavaScript('window.player.getVolume();')
        .then((volume) =>{
          prevVolume = volume;
          childWindow.webContents.executeJavaScript('window.player.setVolume(0);');
        });
      return;
    }

    if ('UNMUTE' === value.eventName) {
      const targetVolume = prevVolume < 0 ? 0.3 : prevVolume;
      const scriptString = `window.player.setVolume(${targetVolume});`;
      childWindow.webContents.executeJavaScript(scriptString);
      return;
    }

    if (['PAUSE', 'PLAY'].includes(value.eventName)) {
      childWindow.webContents.executeJavaScript(`window.player.${value.eventName === 'PAUSE' ? 'pause' : 'play'}();`);
    } else if (value.eventName === 'NEXT') {
      childWindow.webContents.executeJavaScript(`window.player.next();`);
    } else if (value.eventName === 'PREV') {
      childWindow.webContents.executeJavaScript(`window.player.prev();`);
    }
  };

  ipcMain.on('player', handleMainPlayEvent);

  const handleBiliEvent = (event: IpcMainEvent, value: any) => {
    if (value.eventName === 'status') {
      const { auth, page, play } = value.key;
      if (auth.isAuthenticated && isChildWindowShowing && !isDev()) {
        isChildWindowShowing = false;
        childWindow.hide();
      }
      if (!auth.isAuthenticated && !isChildWindowShowing) {
        isChildWindowShowing = true;
        childWindow.show();
      }
      if (play.currentFid) {
        store.set('currentFid', play.currentFid);
      }
      if (play.currentBvid) {
        store.set('currentBvid', play.currentBvid);
      }
      if (page.href) {
        store.set('latestUrl', page.href);
      }

      let progress = 0;
      if (play.currentTime) {
        progress = time2Seconds(play.currentTime) / time2Seconds(play.totalTime);
      }
      const title = play.title || '&nbsp;';
      let updateStr = '';
      if (prevTitle != title) {
        prevTitle = title;
        updateStr = `
          document.querySelector('#title').innerHTML = '${title}';
        `;
      }

      updateStr += updateStr + `
        document.querySelector('#currentTime').innerHTML = '${play.currentTime || '00:00'}';
        document.querySelector('#totalTime').innerHTML = '${play.totalTime || '00:00'}';
        lineProgressBar.set(${progress});
        volumeBar.set(${play.volume});
        if (${play.isMuted}) {
          document.querySelector('#mute').classList.remove('hidden');
          document.querySelector('#speaker').classList.add('hidden');
        } else {
          document.querySelector('#mute').classList.add('hidden');
          document.querySelector('#speaker').classList.remove('hidden');
        }
        // playListElement = document.querySelector('#play-list');
        // playListElement.innerHTML = ${JSON.stringify(play.list)}.map((item, index) => {
        //   return '<div class="item">' + item + '</div>';
        // }).join('');
      `;
      mainWindow?.webContents.executeJavaScript(updateStr);
    }
  };

  ipcMain.on('bili', handleBiliEvent);
}

app.whenReady().then(async () => {
  await createWindow();

  // https://www.iconarchive.com/show/yosemite-flat-icons-by-dtafalonso/Music-icon.html
  const tray = new Tray(__dirname + '/assets/img/music.ico');
  const contextMenu = Menu.buildFromTemplate([
    { label: '退出登录', click: async () => {
      childWindow.webContents.session.clearStorageData();
      childWindow.loadURL(BILI_BASE);
      store.set('latestUrl', '');
      childWindow.show();
      let user = await isLogin();
      if (!user) {
        // 未登录
        user = await waitForLogin(childWindow);
      }

      const musicFav = await getMusicFav(user.mid);
      if (!musicFav) {
        const buttonId = dialog.showMessageBoxSync(mainWindow, { message: '请创建"NoBuyMusic"收藏夹并收藏视频后再启动' });
        if (buttonId === 0) {
          app.quit();
        }
      }
      childWindow.loadURL(`${BILI_BASE}/list/ml${musicFav.id}`);
    }},
    { label: '关闭应用', click: () => {
      mainWindow.close();
    }}
  ]);
  tray.setToolTip('No Buy Music');
  tray.setContextMenu(contextMenu);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      childWindow.destroy();
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

