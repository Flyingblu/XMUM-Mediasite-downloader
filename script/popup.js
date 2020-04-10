import { retriveURL } from './helpers.js';

function handleErr(error) {
    chrome.storage.local.set({ 'error': error.message }, function () {
        window.location.href = chrome.extension.getURL('error.html');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['link_btn_enabled'], function (results) {
        if (results['link_btn_enabled']) document.getElementById('linkBtnCheckbox').checked = true;
    });

    document.getElementById('getLink').addEventListener('click', function () {

        chrome.permissions.request(
            { origins: ['https://l.xmu.edu.my/', 'https://mymedia.xmu.edu.cn/', 'https://xmum.mediasitecloud.jp/'] },
            function (granted) {
                if (granted) {
                    chrome.tabs.query({ currentWindow: true, active: true }, function (currentTabs) {

                        var url = currentTabs[0].url;
                        if (!url.includes('https://l.xmu.edu.my/mod/mediasite/view.php?id=')) {
                            window.location.href = chrome.extension.getURL('notice.html');
                        }
                        chrome.storage.local.set({ 'video_id': /id=(\d+)/.exec(url)[1] }, function () {
                            window.location.href = chrome.extension.getURL('link.html');
                        });
                    });
                } else {
                    handleErr(new Error("Permission is needed to access data on the website!\nPlease try again. "));
                }
            });

    }, false);

    document.getElementById('directDownload').addEventListener('click', function () {

        chrome.permissions.request(
            { origins: ['https://l.xmu.edu.my/', 'https://mymedia.xmu.edu.cn/', 'https://xmum.mediasitecloud.jp/'] },
            function (granted) {
                if (granted) {
                    document.getElementById('buttonsContainer').classList.add('hide');
                    document.getElementById('loadingIndicator').classList.remove('hide');

                    chrome.tabs.query({ currentWindow: true, active: true }, function (currentTabs) {

                        var url = currentTabs[0].url;
                        if (!url.includes('https://l.xmu.edu.my/mod/mediasite/view.php?id=')) {
                            window.location.href = chrome.extension.getURL('notice.html');
                        }
                        retriveURL(/id=(\d+)/.exec(url)[1], function (url, title) {
                            chrome.downloads.download({ url: url, filename: title });
                            chrome.storage.local.set({ 'success': 'Your download will start shortly...' }, function () {
                                window.location.href = chrome.extension.getURL('success.html');
                            });
                        }, handleErr);
                    });

                } else {
                    alert("Permission is needed to access data on the website!\nPlease try again. ");
                }
            });

    }, false);

    document.getElementById('fixAuth').addEventListener('click', function () {

        chrome.permissions.request(
            { origins: ['https://xmum.mediasitecloud.jp/', 'https://mymedia.xmu.edu.cn/'] },
            function (granted) {
                if (granted) {

                    chrome.cookies.getAll({ url: "https://xmum.mediasitecloud.jp/" }, function (cookies) {
                        cookies.forEach(function (cookie) {
                            chrome.cookies.remove({ url: "https://xmum.mediasitecloud.jp/", name: cookie.name });
                        });

                        chrome.cookies.getAll({ url: "https://mymedia.xmu.edu.cn/" }, function (cookies) {
                            cookies.forEach(function (cookie) {
                                chrome.cookies.remove({ url: "https://mymedia.xmu.edu.cn/", name: cookie.name });
                            });

                            chrome.tabs.query({ currentWindow: true, active: true }, function (currentTabs) {

                                var url = currentTabs[0].url;
                                chrome.storage.local.set({ 'success': 'Error fixed' }, function () {
                                    window.location.href = chrome.extension.getURL('success.html');
                                });
                                if (!url.includes('https://l.xmu.edu.my/mod/mediasite/view.php?id=')) {
                                    return;
                                }
                                chrome.tabs.reload();
                            });
                        });
                    });

                } else {
                    alert("Permission is needed to access data on the website!\nPlease try again. ");
                }
            });

    }, false);

    document.getElementById('linkBtnCheckbox').addEventListener('click', function (event) {
        chrome.storage.local.set({ 'link_btn_enabled': event.target.checked });
    }, false);
}, false);

