const data ={};
const url = window.location.href;
var userId;

const extractUserId = (url) => {
    const match = url.match(/https:\/\/www\.facebook\.com\/([^\/]+)/);
    return match ? match[1] : null;
}

async function fetchUserProfile() {
    let response = await chrome.storage.local.get('trustscore');
    Object.assign(data, response);
    
}

function getUserID() {
    const htmlContent = document.documentElement.innerHTML;
    const regex = /"id":"(\d+)","message_box_id":"\1"/;
    const match = htmlContent.match(regex);
    
    if (match && match[1]) {
        const extractedUserId = match[1];
        console.log(`User ID found: ${extractedUserId}`);
    } else {
        console.log('User ID not found in the page HTML.');
    }
}

function checkUserIdInResponse(userId, data) {
    if (Array.isArray(data.trustscore)) {
        return data.trustscore.find(item => 
            item.owner.includes(userId) || 
            (item.properties && item.properties.owner && item.properties.owner.includes(userId)) || 
            (item.properties && item.properties.name && item.properties.name.includes(userId))
        );
    }
    return null;
}

window.onload = fetchUserProfile().then(() => {
    userId = extractUserId(url)
    console.log('FUHL Trust Score loaded');
    if (userId) {
        let userExists = checkUserIdInResponse(userId, data);
        if (userExists) {
            console.log('User ID exists in response:', userExists);
        } else {
            const canonicalId = getUserID();
            if (canonicalId) {
                userExists = checkUserIdInResponse(canonicalId, data);
                if (userExists) {
                    console.log('Canonical ID exists in response:', userExists);
                } else {
                    console.log('Canonical ID not found in response');
                }
            } else {
                console.log('Canonical ID not found in profile page');
            }
        }
    } else {
        console.log('User ID not found in URL');
    }
});