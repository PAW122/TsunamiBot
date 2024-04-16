const Discord = require("discord.js")
const fs = require("fs")

module.exports = (client) => {

    client.command = new Discord.Collection();

    const komendyFolders = fs.readdirSync(__dirname + `/../commands/`)

    for (const file of komendyFolders) {
        const {command_data, execute, help} = require(__dirname + `/../commands/${file}`);
        client.command.set(command_data.name, {command_data, execute, help});
    }
}