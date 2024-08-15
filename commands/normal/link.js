const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("link")
    .setDescription("Send bot invite link");

async function execute(interaction) {
    // TODO wczytywanie z configu
    await interaction.reply("https://discord.com/oauth2/authorize?client_id=1273451611422724220&permissions=8&integration_type=0&scope=applications.commands+bot");
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Send bot invite link`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
