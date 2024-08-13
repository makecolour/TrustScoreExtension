let allPosts = [];
let allUsers = new Map();
let currentURL = window.location.href;

async function waitForDynamicContent() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            // Add your own condition to determine if the dynamic content is fully loaded
            const dynamicContentLoaded = extractUserProfile();

            if (dynamicContentLoaded) {
                clearInterval(checkInterval);
                resolve();  // Resolve the promise when the condition is met
            }
        }, 1000);  // Check every 1 second
    });
}

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
            allPosts.length;
            allUsers.clear();
            
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
            allPosts.length;
            allUsers.clear();
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
                if (!allUsers.has(owner)) {
                    allUsers.set(owner, []);
                }
                allUsers.get(owner).push(postHeader[i]);
            }
        } catch (error) {
            console.error('Error after initialization:', error);
        }
    }
}

async function initialize() {
    
    createFloatingButton();
    observeDOMChanges();

    await waitForDynamicContent().then(async () => {
        if (currentURL.includes('/groups/356018761148436/user') || currentURL.includes('/groups/fuhoalac/user')) {
            await handleUserInGroups();
        } else {
            await handleUserGeneral();
        }
    });
    

    // if(currentURL.includes('/groups/356018761148436') || currentURL.includes('/groups/fuhoalac')) {
        handleNewPosts();
    // }
    
}

async function handleUserInGroups() {
    const url = window.location.href;
    let userId;
    let userExists;

    // userId = extractUserId(url);
    userId = await fetchWithRetries(() => Promise.resolve(extractUserId(url)));

    if (userId) {
        userExists = checkUserIdInResponse(userId, data);
        if (userExists) {
            console.log('User ID exists in profile:', userExists[0]);
        } else {
            const canonicalId = await fetchUserProfileCanonical(userId);
            if (canonicalId) {
                userExists = checkUserIdInResponse(canonicalId, data);

            } else {
                console.log('Canonical ID not found in profile page');
            }
        }
        const postHeader = await fetchWithRetries(() => Promise.resolve(extractUserProfile()), 9999, 1000);
        appendDivToPostHead(postHeader[0], userExists[0]);
    } else {
        // console.log('User ID not found in URL');
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
    await fetchWithRetries(fetchUserProfile);
    await initialize();
});

monitorURLChanges();

function createFloatingButton() {
    const button = document.createElement('button');
    button.innerHTML = '&#x2191;'; 
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.left = '20px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    button.style.cursor = 'pointer';
    button.style.zIndex = '1000';
    button.style.transition = 'bottom 0.3s';

    button.addEventListener('mouseover', () => {
        showAllUsersMap();
    });

    button.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    document.body.appendChild(button);
}


function showAllUsersMap() {
    if(allUsers.size === 0||allPosts.length === 0) {
        return;
    }
    else if(document.getElementById('usersDiv')) {
        const usersDiv = document.getElementById('usersDiv');
        usersDiv.style.display = 'block';
        usersDiv.innerHTML = ''; 

    }
    else{
        const usersDiv = document.createElement('div');
        usersDiv.style.position = 'fixed';
        usersDiv.style.bottom = '60px'; 
        usersDiv.style.left = '20px';
        usersDiv.style.padding = '10px';
        usersDiv.style.backgroundColor = '#fff';
        usersDiv.style.border = '1px solid #ccc';
        usersDiv.style.borderRadius = '5px';
        usersDiv.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        usersDiv.style.zIndex = '1000';
        usersDiv.style.maxHeight = '300px';
        usersDiv.style.overflowY = 'auto';
        usersDiv.style.display = 'none';
        usersDiv.id = 'usersDiv';

        document.body.appendChild(usersDiv);
        document.querySelector('button').addEventListener('mouseover', () => {
            usersDiv.style.display = 'block';
        });
        
        document.querySelector('button').addEventListener('mouseout', () => {
            setTimeout(() => {
                if (!usersDiv.matches(':hover') && !document.querySelector('button').matches(':hover')) {
                    usersDiv.style.display = 'none';
                }
            }, 200); 
        });
        
        usersDiv.addEventListener('mouseover', () => {
            usersDiv.style.display = 'block';
        });
        
        usersDiv.addEventListener('mouseout', () => {
            setTimeout(() => {
                if (!usersDiv.matches(':hover') && !document.querySelector('button').matches(':hover')) {
                    usersDiv.style.display = 'none';
                }
            }, 200); 
        });
    }

    allUsers.forEach((posts, user) => {
        if (!user) {
            console.error(`User at key ${key} is undefined or null`);
            return;
        }

        if (!user.id) {
            console.error(`User at key ${key} does not have an id`);
            return;
        }
        const userDiv = document.createElement('div');
        userDiv.style.marginBottom = '10px';

        const userTitle = document.createElement('strong');
        userTitle.innerText = `${user.group}: ${user.owner}`;
        userDiv.appendChild(userTitle);

        const postsList = document.createElement('ul');
        posts.forEach(post => {
            const postItem = document.createElement('li');
            const postLink = document.createElement('a');
            postLink.href = post.id;
            postLink.innerText = `Post: ${allPosts.indexOf(post) + 1}`;
            
            postLink.addEventListener('click', function(event) {
                event.preventDefault();
                const targetElement = document.getElementById(post.id);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
            postItem.appendChild(postLink);
            postItem.style.display = 'block';
            postsList.appendChild(postItem);
        });

        userDiv.appendChild(postsList);
        usersDiv.appendChild(userDiv);
    });

}
function clearUsersDiv() {
    const usersDiv = document.getElementById('usersDiv');
    if (usersDiv) {
        usersDiv.innerHTML = ''; 
    }
}

window.addEventListener('beforeunload', clearUsersDiv);