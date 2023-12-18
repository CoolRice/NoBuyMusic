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
// To use it:

waitForElm('.some-class').then((elm) => {
    console.log('Element is ready');
    console.log(elm.textContent);
});
// Or with async/await:

const elm = await waitForElm('.some-class');


function time2Seconds(str) {
    const result = str.split(':');
    if (result.length === 3) {
        return result[0] * 3600 + result[1] * 60 + result[2];
    } else {
        return result[0] * 60 + result[1];
    }
}

module.exports = {
    time2Seconds
}