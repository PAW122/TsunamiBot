const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("random")
    .setDescription("send random number 0 - max_number")
    .addNumberOption((option) =>
        option
            .setName("max_number")
            .setDescription("max random number")
            .setRequired(true)
    );

async function execute(interaction) {
    const rng = interaction.options.get("max_number").value
    await interaction.reply(`your random number from 0 to ${rng} is: **${Math.floor(Math.random() * rng)}**`);
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `send random number from 0 to your choice`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
