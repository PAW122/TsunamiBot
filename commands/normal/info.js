const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("info")
    .setDescription("Informations about project");

async function execute(interaction) {
    await interaction.reply(`Hello, I'm starting to create a Tsunami Cat Bot discord bot project. More bot features will be added over time, bot development will accelerate if I get any response from tsu <3.
    
    The plans include economics, statistics, a bot website and much more. Soon it will be possible to add your suggestions for new bot functions`);
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Provide informations about Project.`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
