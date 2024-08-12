// Initialize an array to store all captured posts
let allPosts = [];
let allUsers = new Map();



// Function to handle new posts
async function handleNewPosts() {
    const postHeader = await fetchWithRetries(() => Promise.resolve(extractPosts()));

    for (let i = 0; i < postHeader.length; i++) {
        try {
            const user = await extractUserIdFromPost(postHeader[i]);
            const owner = user[0][0];
            if (!allPosts.includes(postHeader[i])) {
                allPosts.push(postHeader[i]);
                appendDivToPostHead(postHeader[i], owner);
            }
        } catch (error) {
            console.error('Error after initialization:', error);
        }
    }
}

// Set up the MutationObserver
function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(node => {
                // Ensure the node is an element and contains posts
                if (node.nodeType === 1 && node.querySelectorAll) {
                    // Check for newly added posts
                    handleNewPosts();
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

// Initialization function to set up everything
async function initialize() {
    await fetchWithRetries(fetchUserProfile);
    createFloatingButton();
    observeDOMChanges();
    handleNewPosts(); // Initial check for any posts already loaded
}

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', initialize);
