export function drawServers(servers: any, onClickHandler: (serverId: string) => void) {
    let serversContainer = document.getElementById("servers") as HTMLDivElement;
    servers.forEach(function (server) {
        let parentDiv = document.createElement("button");
        parentDiv.classList.add("d-flex", "p-3", "bg-body-secondary", "rounded", "align-items-center");
        parentDiv.value = server.id;
        parentDiv.onclick = function() {
            onClickHandler(server.id);
        };

        let icon = document.createElement("img") as HTMLImageElement;
        if(!server.icon || server.icon === undefined || server.icon === null) {
            icon.src = `https://w7.pngwing.com/pngs/609/846/png-transparent-discord-logo-discord-computer-icons-logo-computer-software-avatar-miscellaneous-blue-angle.png`
        } else {
            icon.src = `https://cdn.discordapp.com/icons/${server.id}/${server.icon}.png`;
        }
        icon.height = 25;
        icon.classList.add("me-2", "rounded");

        let name = document.createElement("div") as HTMLDivElement;
        name.textContent = server.name;

        parentDiv.append(icon, name);
        serversContainer.appendChild(parentDiv);
    });
}
