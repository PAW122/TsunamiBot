// this file is a template, which will be replaced
import { drawServers } from "./ServerList.js"
import * as config from "./config.js"
import { doFetch } from "./helpers.js"
import { auth } from "./login.js"

window.onload = initial
const loginManager = new auth()

function initial() {
    if (String(config.MainURL) === "http://localhost:3000") {
        document.getElementById("test-banner")?.classList.remove("d-none")
    }
    let login_button = document.getElementById("login-button") as HTMLLinkElement
    login_button.href = config.AuthURL

    if (loginManager.token.token) {
        document.querySelectorAll(".profile-logout").forEach(function (el) {
            el.classList.add("d-none");
        })
        document.querySelectorAll(".profile-login").forEach(function (el) {
            el.classList.remove("d-none");
        })
        doFetch(`${config.MainURL}/load/server-list/${loginManager.token.token_type}/${loginManager.token.token}`, login)
    }
    window["lm"] = loginManager
}


function login(serverListResponse) {
    let userinfo = serverListResponse["user"];
    document.getElementById("username-text")!.textContent = `@${userinfo["username"]}`
    document.getElementById("profile-picture")?.setAttribute("src", `https://cdn.discordapp.com/avatars/${userinfo["id"]}/${userinfo["avatar"]}.jpg`)
    let servers = serverListResponse["servers"];
    drawServers(servers, handleServerClick);
    document.querySelector("#logout-button")?.addEventListener("click", function () {
        loginManager.dispose();
        window.location.reload();
    });
}

//załaduj dane dla przycisków ustawień
function handleServerClick(clickedServerId: string) {
    console.log(`Button with value ${clickedServerId} clicked`);
    let welcomeChannelSelect: HTMLSelectElement;
    let welcomeMessageCheck: HTMLInputElement;
    let autoroleSelect: HTMLSelectElement;
    let autoroleCheck: HTMLInputElement;
    function genSettings() {
        let settings_parent = document.getElementById("settings_container") as HTMLDivElement
        settings_parent.innerHTML = ""
        let aa = document.createElement("div");
        aa.classList.add("d-flex", "flex-column", "gap-2")
        let ab = document.createElement("div");
        ab.classList.add("h3");
        ab.textContent = "Welcome messages";
        welcomeChannelSelect = document.createElement("select") as HTMLSelectElement;
        welcomeChannelSelect.classList.add("form-select");
        welcomeMessageCheck = document.createElement("input") as HTMLInputElement;
        welcomeMessageCheck.type = "checkbox";
        welcomeMessageCheck.classList.add("form-check-input");

        let ba = document.createElement("div");
        ba.classList.add("d-flex", "flex-column", "gap-2")
        let bb = document.createElement("div");
        bb.classList.add("h3");
        bb.textContent = "Autorole";
        autoroleSelect = document.createElement("select") as HTMLSelectElement;
        autoroleSelect.classList.add("form-select");
        autoroleCheck = document.createElement("input") as HTMLInputElement;
        autoroleCheck.type = "checkbox";
        autoroleCheck.classList.add("form-check-input");

        aa.appendChild(ab);
        aa.appendChild(welcomeChannelSelect);
        aa.appendChild(welcomeMessageCheck);

        ba.appendChild(bb);
        ba.appendChild(autoroleSelect);
        ba.appendChild(autoroleCheck);

        settings_parent.appendChild(aa);
        settings_parent.appendChild(ba);
    }
    genSettings()
    //poprzenosić to wszstko do oddzielnych funkcji || plików ale to jak skończe dodawać ten syf
    // w /api/api.md jest jak coś takie ala drzewko endpointow

    // Load Welcome Messages status
    doFetch(`${config.MainURL}/load/server-settings/welcome_status/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}`, (res: boolean) => {
        console.debug("welcome messages enabled: ", res);
        welcomeMessageCheck.checked = res;
    });
    // Save Welcome Messages status
    welcomeMessageCheck!.addEventListener("change", function () {
        doFetch(`${config.MainURL}/save/welcome_messages_status/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${welcomeMessageCheck.checked}`, (res) => {
            console.log(`Welcome message set to ${welcomeMessageCheck.checked}. Response: `, res)
        })
    })

    // Load Auto Role status
    doFetch(`${config.MainURL}/load/server-settings/autorole/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}`, (res: boolean) => {
        console.debug("loading autorole status: ", res);
        autoroleCheck.checked = res;
    });
    // Save Auto Role status
    autoroleCheck!.addEventListener("change", function () {
        doFetch(`${config.MainURL}/save/auto_role_status/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${autoroleCheck.checked}`, (res) => {
            console.log(`Autorole set to ${autoroleCheck.checked}. Response: `, res)
        })
    })

    //load welcome channels
    doFetch(`${config.MainURL}/load/server-settings/welcome_channel/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}`, (channelFromServer) => {
        doFetch(`${config.MainURL}/load/server-channels-list/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}`, (channels) => {
            console.debug("channel from server: ", channelFromServer);
            console.debug("channels", channels);

            channels?.forEach((channel, _index) => {
                const option = document.createElement('option');
                option.value = channel.id;
                option.text = channel.name.length > 32 ? channel.name.substring(0, 29) + "..." : channel.name;
                welcomeChannelSelect.options.add(option)

                // Ustaw opcję jako wybraną, jeśli jej id zgadza się z id zwróconym z serwera
                if (channel.id === channelFromServer.id) {
                    option.selected = true;
                }
            });
        });
    });
    welcomeChannelSelect!.addEventListener("change", function () {
        doFetch(`${config.MainURL}/save/welcome_messages_channel/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${welcomeChannelSelect.value}`, (res) => {
            console.log(`Welcome Message Channel set to: ${welcomeChannelSelect.value}. Response: `, res)
        })
    });
    //load autorole roles
    doFetch(`${config.MainURL}/load/server-settings/get_autorole_role/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}`, (selected_role) => {
        doFetch(`${config.MainURL}/load/server-roles-list/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}`, (roles) => {
            console.log("Selected role: ", selected_role);
            console.log("Roles: ", roles);
            // Dodaj opcje kanałów
            roles.forEach((role, _index) => {
                const option = document.createElement('option');
                option.value = role.id;
                option.text = role.name.length > 32 ? role.name.substring(0, 29) + "..." : role.name;
                autoroleSelect.options.add(option)
                // Ustaw opcję jako wybraną, jeśli jej id zgadza się z id zwróconym z serwera
                if (role.id === selected_role.id) {
                    option.selected = true;
                }
            });
        });
    });
    // save autorole roles
    autoroleSelect!.addEventListener("change", function () {
        doFetch(`${config.MainURL}/save/auto_role_id/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.value}`, (res) => {
            console.log(`Autorole Selected: ${autoroleSelect.value}. Response: `, res)
        })
    })

}