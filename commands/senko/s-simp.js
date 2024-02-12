const { SlashCommandBuilder } = require("discord.js");
const path = require("path")

const command = new SlashCommandBuilder()
    .setName("s-simp")
    .setDescription("simp command");

async function execute(interaction, client) {

    const asset = path.join(__dirname, "../../assets/senko/simp.jpg");

    await interaction.reply({
        files: [asset]
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `sends senko simp`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
