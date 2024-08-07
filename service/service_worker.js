chrome.runtime.onInstalled.addListener(async function (details) {
    if (details.reason == "install") {
        try {
            const response = await fetch(chrome.runtime.getURL('/data/trustscore.json'));
            const data = await response.json();
            await chrome.storage.local.set({ 'trustscore': data });
        } catch (error) {
            console.error('Error fetching trustscore:', error);
        }
    }
    else if (details.reason == "update") {

    }
})