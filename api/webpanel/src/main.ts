// this file is a template, which will be replaced
import { drawServers } from "./ServerList.js"
import * as config from "./config.js"
import { navbarStyle } from "./helpers.js"
import { auth } from "./login.js"
import { genSettings, setting, genTextBox, addTooltip, genCheckBox, genButtonElement } from "./settings.js"

window.onload = initial
const loginManager = new auth()

// main.ts
function initial() {

    // Kod wykonywany tylko dla podstrony /partners
    if (window.location.pathname === "/partners") {
        loadPartners();
        return;
    }

    navbarStyle();
    if (String(config.MainURL) === "http://localhost:3000") {
        document.getElementById("test-banner")?.classList.remove("d-none")
    }
    let login_button = document.getElementById("login-button") as HTMLLinkElement
    login_button.href = config.AuthURL

    console.log(loginManager.token.token)

    const loginButton = document.getElementById("login-button");
    if (loginManager.token.token && loginButton) {
        document.querySelectorAll(".profile-login").forEach(function (el) {
            el.classList.remove("d-none");
        })
        // Ukryj przycisk login
        loginButton.classList.add("d-none");
        login();
        // doFetch(`${config.MainURL}/load/server-list/${loginManager.token.token_type}/${loginManager.token.token}`, login)
    } else {
        // Ukryj przycisk logout
        const logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
            logoutButton.classList.add("d-none");
            // Ukryj okienko z "username"
            const usernameWindow = document.getElementById("username-text");
            if (usernameWindow) {
                usernameWindow.classList.add("d-none");
            }
        }
    }
    window["lm"] = loginManager
}


// Funkcja do wczytywania partnerów i wyświetlania ich na stronie
async function loadPartners() {
    const response = await fetch(`${config.MainURL}/load/partners`);
    if (response.ok) {
        const partnersData = await response.json();
        const partnersContainer = document.getElementById("partners-container");
        if (partnersContainer) {
            // Iterujemy przez każdego partnera w obiekcie partnersData
            for (const key in partnersData) {
                if (Object.hasOwnProperty.call(partnersData, key)) {
                    const partner = partnersData[key];
                    const partnerElement = document.createElement("div");
                    partnerElement.classList.add("partner");
                    // Tworzymy HTML z danymi partnera
                    partnerElement.innerHTML = `
                        <div class="partner-info">
                            <img src="${partner.avatar_link}" alt="Avatar" class="partner-avatar">
                            <div class="partner-details">
                                <h2>${partner.name}</h2>
                                ${partner.description ? `<p>Description: <a>${partner.description}</a></p>` : ""}
                                ${partner.yt_link ? `<p>YouTube: <a href="${partner.yt_link}">${partner.yt_link}</a></p>` : ""}
                                ${partner.ttv_link ? `<p>Twitch: <a href="${partner.ttv_link}">${partner.ttv_link}</a></p>` : ""}
                                ${partner.discord_invite ? `<p>Discord: <a href="${partner.discord_invite}">${partner.discord_invite}</a></p>` : ""}
                                ${partner.twitter ? `<p>Twitter: <a href="${partner.twitter}">${partner.twitter}</a></p>` : ""}
                            </div>
                        </div>
                    `;
                    partnersContainer.appendChild(partnerElement);
                }
            }
        }
    } else {
        console.error("Failed to load partners:", response.status, response.statusText);
    }
}

