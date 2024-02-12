const { SlashCommandBuilder } = require("discord.js");
const path = require("path")

const command = new SlashCommandBuilder()
    .setName("s-bread")
    .setDescription("bread command");

async function execute(interaction, client) {

    const asset = path.join(__dirname, "../../assets/senko/bread.png");

    await interaction.reply({
        files: [asset]
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `sends senko bread`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
