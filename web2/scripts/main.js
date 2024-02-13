var urlParams;

var loginManager;

function load() {
    loginManager = new auth()
    if (loginManager.token.token != null) {
        doFetch(`http://localhost:3000/load/server-list/${loginManager.token.token_type}/${loginManager.token.token}`, login)
    }
}

function doFetch(url, callback) {
    console.log("fetching", url)
    fetch(url)
        .then(res => res.json())
        .then(out => {
            console.log('Downloaded JSON: ', out)
            callback(out)
        })
        .catch(err => { throw err }
        );
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

class auth {
    token = {
        token: undefined,
        token_type: undefined
    }

    constructor() {
        console.debug("Trying to get new token from URL")
        this.token = this.readURL()
        if (!this.token.token) {
            console.debug("Token not found in URL. Loading token from cache")
            this.token = this.load_cached()
        }
        this.save_cache()
    }

    readURL() {
        let urlParams = new URLSearchParams(window.location.hash);
        let token = urlParams.get("access_token");
        let token_type = urlParams.get("#token_type");
        console.debug("URL: ", { token: token, token_type: token_type })
        if (token && token_type) {
            window.location.hash = ""
            return { token: token, token_type: token_type }
        }
        return { token: undefined, token_type: undefined }
    }

    load_cached({ token_path = "token", token_type_path = "token_type" } = {}) {
        let token = localStorage.getItem(token_path)
        let token_type = localStorage.getItem(token_type_path)
        console.debug("Cache: ", { token: token, token_type: token_type })
        if (token && token_type) {
            return { token: token, token_type: token_type }
        }
        return { token: undefined, token_type: undefined }
    }

    save_cache({ token_path = "token", token_type_path = "token_type" } = {}) {
        localStorage.setItem(token_path, this.token.token)
        localStorage.setItem(token_type_path, this.token.token_type)
    }

    dispose() {
        this.token = {
            token: undefined,
            token_type: undefined
        }
        this.save_cache()
    }
}

document.onload = load()
document.getElementById('logout-button').addEventListener("click", function () {
    loginManager.dispose();
    location.reload();
})