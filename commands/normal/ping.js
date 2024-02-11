const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("This is a ping command!");

async function execute(interaction, client) {
    
    const Database = require("../../db/database")
    const db = new Database(__dirname + "/../../db/files/servers.json");
    db.init();
    const data = db.read("727662119553728532")
    console.log(data)

    await interaction.reply("Pong!");
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Ping return "Pong!" message if bot is online`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
