
const playElement = document.querySelector('#play');
const pauseElement = document.querySelector('#pause');
const prevElement = document.querySelector('#prev');
const nextElement = document.querySelector('#next');


const minimizeElement = document.querySelector('#minimize');
const closeElement = document.querySelector('#close');

const isMac = (navigator.appVersion.indexOf("Mac")!=-1);
if (isMac) {
    document.querySelector('.window-control').classList.add('isMac');
}
playElement.addEventListener('click', () => {
    Player.pause();
    playElement.style.display = 'none';
    pauseElement.style.display = 'inline';
});

pauseElement.addEventListener('click', () => {
    Player.play();
    playElement.style.display = 'inline';
    pauseElement.style.display = 'none';
});

prevElement.addEventListener('click', () => {
    lineProgressBar.set(0);
    Player.prev();
});

nextElement.addEventListener('click', () => {
    lineProgressBar.set(0);
    Player.next();
});

minimizeElement.addEventListener('click', () => {
    Player.minimize();
});

minimizeElement.addEventListener('click', () => {
    Player.close();
});

var lineProgressBar = new ProgressBar.Line('#progressBar', {
    strokeWidth: 0.5,
    duration: 0,
    color: '#c7cacc',
    trailColor: '#eee',
    trailWidth: 0.5,
    svgStyle: { width: '100%', height: '100%' }
});