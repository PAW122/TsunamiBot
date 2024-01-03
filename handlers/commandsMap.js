//towrzy mapę wszystkich komend w /commands aby póżniej wywoływać odpowiednie komendy bez przeszukiwania za każdym razem folderów.
const fs = require('fs');

const commandsMap = new Map();

const commandsDir = fs.readdirSync(__dirname + '\\..\\commands', { withFileTypes: true });
//every command file need to have same file name and command name !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
for (const dirEntry of commandsDir) {
    if (dirEntry.isDirectory()) {
        const subDir = dirEntry.name;
        const subDirPath = __dirname + `\\..\\commands\\${subDir}`;
        const commandFiles = fs.readdirSync(subDirPath).filter(file => file.endsWith(".js"));

        for (const commandFile of commandFiles) {
            const commandName = commandFile.slice(0, -3); // Remove '.js' extension
            const filePath = `${subDirPath}\\${commandFile}`;

            commandsMap.set(commandName, filePath);
        }
    }
}

function return_commands() {
    return commandsMap
}

module.exports = { commandsMap, return_commands };
