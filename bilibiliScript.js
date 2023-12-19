function getPlayUrl() {

}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

setInterval(async () => {
    // landing page
    const auth = {};
    const isLandingPage = document.querySelector('.bili-header__channel');
    const avatarElement = document.querySelector('.header-entry-avatar');
    auth.isAuthenticated = !!avatarElement;
    if (isLandingPage) {
        if (!auth.isAuthenticated) {
            window.scrollTo(document.body.scrollWidth, 0);
            document.querySelector('.header-login-entry')?.click();
            // return;
        } else {
            const profileUrl = avatarElement.href;
            window.location.href = profileUrl + '/favlist';
        }
    }

    // fav list page
    const isFavListPage = document.querySelector('.fav-list-container');
    if (isFavListPage){
        const NoBuyMusicElement = document.querySelector('a[title="NoBuyMusic"]');
        if (NoBuyMusicElement) {
            const searchParams = new URLSearchParams(NoBuyMusicElement.href.substring(NoBuyMusicElement.href.indexOf('?')));
            const fid = searchParams.get('fid');
            let playUrl = 'https://www.bilibili.com/list/ml' + fid;
            const { lastFid, lastBvid } = BiliBridge.getLastFidAndBvid();
            if (lastFid === fid) {
                playUrl += '?bvid=' + lastBvid;
            }
            window.location.href = playUrl;

        } else {
            alert('Please Create favlist "NoBuyMusic"')
        }
    }

    // play music page
    const play = {};
    const isPlayMusicPage = document.querySelector('.playlist-container');
    if (isPlayMusicPage) {
        play.title = document.querySelector('.video-title')?.innerText || '',
        play.currentTime = document.querySelector('.bpx-player-ctrl-time-current')?.innerText || '',
        play.totalTime = document.querySelector('.bpx-player-ctrl-time-duration')?.innerText || '',
        play.list = JSON.parse(`["${document.querySelector('.action-list-inner')?.innerText.replaceAll('\n', '","') }"]`)
            .filter(function (item, index) {
                return (index % 2 === 0);
            });
        play.currentFid = window.location.href.split('?')[0].split('ml')[1];
        const searchParams = new URLSearchParams(window.location.href.substring(window.location.href.indexOf('?')));
        play.currentBvid = searchParams.get('bvid');
    }

    const page = {};
    page.href = location.href;
    page.hash = location.hash;
    page.title = document.title;

    const status = {auth, play, page}

    BiliBridge.status(status);
}, 1000);