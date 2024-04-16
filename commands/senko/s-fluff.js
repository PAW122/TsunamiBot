const { SlashCommandBuilder } = require("discord.js");
const path = require("path")

const command = new SlashCommandBuilder()
    .setName("s-fluff")
    .setDescription("fluff command");

async function execute(interaction, client) {

    const paths = ["../../assets/senko/fluff1.png", "../../assets/senko/fluff2.png", "../../assets/senko/fluff3.png"]
    const randomIndex = Math.floor(Math.random() * paths.length);

    const asset = path.join(__dirname, paths[randomIndex]);

    await interaction.reply({
        files: [asset]
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `sends senko fluff`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
