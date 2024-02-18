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
    let x = document.querySelector("#username-text") as HTMLDivElement;
    x.textContent = `@${userinfo["username"]}`;
    let y = document.getElementById("profile-picture") as HTMLImageElement;
    y.src = `https://cdn.discordapp.com/avatars/${userinfo["id"]}/${userinfo["avatar"]}.jpg`;
    let servers = serverListResponse["servers"];
    drawServers(servers, handleServerClick);
    document.querySelector("#logout-button")?.addEventListener("click", function () {
        loginManager.dispose();
        window.location.reload();
    });
}

//załaduj dane dla przycisków ustawień
function handleServerClick(serverId: string) {
    console.log(`Button with value ${serverId} clicked`);

    //poprzenosić to wszstko do oddzielnych funkcji || plików ale to jak skończe dodawać ten syf
    // w /api/api.md jest jak coś takie ala drzewko endpointow

    //---Welcome---
    function toggleWelcomeSwitch(enabled: boolean) {
        const switchElement = document.querySelector('#welcome-switch') as HTMLInputElement;

        if (enabled) {
            switchElement.checked = true;
        } else {
            switchElement.checked = false;
        }
    }

    // Load Welcome Messages status
    doFetch(`${config.MainURL}/load/server-settings/welcome_status/${loginManager.token.token_type}/${loginManager.token.token}/${serverId}`, (res: boolean) => {
        console.log(res);
        toggleWelcomeSwitch(res);
    });


    //---Autorole---
    function toggleAutoRoleSwitch(enabled: boolean) {
        const switchElement = document.querySelector('#auto-role-switch') as HTMLInputElement;

        if (enabled) {
            switchElement.checked = true;
        } else {
            switchElement.checked = false;
        }
    }

    // Load Auto Role status
    doFetch(`${config.MainURL}/load/server-settings/autorole/${loginManager.token.token_type}/${loginManager.token.token}/${serverId}`, (res: boolean) => {
        console.log(res); // Just for debugging, you can remove this line
        toggleAutoRoleSwitch(res); // Update UI based on response
    });

//TODO -> funkcje zapisujące dane \/ są wykonywane 2 razy po każdym wciśnięciu switcha

    // Function to handle the change event for Welcome Messages switch
    function handleWelcomeSwitchChange(event: Event) {
        event.stopPropagation(); // Stop event propagation
        const welcomeSwitch = event.target as HTMLInputElement;
        const isEnabled = welcomeSwitch.checked;
        console.log("switch")
        //save data
        doFetch(`${config.MainURL}/save/welcome_messages_status/${loginManager.token.token_type}/${loginManager.token.token}/${serverId}/${isEnabled}`, (res) => {
            console.log(res)
        })
    }

    // Function to handle the change event for Auto Role switch
    function handleAutoRoleSwitchChange(event: Event) {
        event.stopPropagation(); // Stop event propagation
        const autoRoleSwitch = event.target as HTMLInputElement;
        const isEnabled = autoRoleSwitch.checked;
        console.log("auto - switch")

        //save data
        doFetch(`${config.MainURL}/save/auto_role_status/${loginManager.token.token_type}/${loginManager.token.token}/${serverId}/${isEnabled}`, (res) => {
            console.log(res)
        })
    }

    // Add event listener for change event on Welcome Messages switch, but first remove any existing listeners to prevent duplicates
    const welcomeSwitchElement = document.getElementById('welcome-switch') as HTMLInputElement;
    welcomeSwitchElement.removeEventListener('change', handleWelcomeSwitchChange); // Remove existing listener
    welcomeSwitchElement.addEventListener('change', handleWelcomeSwitchChange);

    // Add event listener for change event on Auto Role switch, but first remove any existing listeners to prevent duplicates
    const autoRoleSwitchElement = document.getElementById('auto-role-switch') as HTMLInputElement;
    autoRoleSwitchElement.removeEventListener('change', handleAutoRoleSwitchChange); // Remove existing listener
    autoRoleSwitchElement.addEventListener('change', handleAutoRoleSwitchChange);

    //load welcome channels
    doFetch(`${config.MainURL}/load/server-settings/welcome_channel/${loginManager.token.token_type}/${loginManager.token.token}/${serverId}`, (channelFromServer) => {
        doFetch(`${config.MainURL}/load/server-channels-list/${loginManager.token.token_type}/${loginManager.token.token}/${serverId}`, (channels) => {
            console.log(channelFromServer);
            console.log(channels);
    
            const welcomeMessagesList = document.getElementById('welcome-select') as HTMLSelectElement;
    
            // Wyczyść listę rozwijaną przed dodaniem nowych opcji
            welcomeMessagesList.innerHTML = '';
    
            // Dodaj opcje kanałów
            channels.forEach((channel, _index) => {
                const option = document.createElement('option');
                option.value = channel.id;
                option.text = channel.name;
                welcomeMessagesList.add(option);
    
                // Ustaw opcję jako wybraną, jeśli jej id zgadza się z id zwróconym z serwera
                if (channel.id === channelFromServer.id) {
                    option.selected = true;
                }
            });
        });
    });

    //load autorole roles
    doFetch(`${config.MainURL}/load/server-settings/get_autorole_role/${loginManager.token.token_type}/${loginManager.token.token}/${serverId}`, (selected_role) => {
        doFetch(`${config.MainURL}/load/server-roles-list/${loginManager.token.token_type}/${loginManager.token.token}/${serverId}`, (roles) => {
            console.log(selected_role);
            console.log(roles);
    
            const welcomeMessagesList = document.getElementById('autorole-select') as HTMLSelectElement;
    
            // Wyczyść listę rozwijaną przed dodaniem nowych opcji
            welcomeMessagesList.innerHTML = '';
    
            // Dodaj opcje kanałów
            roles.forEach((role, _index) => {
                const option = document.createElement('option');
                option.value = role.id;
                option.text = role.name;
                welcomeMessagesList.add(option);
    
                // Ustaw opcję jako wybraną, jeśli jej id zgadza się z id zwróconym z serwera
                if (role.id === selected_role.id) {
                    option.selected = true;
                }
            });
        });
    });
}

