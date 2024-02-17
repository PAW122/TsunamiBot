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
    let userinfo = serverListResponse["user"]
    let x = document.querySelector("#username-text") as HTMLDivElement
    x.textContent = `@${userinfo["username"]}`;
    let y = document.getElementById("profile-picture") as HTMLImageElement
    y.src = `https://cdn.discordapp.com/avatars/${userinfo["id"]}/${userinfo["avatar"]}.jpg`;
    let servers = serverListResponse["servers"];
    drawServers(servers)
    document.querySelector("#logout-button") ?.addEventListener("click", function() {
        loginManager.dispose()
        window.location.reload()
    })
}
