const { SlashCommandBuilder } = require("discord.js");
const path = require("path")

const command = new SlashCommandBuilder()
    .setName("s-protecc")
    .setDescription("protecc command");

async function execute(interaction, client) {

    const gifPath = path.join(__dirname, "../../assets/senko/jojo.png");

    await interaction.reply({
        content: "No bullying allowed!",
        files: [gifPath]
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `Sends senko protecc`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
