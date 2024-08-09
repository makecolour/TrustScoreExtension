window.addEventListener('load', async () => {
    await fetchUserProfile().then(async () => {
        setTimeout(()=>{
            console.log(extractUserIdFromPost(extractPosts()[0]));
        },500)
    });
});

