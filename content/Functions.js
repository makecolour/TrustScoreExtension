const data = [];
function checkUserIdInResponse(userId, data) {
    if (Array.isArray(data.trustscore)) {
        const exists = data.trustscore.filter(item =>

            item.owner.toLowerCase().includes(userId.toLowerCase()) ||
            (item.properties && item.properties.owner && item.properties.owner.toLowerCase().includes(userId.toLowerCase())) ||
            (item.properties && Array.isArray(item.properties.name) && item.properties.name.some(name => name.toLowerCase().includes(userId.toLowerCase())))
        );
        if (exists.length > 0) {
            return exists;
        }
        return null;
    }
    return null;
}

function checkServiceProviderIdInResponse(userId, data) {
    if (Array.isArray(data.trustscore)) {
        const exists = data.trustscore.filter(item =>
            item.group.includes('service_provider') &&
            (
                item.owner.toLowerCase().includes(userId.toLowerCase()) ||
                (item.properties && item.properties.owner && item.properties.owner.toLowerCase().includes(userId.toLowerCase())) ||
                (item.properties && Array.isArray(item.properties.name) && item.properties.name.some(name => name.toLowerCase().includes(userId.toLowerCase())))
            )
        );
        if (exists.length > 0) {
            return exists;
        }
        return null;
    }
    return null;
}

async function fetchUserProfile() {
    let response = await chrome.storage.local.get('trustscore');
    Object.assign(data, response);
    console.log('FUHL Trust Score loaded');
}

function appendDivToPostHead(postHead, d) {
    var newDiv = document.createElement("div");
    newDiv.classList.add("FUHL-trust-score");
    if (d.group == "service_provider") {
        newDiv.innerHTML = `<strong>Service Provider: ${d.properties.service_type}</strong></br>Name: ${d.owner}</br>Ranking: ${d.order} - ${starCount(d)}</br><a href="${chrome.runtime.getManifest().homepage_url}/profile?owner=${d.owner}" target=_blank>View Details</a>`;
    }
    else{
        newDiv.innerHTML = `<strong>User</strong></br>FacebookID: ${d.properties.name}</br>`;
    }
    newDiv.style.backgroundColor = "#f0f0f0";
    newDiv.style.padding = "10px";
    newDiv.style.marginBottom = "10px";
    newDiv.style.border = "1px solid #ccc";

    if (postHead && postHead.parentNode ) {
        postHead.parentNode.insertBefore(newDiv, postHead);
        console.log("New div added before post head!");
        console.log(newDiv);
    } else {
        console.log("postHead or its parent node is not available.");
    }
}

const extractUserIdFromProfile = (url) => {
    var match;
    match = url.match(/\/profile\.php\?id=(\d+)/);
    if(!match){
        match = url.match(/\/profile\.php\?id=(\d+)/);
    }
    return match ? match[1] : null;
};

