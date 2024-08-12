
const key = document.getElementById("key");
const save = document.getElementById("save");

const ai = document.getElementById("logo");

const ask = document.getElementById("ask");

const show = document.getElementById("togglePassword");

const spin = document.getElementById("spinner-overlay");

const owner = document.getElementById("owner");

const check = document.getElementById("check");

const accordionContainer = document.getElementById('accordionContainer');

const label={}; // store all label from messages.json
let popover = null;

check.addEventListener("click", async () => {
  if(owner.value != "")
  {
    event.preventDefault();
    if (popover) {
      popover = null;
    }
    const query = owner.value;
    let userExists = checkServiceProviderIdInResponse(query, data);
      
    if (userExists) {
        console.log('Canonical ID exists in response:', userExists);
        accordionContainer.innerHTML = generateAccordionHTML(userExists);
    } else {
        console.log('Canonical ID not found in response');
    }

  }
  else{ 
    if (!popover&&owner.value == "") {
      popover = new bootstrap.Popover(check);
    }
    popover.show();
  }
});


function generateAccordionHTML(objects) {
  let accordionHTML = '<div class="accordion" id="accordionExample">';
  objects.forEach((obj, index) => {
    accordionHTML += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading${index}">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
            ${obj.owner}
          </button>
        </h2>
        <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#accordionExample">
          <div class="accordion-body">
            <p>${JSON.stringify(obj, null, 2)}</p>
            <a href="${chrome.runtime.getManifest().homepage_url}/profile?owner=${obj.owner}" target="_blank">View Profile</a>
          </div>
        </div>
      </div>
    `;
  });
  accordionHTML += '</div>';
  return accordionHTML;
}



document.addEventListener("click", (event) => {
  if (popover && !check.contains(event.target)) {
    popover.dispose();
    popover = null;
  }
  if (event.target.matches('.accordion-button')) {
    event.target.setAttribute('aria-expanded', event.target.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
    console.log('Accordion button clicked:', event.target);
  }

  // Handle clicks on dynamically created profile links
  if (event.target.matches('.accordion-body a')) {
    // Your logic for handling profile link clicks
    console.log('Profile link clicked:', event.target);
  }
});

ai.addEventListener("click", () => {
  window.open(chrome.runtime.getManifest().homepage_url, '_blank').focus()
});

async function mergeJsonFile(api) {
  const url = chrome.runtime.getManifest().homepage_url+"/api/mergeAll";
  const token = api; // Replace with your actual token

  const request = {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
  };
  return fetch(url, request)
      .then(response => response.text())
      
}

async function fetchNewData() {
  
  const url = chrome.runtime.getManifest().homepage_url+"/api/objects";

  const request = {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json'
      }
  };
  return fetch(url, request)
      .then(response => response.json())
      
}

save.addEventListener("click", async () => {
  const api = key.value;
  key.type = "password";
  setToStorage("API_KEY", api);
  const ans = await mergeJsonFile(api);
  alert(ans);
  window.close();
});

document.addEventListener("DOMContentLoaded", async () => {
  await fetchUserProfile()
  const api = await getFromStorage('API_KEY', '');

  const theme = await getFromStorage('THEME', '');

  const lang = await getFromStorage('LANG', '');

  key.value = api;
  if (key.value == "undefined") {
    key.value = "";
  }
  else {
    key.type = "password";
  }
  

  update(theme);

  if(lang&&lang.includes("vi"))
	{
		updateLang("vi");
	}
	else{
		updateLang("en");
	}

})


ask.addEventListener("click", async () => {
  const ans = confirm(label.ask.message+"?");
  if(ans)
  {
    spin.style.display = "flex";
    const newData = await fetchNewData();
    if(Array.isArray(newData)&&newData.length != 0&&newData != null && newData != undefined)
    {
      console.log(newData);
      console.log(data.trustscore);
      if(compareJsonArrays(newData,data.trustscore))
      {
        alert(label.error.sameData);
      }
      else{
        const ans = confirm(label.ask.message+"?");
        if(ans)
        {
          await chrome.storage.local.set({ 'trustscore': newData });
          alert(label.success.message);
        }
      }
    }
    else{
      alert(label.error.message);
    }
    spin.style.display = "none";
  }

})

show.addEventListener("click",() => {
  if(key.type == "password")
  {
    key.type = "text"
    show.innerHTML = label.togglePasswordoff.message;
  }
  else{
    key.type = "password"
    show.innerHTML = label.togglePasswordon.message;
  }
});



const themeBtn = document.getElementsByClassName("bg")
for (let i = 0; i < themeBtn.length; i++) {
  themeBtn[i].addEventListener("click", () => {
    update(themeBtn[i].value);
    setToStorage("THEME", themeBtn[i].value);
  })
}

const body = document.getElementById("body")

function update(value = "light") {
  const paths = document.getElementById("setting").getElementsByTagName("path");

  switch (value) {
    case "light":
      body.setAttribute("data-bs-theme", "light");
      for (let i = 0; i < paths.length; i++) {
        paths[i].attributes.fill.nodeValue = "#0f1729"
      }
      ai.src = "/assets/logo-black-2.png";
      break;
    case "dark":
      body.setAttribute("data-bs-theme", "dark");
      for (let i = 0; i < paths.length; i++) {
        paths[i].attributes.fill.nodeValue = "#dee2e6"
      }
      ai.src = "/assets/logo-white-2.png";
      break;
    case "sys":
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return update("dark")
      }
      else {
        return update("light")
      }
      break;
    default:
      break;
  }
}



const langBtn = document.getElementsByClassName("lang")

for(let i = 0; i < langBtn.length; i++)
{
	langBtn[i].addEventListener("click", ()=>{
		updateLang(langBtn[i].value);
	})
}

async function updateLang(lang ="vi"){
	switch(lang)
	{
		case "vi":
			setToStorage("LANG", '/_locales/vi/messages.json');
			fetch(chrome.runtime.getURL('/_locales/vi/messages.json')).then(response => response.json()).then(messages => {
        Object.assign(label, messages);
				changeLanguage(messages);
			});
			break;
		case "en":
			setToStorage("LANG", '/_locales/en/messages.json');
			fetch(chrome.runtime.getURL('/_locales/en/messages.json')).then(response => response.json()).then(messages => {
        Object.assign(label, messages);
				changeLanguage(messages);
			});
			break;
		default:
			break;
	}
}
function changeLanguage(label){
	document.getElementById("theme").textContent = label.theme.message;
	document.getElementById("light").textContent = label.light.message;
	document.getElementById("dark").textContent = label.dark.message;
	document.getElementById("sys").textContent = label.system.message;
	document.getElementById("language").textContent = label.language.message;
	document.getElementById("vi").textContent = label.vi.message;
	document.getElementById("en").textContent = label.en.message;
  document.getElementById("home-tab").textContent = label.home_tab.message;
  document.getElementById("profile-tab").textContent = label.profile_tab.message;


  document.getElementById("key").placeholder = label.key.message;
  if(key.type == "password")
  {
    show.innerHTML = label.togglePasswordon.message;
    show.title = label.togglePasswordon.message;
  }
  else{
    show.innerHTML = label.togglePasswordon.message;
    show.title = label.togglePasswordon.message;
  }
  save.textContent = label.save.message;
  save.title = label.execute.message;
  ask.textContent = label.ask.message;
  ask.title = label.execute.message;
  owner.placeholder = label.owner.message;
  check.textContent = label.check.message;
  document.getElementById("madeby").innerHTML = label.madeby.message;
	document.getElementById("version").innerHTML = label.version.message.replace("{{version}}", chrome.runtime.getManifest().version).replace("{{resfes}}", chrome.runtime.getManifest().homepage_url);
} 