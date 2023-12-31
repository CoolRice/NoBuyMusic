/*global document, setInterval, window, URLSearchParams, location, BiliBridge*/

setInterval(async () => {
    const auth = {};
    const avatarElement = document.querySelector('.header-entry-avatar');
    auth.isAuthenticated = !!avatarElement;

    // play music page
    const play = {};
    const page = {};
    const isPlayMusicPage = document.querySelector('.playlist-container');
    if (isPlayMusicPage) {
        play.title = document.querySelector('.video-title')?.innerText || '';
        play.currentTime = document.querySelector('.bpx-player-ctrl-time-current')?.innerText || '';
        if (play.currentTime === '00:10' && window.player.getQuality().nowQ != 16) {
            window.player.requestQuality(16);
        }
        play.totalTime = document.querySelector('.bpx-player-ctrl-time-duration')?.innerText || '';
        play.list = JSON.parse(`["${document.querySelector('.action-list-inner')?.innerText.replaceAll('\n', '","') }"]`)
            .filter(function (item, index) {
                return (index % 2 === 0);
            });
        play.currentFid = window.location.href.split('?')[0].split('ml')[1];
        const searchParams = new URLSearchParams(window.location.href.substring(window.location.href.indexOf('?')));
        play.currentBvid = searchParams.get('bvid');
        play.volume = window.player.getVolume();
        play.isMuted = window.player.isMuted();

        page.href = location.href;
        page.hash = location.hash;
        page.title = document.title;
    }



    const status = {auth, play, page};

    BiliBridge.status(status);
}, 500);