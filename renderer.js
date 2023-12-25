
const playElement = document.querySelector('#play');
const pauseElement = document.querySelector('#pause');
const prevElement = document.querySelector('#prev');
const nextElement = document.querySelector('#next');


const minimizeElement = document.querySelector('#minimize');
const closeElement = document.querySelector('#close');

const isMac = (navigator.appVersion.indexOf("Mac")!=-1);
if (isMac) {
    document.querySelector('.window-control').classList.add('isMac');
    document.querySelector('#title').classList.add('isMac');
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

closeElement.addEventListener('click', () => {
    Player.close();
});

const lineProgressBar = new ProgressBar.Line('#progressBar', {
    strokeWidth: 0.5,
    duration: 0,
    color: '#c7cacc',
    trailColor: '#eee',
    trailWidth: 0.5,
    svgStyle: { width: '100%', height: '100%' }
});

const volumeBar = new ProgressBar.Line('#volumeBar', {
    strokeWidth: 2,
    duration: 0,
    color: '#626b72',
    trailColor: '#34353c',
    trailWidth: 0.5,
    svgStyle: { width: '100%', height: '100%' }
});

const volumeBarEle = document.querySelector('#volumeBar');
volumeBarEle.addEventListener('click', (e)=>{
    const rect = volumeBarEle.getBoundingClientRect();
    Player.setVolume((e.pageX - rect.left) / rect.width);
});

const speakerEle = document.querySelector('#speaker');
const muteEle = document.querySelector('#mute');

speakerEle.addEventListener('click', (e)=>{
    speakerEle.classList.add('hidden');
    muteEle.classList.remove('hidden');
    Player.mute();
});
muteEle.addEventListener('click', (e)=>{
    speakerEle.classList.remove('hidden');
    muteEle.classList.add('hidden');
    Player.unmute();
});
