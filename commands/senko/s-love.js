const { SlashCommandBuilder } = require("discord.js");
const path = require("path")

const command = new SlashCommandBuilder()
    .setName("s-love")
    .setDescription("love command");
    //TODO opcja /s-love @user

async function execute(interaction, client) {

    const asset = path.join(__dirname, "../../assets/senko/love.gif");

    await interaction.reply({
        files: [asset]
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `sends senko love`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
