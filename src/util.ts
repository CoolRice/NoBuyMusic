import { BrowserWindow, session } from "electron";
import User from "./entities/User";

// function waitForElm(selector) {
//     return new Promise(resolve => {
//         if (document.querySelector(selector)) {
//             return resolve(document.querySelector(selector));
//         }

//         const observer = new MutationObserver(mutations => {
//             if (document.querySelector(selector)) {
//                 resolve(document.querySelector(selector));
//                 observer.disconnect();
//             }
//         });

//         observer.observe(document.body, {
//             childList: true,
//             subtree: true
//         });
//     });
// }
// // To use it:

// waitForElm('.some-class').then((elm) => {
//     console.log('Element is ready');
//     console.log(elm.textContent);
// });
// // Or with async/await:

// const elm = await waitForElm('.some-class');


// function time2Seconds(str) {
//     const result = str.split(':');
//     if (result.length === 3) {
//         return result[0] * 3600 + result[1] * 60 + result[2];
//     } else {
//         return result[0] * 60 + result[1];
//     }
// }

async function isLogin(): Promise<User | null> {
    const res = await session.defaultSession.fetch('https://api.bilibili.com/x/web-interface/nav');
    const value = await res.json();
    const { mid, uname } = value.data;
    if (value.code === 0) {
        const user = new User(mid, uname, true);
        return user;
    }
    return null;
}

async function getMusicFav(mid: number): Promise<any> {
    const res = await session.defaultSession.fetch(`https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${mid}`);
    const value = await res.json();
    const musicFav = value?.data?.list.find((item: any) => item.title === 'NoBuyMusic');
    return musicFav;
}

async function waitForLogin(childWindow: BrowserWindow) {
    return new Promise<User>((resolve) => {
        let user;
        childWindow.loadURL('https://www.bilibili.com');
        childWindow.show();
        const timeId = setInterval(async () => {
            user = await isLogin();
            if (user) {
                resolve(user);
                childWindow.hide();
                clearInterval(timeId);
            }
        }, 1000);
    });

}

export {
    // time2Seconds,
    isLogin,
    getMusicFav,
    waitForLogin
};