// this file is a template, which will be replaced
import { drawServers } from "./ServerList.js"
import * as config from "./config.js"
import { navbarStyle } from "./helpers.js"
import { auth } from "./login.js"
import { genSettings } from "./settings.js"

window.onload = initial
const loginManager = new auth()

function initial() {
    navbarStyle();
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
        login();
        // doFetch(`${config.MainURL}/load/server-list/${loginManager.token.token_type}/${loginManager.token.token}`, login)
    }
    window["lm"] = loginManager
}

async function login() {
    let response = await fetch(`${config.MainURL}/load/server-list/${loginManager.token.token_type}/${loginManager.token.token}`);
    let json = await response.json();
    document.getElementById("username-text")!.textContent = `@${json.user.username}`
    document.getElementById("profile-picture")?.setAttribute("src", `https://cdn.discordapp.com/avatars/${json.user.id}/${json.user.avatar}.jpg`)
    let servers = json.servers;
    drawServers(servers, handleServerClick);
    document.querySelector("#logout-button")?.addEventListener("click", function () {
        loginManager.dispose();
        window.location.reload();
    });
}

async function handleServerClick(clickedServerId: string) {
    console.debug(`Loading server with ID ${clickedServerId}`);
    let settings_parent = document.getElementById("settings_container") as HTMLDivElement;
    settings_parent!.innerHTML = `<div class="d-flex p-3 bg-body-secondary rounded align-items-center placeholder-glow">
    <span class="placeholder col-1"></span><span class="col-1"></span><span class="placeholder col-10"></span></div>
    <div class="p-3 bg-body-secondary rounded align-items-center placeholder-glow"><span class="placeholder col-7">
    </span><span class="placeholder col-4"></span><span class="placeholder col-4"></span><span class="placeholder col-6">
    </span><span class="placeholder col-8"></span></div>`;

    let response = await fetch(`${config.MainURL}/full_load/content`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tokenType: loginManager.token.token_type,
            token: loginManager.token.token,
            server_id: clickedServerId
        })
    })
    let body = await response.json();
    if (!response.ok) {
        throw new Error("Response error");
    }
    settings_parent!.innerHTML = "";

    let autorole = genSettings(settings_parent, "Autorole", true);
    let welcome_channel = genSettings(settings_parent, "Welcome Channel", true);

    // reading autorole switches
    if (body.autorole_enable === false) {
        autorole.checkbox!.checked = false;
        autorole.select.setAttribute("disabled", "true");
    } else if (body.autorole_enable === true) {
        autorole.checkbox!.checked = true;
    } else {
        throw new Error("Corrupted autorole response data");
    }
    body.server_roles_list?.forEach((role, _index) => {
        const option = document.createElement('option');
        option.value = role.id;
        option.text = role.name.length > 32 ? role.name.substring(0, 29) + "..." : role.name;
        autorole.select.options.add(option)
        // Ustaw opcję jako wybraną, jeśli jej id zgadza się z id zwróconym z serwera
        if (role.id === body.autorole_role.id) {
            option.selected = true;
        }
    });

    // reading welcome message switches
    if (body.welcome_message_enable === false) {
        welcome_channel.checkbox!.checked = false;
        welcome_channel.select.setAttribute("disabled", "true");
    } else if (body.welcome_message_enable === true) {
        welcome_channel.checkbox!.checked = true;
    } else {
        throw new Error("Corrupted welcome message response data");
    }
    body.server_channels_list?.forEach((channel, _index) => {
        const option = document.createElement('option');
        option.value = channel.id;
        option.text = channel.name.length > 32 ? channel.name.substring(0, 29) + "..." : channel.name;
        welcome_channel.select.options.add(option);
        // Ustaw opcję jako wybraną, jeśli jej id zgadza się z id zwróconym z serwera
        if (channel.id === body.welcome_message_channel.id) {
            option.selected = true;
        }
    });

    // saving autorole switches
    autorole.checkbox!.addEventListener("change", async function () {
        let response = await fetch(`${config.MainURL}/save/auto_role_status/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.checked}`);
        if (response.ok) {
            console.log(`Autorole set to ${autorole.checkbox?.checked}. Response: ${response.status}`);
        } else {
            console.warn(`Error setting autorole to ${autorole.checkbox?.checked}. Refreshing`);
            handleServerClick(clickedServerId);
        }
    })
    autorole.select!.addEventListener("change", async function () {
        let response = await fetch(`${config.MainURL}/save/auto_role_id/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.value}`);
        if (response.ok) {
            console.log(`Autorole role set to ${this.value}. Response: ${response.status}`);
        } else {
            console.warn(`Error setting autorole role to ${this.value}. Refreshing`);
            handleServerClick(clickedServerId);
        }
    })

    // saving welcome message switches
    welcome_channel.checkbox!.addEventListener("change", async function () {
        let response = await fetch(`${config.MainURL}/save/welcome_messages_status/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.checked}`);
        if (response.ok) {
            console.log(`Welcome message set to ${this.checked}. Response: ${response.status}`);
        } else {
            console.warn(`Error setting autorole to ${this.checked}. Refreshing`);
            handleServerClick(clickedServerId);
        }
    })
    welcome_channel.select!.addEventListener("change", async function () {
        let response = await fetch(`${config.MainURL}/save/welcome_messages_channel/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.value}`);
        if (response.ok) {
            console.log(`Welcome message channel set to ${this.value}. Response: ${response.status}`);
        } else {
            console.warn(`Error setting welcome message channel to ${this.value}. Refreshing`);
            handleServerClick(clickedServerId);
        }
    })

}