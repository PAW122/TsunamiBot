const { SlashCommandBuilder } = require("discord.js");
const path = require("path")

const command = new SlashCommandBuilder()
    .setName("s-bruh")
    .setDescription("bruh command");

async function execute(interaction, client) {

    const asset = path.join(__dirname, "../../assets/senko/bruh.jpg");

    await interaction.reply({
        files: [asset]
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `sends senko bruh`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
