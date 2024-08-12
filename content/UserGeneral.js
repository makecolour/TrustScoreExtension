
const url = window.location.href;
var userId;
var userExists;

window.addEventListener('load', async () => {
    await fetchUserProfile().then(async () => {
        userId = await fetchWithRetries(() => Promise.resolve(extractUserIdFromProfile(url)));
        console.log('User ID:', userId);
        if (userId) {
            userExists = checkUserIdInResponse(userId, data);
            if (userExists) {
                console.log('User ID exists in response:', userExists);
            }
            const postHeader = await fetchWithRetries(() => Promise.resolve(extractUserProfile()[0]));
            appendDivToPostHead(postHeader, userExists[0]);
        } else {
            console.log('User ID not found in URL');
        }
    });
});