const extractUserId = (url) => {
    var match;
     match = url.match(/\/user\/(\d+)\//);
    if(!match){
        match = url.match(/\/user\/(\d+)/);
    }
    return match ? match[1] : null;
}

function getUserID() {
    const htmlContent = document.documentElement.innerHTML;
    const regex = /"id":"(\d+)","message_box_id":"\1"/;
    const match = htmlContent.match(regex);

    if (match && match[1]) {
        const extractedUserId = match[1];
        console.log(`User ID found: ${extractedUserId}`);
    } else {
        console.log('User ID not found in the page HTML.');
    }
}


const fetchUserProfileCanonical = async (userId) => {
    const initialUrl = `https://www.facebook.com/profile.php?id=${userId}`;
    try {
        const response = await fetch(initialUrl);
        const html = await response.text(); // Extract text from the response

        if (typeof html !== 'string') {
            console.error('Expected html to be a string, but got:', typeof html);
            return null;
        }

        if (response.url !== initialUrl) {
            console.log(response.url.match(/\/([^/]+)\/?$/)[1]);
            return response.url.match(/\/([^/]+)\/?$/)[1];
        } else {
            const regex = /"userVanity":"([^"]+)"/;
            const userVanity = html.match(regex);
            const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.facebook\.com\/([^"]+)"\s*\/?>/);
            if (canonicalMatch) {
                console.log('Canonical URL found:', canonicalMatch[0]);
                return canonicalMatch[1];
            } else if (userVanity) {
                console.log('User Vanity found:', userVanity[0]);
                return userVanity[1];
            } else {
                console.log('Canonical URL not found in profile page HTML.');
                return null;
            }
        }

    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

function compareJsonArrays(arr1, arr2) {
    // Step 1: Check if both inputs are arrays
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        return false;
    }

    // Step 2: Check if arrays have the same length
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Step 3: Normalize and sort arrays
    const normalizedArr1 = arr1.map(normalizeObject).sort();
    const normalizedArr2 = arr2.map(normalizeObject).sort();

    // Step 4: Compare elements
    for (let i = 0; i < normalizedArr1.length; i++) {
        if (JSON.stringify(normalizedArr1[i]) !== JSON.stringify(normalizedArr2[i])) {
            return false;
        }
    }

    return true;
}

function normalizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(normalizeObject);
    }

    const sortedKeys = Object.keys(obj).sort();
    const normalizedObj = {};
    sortedKeys.forEach(key => {
        normalizedObj[key] = normalizeObject(obj[key]);
    });

    return normalizedObj;
}

function starCount(obj) {
    if(obj.star){
        if(obj.star>0){
            var stars = Math.round(obj.star);
            var html = '';
            for (var i = 0; i < stars; i++) {
                html += '⭐';
            }
            return html;
        }
        else{
            return 0;
        }
    }
    return null;
}

function extractPosts() {
    var possiblyHeader = document.getElementsByClassName('html-h2 x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x1vvkbs x1heor9g x1qlqyl8 x1pd3egz x1a2a7pz x1gslohp x1yc453h');
    return possiblyHeader;
}

function extractPostSearch() {
    var possiblyHeader = document.getElementsByClassName('html-h3 x11i5rnm xat24cr x1mh8g0r xexx8yu x4uap5 x18d9i69 xkhd6sd x1vvkbs x1heor9g x1qlqyl8 x1pd3egz x1a2a7pz x1gslohp x1yc453h');
    return possiblyHeader;
}

function extractUserProfile() {
    var possiblyHeader = document.getElementsByClassName('x1ifrov1 x1i1uccp x1stjdt1 x1yaem6q x4ckvhe x2k3zez xjbssrd x1ltux0g xit7rg8 xc9uqle x17quhge');
    return possiblyHeader;
}

async function fetchWithRetries(fetchFunction, retries = 5, delay = 1000) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fetchFunction();
        } catch (error) {
            console.error('Error fetching data:', error);
            // Introduce delay only for subsequent retries
            if (attempt < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error('Failed to fetch data after multiple attempts.');
}

async function extractUserIdFromPost(possiblyHeader) {
        try {
            var headerRiel = possiblyHeader.querySelector('span > span > a');
            if (!headerRiel) {
                headerRiel = possiblyHeader.querySelector('span > strong:nth-child(1) > span > a');
            }
            if (headerRiel) {
                var href = headerRiel.getAttribute('href');
                var userIdMatch = href.match(/user\/(\d+)\//);
                if (userIdMatch && userIdMatch[1]) {
                    var userId = userIdMatch[1];
                    let userExists = checkUserIdInResponse(userId, data);
                    if (userExists) {
                        console.log('User ID exists in response:', userExists);
                        return [userExists];
                    } else {
                        const canonicalId = await fetchUserProfileCanonical(userId);
                        if (canonicalId) {
                            userExists = checkUserIdInResponse(canonicalId, data);
                            if (userExists) {
                                console.log('Canonical ID exists in response:', userExists);
                                return [userExists];
                            }
                        }
                    }
                    console.log(userId);
                }
            }
        } catch (error) {
            console.error('Error extracting user ID:', error);

        }

    console.log('Failed to extract user ID after multiple attempts.');
    return [];
}


