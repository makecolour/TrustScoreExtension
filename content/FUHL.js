let allPosts = [];
let allUsers = new Map();
let currentURL = window.location.href;

function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.querySelectorAll) {
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

function monitorURLChanges() {
    const observer = new MutationObserver(() => {
        if (currentURL !== window.location.href) {
            currentURL = window.location.href;
            initialize();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    setInterval(() => {
        if (currentURL !== window.location.href) {
            currentURL = window.location.href;
            initialize();
        }
    }, 5000);
}

async function handleNewPosts() {
    let postHeader;
    if (currentURL.includes('/groups/356018761148436/search/') || currentURL.includes('/groups/fuhoalac/search/')) {
        postHeader = await fetchWithRetries(() => Promise.resolve(extractPostSearch()));
    } else if (currentURL.includes('/groups/356018761148436/posts/') || currentURL.includes('/groups/fuhoalac/posts/')) {
        postHeader = await fetchWithRetries(() => Promise.resolve(extractPosts()));
    } else if(currentURL.includes('/groups/356018761148436') || currentURL.includes('/groups/fuhoalac')) {
        postHeader = await fetchWithRetries(() => Promise.resolve(extractPosts()));
    }

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

async function initialize() {
    await fetchWithRetries(fetchUserProfile);
    
    observeDOMChanges();

    if (currentURL.includes('/groups/356018761148436/user') || currentURL.includes('/groups/fuhoalac/user')) {
        await handleUserInGroups();
    } else {
        await handleUserGeneral();
    }

    if(currentURL.includes('/groups/356018761148436') || currentURL.includes('/groups/fuhoalac')) {
        handleNewPosts();
    }
    
}

async function handleUserInGroups() {
    const url = window.location.href;
    let userId;
    let userExists;

    userId = extractUserId(url);
    console.log('User ID:', userId);
    if (userId) {
        userExists = checkUserIdInResponse(userId, data);
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
        const postHeader = await fetchWithRetries(() => Promise.resolve(extractUserProfile()));
        appendDivToPostHead(postHeader[0], userExists[0]);
    } else {
        console.log('User ID not found in URL');
    }
}

async function handleUserGeneral() {
    const url = window.location.href;
    let userId;
    let userExists;

    userId = await fetchWithRetries(() => Promise.resolve(extractUserIdFromProfile(url)));
    // console.log('User ID:', userId);
    if (userId) {
        userExists = checkUserIdInResponse(userId, data);
        if (userExists) {
            // console.log('User ID exists in response:', userExists);
        }
        const postHeader = await fetchWithRetries(() => Promise.resolve(extractUserProfile()[0]));
        appendDivToPostHead(postHeader, userExists[0]);
    } else {
        // console.log('User ID not found in URL');
    }
}



window.addEventListener('load', async () => {
    await initialize();
});

monitorURLChanges();