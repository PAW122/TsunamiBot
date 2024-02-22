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

    const body = {
        tokenType: loginManager.token.token_type,
        token: loginManager.token.token,
        server_id: clickedServerId
    };
    
    console.log("loaded")
    console.log(body)
    interface MyResponse {
        welcome_message_content: string;
        welcome_message_enable: boolean;
        welcome_message_channel: any;
        server_channels_list: any;
        autorole_enable: boolean;
        autorole_role: any;
        server_roles_list: any;
    }

    fetch(`${config.MainURL}/full_load/content`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then((response: Response) => {
        return response.json(); // Parsowanie odpowiedzi do JSON
    })
        .then((data: MyResponse) => {
            // Tutaj możesz uzyskać dostęp do welcome_message_content
            //const welcomeMessageContent = data.welcome_message_content;
            const welcome_message_enable = data.welcome_message_enable;
            const welcome_message_channel = data.welcome_message_channel;
            const server_channels_list = data.server_channels_list;
            const autorole_enable = data.autorole_enable;
            const autorole_role = data.autorole_role;
            const server_roles_list = data.server_roles_list;


            welcomeMessageCheck.checked = welcome_message_enable
            autoroleCheck.checked = autorole_enable
            server_channels_list?.forEach((channel, _index) => {
                const option = document.createElement('option');
                option.value = channel.id;
                option.text = channel.name.length > 32 ? channel.name.substring(0, 29) + "..." : channel.name;
                welcomeChannelSelect.options.add(option)

                // Ustaw opcję jako wybraną, jeśli jej id zgadza się z id zwróconym z serwera
                if (channel.id === welcome_message_channel.id) {
                    option.selected = true;
                }
            });
            if(server_roles_list) {
                server_roles_list.forEach((role, _index) => {
                    const option = document.createElement('option');
                    option.value = role.id;
                    option.text = role.name.length > 32 ? role.name.substring(0, 29) + "..." : role.name;
                    autoroleSelect.options.add(option)
                    // Ustaw opcję jako wybraną, jeśli jej id zgadza się z id zwróconym z serwera
                    if (role.id === autorole_role.id) {
                        option.selected = true;
                    }
                });
            }

        })
        .catch((error: Error) => {
            console.log(error)
        });

    // Save Welcome Messages status
    welcomeMessageCheck!.addEventListener("change", function () {
        doFetch(`${config.MainURL}/save/welcome_messages_status/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${welcomeMessageCheck.checked}`, (res) => {
            console.log(`Welcome message set to ${welcomeMessageCheck.checked}. Response: `, res)
        })
    })
    // Save Auto Role status
    autoroleCheck!.addEventListener("change", function () {
        doFetch(`${config.MainURL}/save/auto_role_status/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${autoroleCheck.checked}`, (res) => {
            console.log(`Autorole set to ${autoroleCheck.checked}. Response: `, res)
        })
    })
    // save welcome channels
    welcomeChannelSelect!.addEventListener("change", function () {
        doFetch(`${config.MainURL}/save/welcome_messages_channel/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${welcomeChannelSelect.value}`, (res) => {
            console.log(`Welcome Message Channel set to: ${welcomeChannelSelect.value}. Response: `, res)
        })
    });
    // save autorole roles
    autoroleSelect!.addEventListener("change", function () {
        doFetch(`${config.MainURL}/save/auto_role_id/${loginManager.token.token_type}/${loginManager.token.token}/${clickedServerId}/${this.value}`, (res) => {
            console.log(`Autorole Selected: ${autoroleSelect.value}. Response: `, res)
        })
    })

}