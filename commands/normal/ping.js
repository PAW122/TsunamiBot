const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("This is a ping command!");

async function execute(interaction, client) {
    //console.log(client)
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
