window.addEventListener('load', async () => {
    await fetchUserProfile()
});

(function() {
    // Array to store all captured posts
    let allPosts = [];

    // Function to extract post content
    function extractPostContent(postElement) {
        return postElement.innerText || postElement.textContent;
    }

    // Function to update the list of all posts
    function updatePosts() {
        let posts = document.querySelectorAll('[role="article"]');
        allPosts = []; // Clear the list before updating

        posts.forEach(post => {
            const postContent = extractPostContent(post);
            if (postContent) {
                allPosts.push(postContent);
            }
        });

        console.log("Updated posts list:", allPosts);

        // Optionally save to Chrome storage if you need persistence
        chrome.storage.local.set({ 'facebook_posts': allPosts }, function() {
            console.log("Posts saved to storage.");
        });
    }

    // Observe DOM for changes (e.g., new posts loaded)
    const observer = new MutationObserver(updatePosts);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial update of posts list when the script runs
    updatePosts();

    // Optionally, listen to scroll event if you want to do something specific when the user scrolls
    window.addEventListener('scroll', () => {
        console.log("Scroll detected, current number of posts:", allPosts.length);
    });

    // Expose the variable globally for debugging purposes (optional)
    window.allPosts = allPosts;

})();
