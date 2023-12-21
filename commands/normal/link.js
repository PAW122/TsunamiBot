const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("link")
    .setDescription("Send bot invite link");

async function execute(interaction) {
    await interaction.reply("https://discord.com/api/oauth2/authorize?client_id=928399458570502155&permissions=8&scope=bot+applications.commands");
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Send bot invite link`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
