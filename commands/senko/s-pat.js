const { SlashCommandBuilder } = require("discord.js");
const path = require("path")

const command = new SlashCommandBuilder()
    .setName("s-pat")
    .setDescription("pat command");

async function execute(interaction, client) {

    const gifPath = path.join(__dirname, "../../assets/senko/pat.gif");

    await interaction.reply({
        files: [gifPath]
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `Sneds senko pat git`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
