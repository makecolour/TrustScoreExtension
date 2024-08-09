
const url = window.location.href;
var userId;


window.addEventListener('load', async () => {
    await fetchUserProfile().then(() => {
        userId = extractUserId(url)
        
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
});