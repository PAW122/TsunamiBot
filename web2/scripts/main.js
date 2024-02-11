document.onload = load()
document.logout = logout;

var urlParams;

function load() {
    urlParams = new URLSearchParams(window.location.hash);
    let token = urlParams.get("access_token");
    let token_type = urlParams.get("#token_type");
    if (token && token_type) {
        console.log(`token_type: ${token_type}`);
        console.log(`token: ${token}`);
        fetch(`http://localhost:3000/load/server-list/${token_type}/${token}`)
            .then(res => res.json())
            .then(out => {
                console.log('Downloaded JSON: ', out)
                login(out)
            })
            .catch(err => { throw err }
            );
    } else {
        console.log("token not found");
    }
}

function login(serverListResponse) {
    let userinfo = serverListResponse["user"]
    document.querySelectorAll(".profile-logout").forEach(function (el) {
        el.classList.add("d-none");
    })
    document.querySelectorAll(".profile-login").forEach(function (el) {
        el.classList.remove("d-none");
    })
    document.getElementById("username-text").textContent = `@` + userinfo["username"];
    document.getElementById("profile-picture").src = `https://cdn.discordapp.com/avatars/${userinfo["id"]}/${userinfo["avatar"]}.jpg`;
    let servers = serverListResponse["servers"];
    let serversContainer = document.getElementById("servers");
    servers.forEach(function (server) {
        let parentDiv = document.createElement("div");
        parentDiv.classList.add("d-flex", "p-3", "bg-body-secondary", "rounded");
        let icon = document.createElement("img");
        icon.src = `https://cdn.discordapp.com/icons/${server["id"]}/${server["icon"]}.png`;
        icon.height = "25";
        icon.classList.add("me-2", "rounded")
        let name = document.createElement("div");
        name.textContent = server["name"];
        parentDiv.append(icon, name);
        serversContainer.appendChild(parentDiv);
    })
}

function logout() {
    document.getElementById("servers").innerHTML = "";
    document.querySelectorAll(".profile-logout").forEach(function (el) {
        el.classList.remove("d-none");
    })
    document.querySelectorAll(".profile-login").forEach(function (el) {
        el.classList.add("d-none");
    })
}