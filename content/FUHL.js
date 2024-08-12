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
    await fetchWithRetries(fetchUserProfile);
    createFloatingButton();
    observeDOMChanges();

    if (currentURL.includes('/groups/356018761148436/user') || currentURL.includes('/groups/fuhoalac/user')) {
        await handleUserInGroups();
    } else {
        await handleUserGeneral();
    }

    // if(currentURL.includes('/groups/356018761148436') || currentURL.includes('/groups/fuhoalac')) {
        handleNewPosts();
    // }
    
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
                // if (userExists) {
                //     console.log('Canonical ID exists in response:', userExists);
                // } else {
                //     console.log('Canonical ID not found in response');
                // }
            } else {
                console.log('Canonical ID not found in profile page');
            }
        }
        const postHeader = await fetchWithRetries(() => Promise.resolve(extractUserProfile()));
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
    await initialize();
});

monitorURLChanges();

function createFloatingButton() {
    const button = document.createElement('button');
    button.innerHTML = '&#x2191;'; // Up arrow
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

    // Event listener for hover
    button.addEventListener('mouseover', () => {
        showAllUsersMap();
    });

    document.body.appendChild(button);
}

// Function to display the allUsers map
function showAllUsersMap() {
    const usersDiv = document.createElement('div');
    usersDiv.style.position = 'fixed';
    usersDiv.style.bottom = '60px'; // Adjusted to be closer to the button
    usersDiv.style.left = '20px';
    usersDiv.style.padding = '10px';
    usersDiv.style.backgroundColor = '#fff';
    usersDiv.style.border = '1px solid #ccc';
    usersDiv.style.borderRadius = '5px';
    usersDiv.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    usersDiv.style.zIndex = '1000';
    usersDiv.style.maxHeight = '300px';
    usersDiv.style.overflowY = 'auto';
    usersDiv.style.display = 'none'; // Initially hidden

    // Populate the div with the allUsers map content
    allUsers.forEach((posts, user) => {
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
                event.preventDefault(); // Prevent the default anchor behavior
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

    document.body.appendChild(usersDiv);

    // Show the usersDiv when the button is hovered
    document.querySelector('button').addEventListener('mouseover', () => {
        usersDiv.style.display = 'block';
    });
    
    // Hide the usersDiv with a delay when the mouse leaves the button or usersDiv
    document.querySelector('button').addEventListener('mouseout', () => {
        setTimeout(() => {
            if (!usersDiv.matches(':hover') && !document.querySelector('button').matches(':hover')) {
                usersDiv.style.display = 'none';
            }
        }, 200); // Adjust the delay as needed
    });
    
    usersDiv.addEventListener('mouseover', () => {
        usersDiv.style.display = 'block';
    });
    
    usersDiv.addEventListener('mouseout', () => {
        setTimeout(() => {
            if (!usersDiv.matches(':hover') && !document.querySelector('button').matches(':hover')) {
                usersDiv.style.display = 'none';
            }
        }, 200); // Adjust the delay as needed
    });
}