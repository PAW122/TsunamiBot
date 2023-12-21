var fortunes = [
    "**Yes**",
    "**No**",
    "**Maybe**",
    "**I don't know**",
    "**Probably**",
    "**I guess**",
    "**I'm not sure**",
    "**Surely**"
];

const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("sends a random reply");

async function execute(interaction) {
    await interaction.reply(`${fortunes[Math.floor(Math.random() * 8)]}`);
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `send one of this sentences:
        ${fortunes}`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
