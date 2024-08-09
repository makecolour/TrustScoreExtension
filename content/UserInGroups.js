
const url = window.location.href;
var userId;

const extractUserId = (url) => {
    var match;
     match = url.match(/\/user\/(\d+)\//);
    if(!match){
        match = url.match(/\/user\/(\d+)/);
    }
    return match ? match[1] : null;
}

window.addEventListener('load', async () => {
    await fetchUserProfile().then(async () => {
        console.log('FUHL Trust Score loaded');
        userId = extractUserId(url);
        console.log('User ID:', userId);
        if (userId) {
            let userExists = checkUserIdInResponse(userId, data);
            if (userExists) {
                console.log('User ID exists in response:', userExists);
            } else {
                const canonicalId = await fetchUserProfileCanonical(userId);
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
});

