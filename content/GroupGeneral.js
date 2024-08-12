// Initialize an array to store all captured posts
let allPosts = [];
let allUsers = new Map();

// Create a floating button
function createFloatingButton() {
    const button = document.createElement('button');
    button.innerText = 'Click Me';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#007bff';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
    button.style.cursor = 'pointer';
    button.style.zIndex = '1000';

    button.addEventListener('click', async () => {
        await findPosts();
    });

    document.body.appendChild(button);
}

// Call the function to create the floating button when the window loads
window.addEventListener('load', async () => {
    
    await fetchWithRetries(fetchUserProfile);
    createFloatingButton();
});

async function findPosts() {

    const postHeader = await fetchWithRetries(() => Promise.resolve(extractPosts()));

    for (let i = 0; i < postHeader.length; i++) {
        try {
            const user = await extractUserIdFromPost(postHeader[i]);
            console.log(postHeader[i]);
            console.log(user);
            const owner = user[0][0];
            console.log(owner);
            appendDivToPostHead(postHeader[i], owner);
        } catch (error) {
            console.error('Error after initialization:', error);
            
        }
        
    }

}