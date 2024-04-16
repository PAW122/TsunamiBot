const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("s-spank")
    .setDescription("spank command");

async function execute(interaction, client) {

    await interaction.reply({
        content: "Uhnnn, why would you spank me, Master? Did I do anything wrong?"
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `Sends senko spank`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
