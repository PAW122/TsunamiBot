// this file is a template, which will be replaced
import { drawServers } from "./ServerList.js"
import * as config from "./config.js"
import { navbarStyle } from "./helpers.js"
import { auth } from "./login.js"
import { genSettings, setting, genTextBox, addTooltip, genCheckBox, genButtonElement, genAddList } from "./settings.js"

window.onload = initial
const loginManager = new auth()

// main.ts
function initial() {

    // Kod wykonywany tylko dla podstrony /partners
    if (window.location.pathname === "/partners") {
        loadPartners();
        return;
    } else if (window.location.pathname === "/updates") {
        LoadUpdates();
        return;
    }

    navbarStyle();
    if (String(config.MainURL) === "http://localhost:3000") {
        document.getElementById("test-banner")?.classList.remove("d-none")
    }
    let login_button = document.getElementById("login-button") as HTMLLinkElement
    login_button.href = config.AuthURL

    // console.log(loginManager.token.token)

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

    document.getElementById("logout-button")?.addEventListener("click", () => {
        console.log("invalid token")
        loginManager.dispose()
        window.location.reload();
    })
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

async function LoadUpdates() {
    const response = await fetch(`${config.MainURL}/load/updates`);
    if (response.ok) {
        const updatesData = await response.json();
        const updatesContainer = document.getElementById("updates-container");
        if (updatesContainer) {
            // Iterujemy przez każdego partnera w obiekcie updatesData
            for (const key in updatesData) {
                if (Object.hasOwnProperty.call(updatesData, key)) {
                    const version = updatesData[key];
                    const updatedElemet = document.createElement("div");
                    updatedElemet.classList.add("update");
                    // Tworzymy HTML z danymi partnera
                    updatedElemet.innerHTML = `
                        <div class="updates-info">
                            <div class="partner-details">
                                <h2>${version.Version}</h2>
                                <h1>${version.Name}</h1>
                                ${version.Date ? `<a>Date: ${version.Date}</a>` : "Date: N/A"}
                                ${version.Description ? `<p>Description: <a>${version.Description}</a></p>` : ""}
                            </div>
                        </div>
                    `;
                    updatesContainer.appendChild(updatedElemet);
                }
            }
        }
    } else {
        console.log("response error")
    }
}

async function login() {
    let response = await fetch(`${config.MainURL}/load/server-list/${loginManager.token.token_type}/${loginManager.token.token}`);
    let json = await response.json();
    if (json?.error && json.error === "invalid_token") {
        loginManager.dispose();
        window.location.reload();
        return false
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

    return true
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

    //mod logs messages
    let modlogsMessages = genSettings(settings_parent, "Mod Logs messages", true);

    //bot logs messages
    let BotlogsMessages = genSettings(settings_parent, "Bot Logs", true);

    //welcome channel
    let welcome_channel = genSettings(settings_parent, "Welcome Channel", true);

    let invite_tracker = genSettings(settings_parent, "Invite Tracker", true);

    let auto_vc = genSettings(settings_parent, "Auto create vc", true);

    let ticket_channel = genSettings(settings_parent, "Ticket Channel", true);

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

    // let add_custom_commands_list = genAddList(settings_parent, "custom_commands_list")

    // let filter_exceeptions_if_starts_with = genTextBox(settings_parent, "Filter 'if_starts_with' exceeptions", body.filter_links_exception_if_starts_with, saveLinkFilterif_starts_with);
    // let filter_exceeptions_if_starts_with_text_box_div = filter_exceeptions_if_starts_with.input.parentElement!.previousElementSibling as HTMLDivElement;
    // addTooltip(filter_exceeptions_if_starts_with_text_box_div, "list of links that dont get deleted\n\n e.x: https://youtube.com/");

    async function saveLinkFilter(data: any) {
        if (!data || data == "") {
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

    function manage_select_lists(parent_object,list, checkbox_value, selected_channel, error_message) {

        if (checkbox_value === false) {
            parent_object.checkbox!.checked = false;
            parent_object.select.setAttribute("disabled", "true");
        } else if (checkbox_value === true) {
            parent_object.checkbox!.checked = true;
        } else {
            console.error(error_message);
        }
        list?.forEach((channel, _index) => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.text = channel.name.length > 32 ? channel.name.substring(0, 29) + "..." : channel.name;
            parent_object.select.options.add(option);
            if (channel.id === selected_channel) {
                option.selected = true;
            }
        });
    }

    manage_select_lists(
        modlogsMessages,
        body.server_channels_list,
        body.modlogsMessages_enable,
        body.modlogsMessages_channel,
        "Corrupted modlogsMessages response data"
    )

    manage_select_lists(
        autorole,
        body.server_roles_list,
        body.autorole_enable,
        body.autorole_role.id,
        "Corrupted autorole response data"
    )

    manage_select_lists(
        BotlogsMessages,
        body.server_channels_list,
        body.BotlogsMessages_enable,
        body.BotlogsMessages_channel,
        "Corrupted bot logs messages response data"
    )

    manage_select_lists(
        welcome_channel,
        body.server_channels_list,
        body.welcome_message_enable,
        body.welcome_message_channel.id,
        "Corrupted welcome channel response data"
    )

    manage_select_lists(
        invite_tracker,
        body.server_channels_list,
        body.inviteTracker_enable,
        body.inviteTracker_chanel,
        "Corrupted invite tracker response data"
    )

    manage_select_lists(
        auto_vc,
        body.server_channels_list,
        body.auto_vc,
        body.auto_vc_channel,
        "Corrupted auto vc response data"
    )

    manage_select_lists(
        ticket_channel,
        body.server_channels_list,
        body.tikcet_status,
        body.ticket_channel,
        "Corrupted ticket channel response data"
    )

    async function saving_changes(parent, checkbox_link, selectlist_link, name) {
        // saving autorole switches
        parent.checkbox!.addEventListener("change", async function () {
            let response = await fetch(`${config.MainURL}${checkbox_link}${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.checked}`);
            if (response.ok) {
                console.log(`${name} set to ${parent.checkbox?.checked}. Response: ${response.status}`);
            } else {
                console.warn(`Error setting ${name} to ${parent.checkbox?.checked}. Refreshing`);
                handleServerClick(clickedServerId);
            }
        })
        parent.select!.addEventListener("change", async function () {
            let response = await fetch(`${config.MainURL}${selectlist_link}${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.value}`);
            if (response.ok) {
                console.log(`${name} role set to ${this.value}. Response: ${response.status}`);
            } else {
                console.warn(`Error setting ${name} to ${this.value}. Refreshing`);
                handleServerClick(clickedServerId);
            }
        })
    }

    saving_changes(
        autorole,
        "/save/auto_role_status/",
        "/save/auto_role_id/",
        "autorole"
    )

    saving_changes(
        auto_vc,
        "/save/auto_vc/enable/",
        "/save/auto_vc/channel_id/",
        "auto voice chat"
    )

    saving_changes(
        modlogsMessages,
        "/save/modlogs_channel_enable/",
        "/save/modlogs_channel_id/",
        "mod logs messages"
    )

    saving_changes(
        BotlogsMessages,
        "/save/botlogsMessages_enable/",
        "/save/botlogsMessages_channel/",
        "bot logs messages"
    )

    saving_changes(
        welcome_channel,
        "/save/modlogs_channel_id/",
        "/save/welcome_messages_channel/",
        "welcome channel"
    )

    saving_changes(
        invite_tracker,
        "/save/invite_tracker_enable/",
        "/save/invite_tracker_channel/",
        "invite tracker"
    )

    saving_changes(
        ticket_channel,
        "/save/tikcet_status/",
        "/save/tikcet_channel/",
        "ticket channel"
    )

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