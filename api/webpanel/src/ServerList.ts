export function drawServers(servers: any) {
    let serversContainer = document.getElementById("servers") as HTMLDivElement
    servers.forEach(function (server) {
        let parentDiv = document.createElement("div")
        parentDiv.classList.add("d-flex", "p-3", "bg-body-secondary", "rounded")
        let icon = document.createElement("img") as HTMLImageElement
        icon.src = `https://cdn.discordapp.com/icons/${server["id"]}/${server["icon"]}.png`
        icon.height = 25
        icon.classList.add("me-2", "rounded")
        let name = document.createElement("div") as HTMLDivElement
        name.textContent = server["name"]
        parentDiv.append(icon, name)
        serversContainer.appendChild(parentDiv)
    })
}