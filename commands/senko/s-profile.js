//staty z /love i /hate

const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("s-profile")
    .setDescription("pat command");

async function execute(interaction, client) {

    interaction.reply({
        content: "todo",
        ephemeral: true // Optional, makes the message visible only to the user who triggered the command
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `Sned senko pat git`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