async function login() {
    let response = await fetch(`${config.MainURL}/load/server-list/${loginManager.token.token_type}/${loginManager.token.token}`);
    let json = await response.json();
    if (json?.error && json.error === "invalid_token") {
        loginManager.dispose();
        window.location.reload();
    }
    document.getElementById("username-text")!.textContent = `@${json.user.username}`
    document.getElementById("profile-picture")?.setAttribute("src", `https://cdn.discordapp.com/avatars/${json.user.id}/${json.user.avatar}.jpg`)
    let servers = json.servers;
    drawServers(servers, handleServerClick);
    document.querySelector("#logout-button")?.addEventListener("click", function () {

        fetch(`${config.MainURL}/actions/logout/${loginManager.token.token_type}/${loginManager.token.token}`)

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

    //modLogs
    let link = `${config.MainURL}/modlogs/${clickedServerId}`
    genButtonElement(settings_parent, "Open Mod Logs", "mod_logs", "sdsd", link);

    //autorole
    let autorole = genSettings(settings_parent, "Autorole", true);
    //welcome channel
    let welcome_channel = genSettings(settings_parent, "Welcome Channel", true);

    let auto_vc = genSettings(settings_parent, "Auto create vc", true);

    //welcome message
    let welcome_text_box = genTextBox(settings_parent, "Welcome message", body.welcome_message_content, saveWelcomeMessage);
    let titleDiv = welcome_text_box.input.parentElement!.previousElementSibling as HTMLDivElement;
    addTooltip(titleDiv, "Hello {user} welcome to {server_name}\n message sent with the welcome image");
    //welcome dm message
    let welcome_dm_text_box = genTextBox(settings_parent, "Welcome dm message", body.welcome_dm_message_content, saveWelcomeDmMessage);
    let welcome_dm_text_box_div = welcome_dm_text_box.input.parentElement!.previousElementSibling as HTMLDivElement;
    addTooltip(welcome_dm_text_box_div, "Hello {user} welcome to {server_name}\n a message sent in a private chat to the user ");
    //dad bot
    let dad_bot = genCheckBox(settings_parent, "Dad bot", body.dad_bot.enable);
    //mod logs TODO: zamienić false na wartość wczytywaną w fill_load z db | dodać zapisywanie zmian do db
    // let mod_logs = genCheckBox(settings_parent, "Mod Logs", false);

    let filter_links = genCheckBox(settings_parent, "Filter links", body.filter_links);

    let filter_exceeptions = genTextBox(settings_parent, "Filter exceeptions", body.filter_links_exception, saveLinkFilter);
    let filter_exceeptions_text_box_div = filter_exceeptions.input.parentElement!.previousElementSibling as HTMLDivElement;
    addTooltip(filter_exceeptions_text_box_div, "list of links that dont get deleted\n\n e.x: https://youtube.com,https://test/");
    
    // let filter_exceeptions_if_starts_with = genTextBox(settings_parent, "Filter 'if_starts_with' exceeptions", body.filter_links_exception_if_starts_with, saveLinkFilterif_starts_with);
    // let filter_exceeptions_if_starts_with_text_box_div = filter_exceeptions_if_starts_with.input.parentElement!.previousElementSibling as HTMLDivElement;
    // addTooltip(filter_exceeptions_if_starts_with_text_box_div, "list of links that dont get deleted\n\n e.x: https://youtube.com/");

    async function saveLinkFilter(data: any) {
        if(!data || data == "") {
            data = false
        }
        const body_data = {
            data: data
        }
        let response = await fetch(
            `${config.MainURL}/save/exception_filter/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}`, 
            {
              method: 'POST', // Dodaj metodę, np. POST
              headers: {
                'Content-Type': 'application/json' // Ustaw odpowiedni nagłówek dla typu danych
              },
              body: JSON.stringify(body_data) // Dodaj ciało (body) jako JSON
            }
          );
        
        if (response.ok) {
            console.log(`save Link Filter content set to. Response: ${response.status}`);
        } else {
            console.warn(`Error `);
        }
    }

    // async function saveLinkFilterif_starts_with(data: any) {
    //     if(!data || data == "") {
    //         data = false
    //     }
    //     const body_data = {
    //         data: data
    //     }
    //     let response = await fetch(
    //         `${config.MainURL}/save/exception_is_starts_with_filter/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}`, 
    //         {
    //           method: 'POST', // Dodaj metodę, np. POST
    //           headers: {
    //             'Content-Type': 'application/json' // Ustaw odpowiedni nagłówek dla typu danych
    //           },
    //           body: JSON.stringify(body_data) // Dodaj ciało (body) jako JSON
    //         }
    //       );
    //     if (response.ok) {
    //         console.log(`save Link Filter content set to. Response: ${response.status}`);
    //     } else {
    //         console.warn(`Error `);
    //     }
    // }

    async function saveWelcomeMessage(data: string) {
        let response = await fetch(`${config.MainURL}/save/welcome_messages_content/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${data}`);
        if (response.ok) {
            console.log(`Welcome message content set to. Response: ${response.status}`);
        } else {
            console.warn(`Error `);
        }
        // Możesz wykonać inne operacje na podstawie odpowiedzi
    }

    async function saveWelcomeDmMessage(data: string) {
        let response = await fetch(`${config.MainURL}/save/welcome_dm_messages_content/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${data}`);
        if (response.ok) {
            console.log(`Welcome dm message content set to. Response: ${response.status}`);
        } else {
            console.warn(`Error `);
        }
        // Możesz wykonać inne operacje na podstawie odpowiedzi
    }

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

    // reading auto vc
    if (body.auto_vc === false) {
        auto_vc.checkbox!.checked = false;
        auto_vc.select.setAttribute("disabled", "true");
    } else if (body.auto_vc === true) {
        auto_vc.checkbox!.checked = true;
    } else {
        throw new Error("Corrupted auto vc message response data");
    }
    body.server_channels_list?.forEach((channel, _index) => {
        const option = document.createElement('option');
        option.value = channel.id;
        option.text = channel.name.length > 32 ? channel.name.substring(0, 29) + "..." : channel.name;
        auto_vc.select.options.add(option);
        // Ustaw opcję jako wybraną, jeśli jej id zgadza się z id zwróconym z serwera
        if (channel.id === body.auto_vc_channel) {
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

    // saving auto vc
    auto_vc.checkbox!.addEventListener("change", async function () {
        let response = await fetch(`${config.MainURL}/save/auto_vc/enable/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.checked}`);
        if (response.ok) {
            console.log(`Welcome message set to ${this.checked}. Response: ${response.status}`);
        } else {
            console.warn(`Error setting autorole to ${this.checked}. Refreshing`);
            handleServerClick(clickedServerId);
        }
    })
    auto_vc.select!.addEventListener("change", async function () {
        let response = await fetch(`${config.MainURL}/save/auto_vc/channel_id/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.value}`);
        if (response.ok) {
            console.log(`Welcome message channel set to ${this.value}. Response: ${response.status}`);
        } else {
            console.warn(`Error setting welcome message channel to ${this.value}. Refreshing`);
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

    //filter links checkbox
    filter_links.checkbox!.addEventListener("change", async function () {
        let response = await fetch(`${config.MainURL}/save/links_filter/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.checked}`);
        if (response.ok) {
            console.log(`filter links set to ${this.value}. Response: ${response.status}`);
        } else {
            console.warn(`Error setting dad_bot channel to ${this.value}. Refreshing`);
            handleServerClick(clickedServerId);
        }
    })

    // dad bot checkbox
    dad_bot.checkbox!.addEventListener("change", async function () {
        let response = await fetch(`${config.MainURL}/save/dad_messages/enable/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.checked}`);
        if (response.ok) {
            console.log(`Welcome dad_bot channel set to ${this.value}. Response: ${response.status}`);
        } else {
            console.warn(`Error setting dad_bot channel to ${this.value}. Refreshing`);
            handleServerClick(clickedServerId);
        }
    })

}