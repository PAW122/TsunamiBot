const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("dashboard")
    .setDescription("link to dashboard page");

async function execute(interaction, client) {
    await interaction.reply("https://senko.tsunamistudio.net");
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Link to bot webside and dashboard`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
