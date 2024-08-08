
const url = window.location.href;
var userId;

const extractUserId = (url) => {
    var match;
     match = url.match(/\/user\/(\d+)\//);
    if(!match){
        match = url.match(/\/user\/(\d+)/);
    }
    return match ? match[1] : null;
}


const fetchUserProfileCanonical = async (userId) => {
    const initialUrl = `https://www.facebook.com/profile.php?id=${userId}`;
    try {
        const html = await fetch(initialUrl);
        
        if(html.url !== initialUrl) {
            console.log(html.url.match(/\/([^/]+)\/?$/)[1]);
            return html.url.match(/\/([^/]+)\/?$/)[1];
        }
        else{
            const regex = /"userVanity":"([^"]+)"/;
            const userVanity = html.match(regex);
            const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.facebook\.com\/([^"]+)"\s*\/?>/);
            if (canonicalMatch) {
                console.log('Canonical URL found:', canonicalMatch[0]);
                return canonicalMatch[1];
            }
            else if(userVanity){
                console.log('User Vanity found:', userVanity[0]);
                return match[1];
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



window.onload = fetchUserProfile().then(async () => {
    console.log('FUHL Trust Score loaded');
    userId = extractUserId(url);
    if (userId) {
        let userExists = checkUserIdInResponse(userId, data);
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
    } else {
        console.log('User ID not found in URL');
    }
});

