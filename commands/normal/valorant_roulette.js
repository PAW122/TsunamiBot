var fortunes = [
    "Brimstone",
    "Phoenix",
    "Sage",
    "Sova",
    "Viper",
    "Cypher",
    "Reyna",
    "Kiljoy",
    "breach",
    "Omen",
    "Jett",
    "Raze",
    "Skye",
    "Yoru",
    "Astra",
    "Kay/O",
    "Chamber",
    "Neon",
    "Fade",
    "Harbor",
    "Gekko",
    "Deadlock",
    "Iso",
    "Clove"
];

const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("valorant_roulette")
    .setDescription("get random agent to play next match");

async function execute(interaction) {
    await interaction.reply(`***${fortunes[Math.floor(Math.random() * fortunes.length)]}***`);
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `send one of this agents:
        ${fortunes}`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
