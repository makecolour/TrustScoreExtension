const data ={};
function checkUserIdInResponse(userId, data) {
    if (Array.isArray(data.trustscore)) {
        return data.trustscore.filter(item => 
            item.owner.includes(userId) || 
            (item.properties && item.properties.owner && item.properties.owner.includes(userId)) || 
            (item.properties && item.properties.name && item.properties.name.includes(userId))
        );
    }
    return null;
}

async function fetchUserProfile() {
    let response = await chrome.storage.local.get('trustscore');
    Object.assign(data, response);
    
}