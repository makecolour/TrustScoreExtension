let postHeader
let user
window.addEventListener('load', async () => {
    try {
        await fetchWithRetries(fetchUserProfile);
        const postHeader = await fetchWithRetries(() => Promise.resolve(extractPosts()[0]));
        const user = await extractUserIdFromPost(postHeader);
        console.log(postHeader);
        const owner = user[0][0];
        console.log(owner);
        appendDivToPostHead(postHeader, owner);
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});
