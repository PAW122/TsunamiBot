const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const e = require("express");

const command = new SlashCommandBuilder()
    .setName("say")
    .setDescription("reload commands for this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option => option
        .setName("message")
        .setDescription("type message you want to send")
        .setRequired(true)
    )

async function execute(interaction, client) {
    await interaction.channel.send({
        content: interaction.options.getString("message"),
    })

    await interaction.channel.send({
        content: "Message sent",
        ephemeral: true
    })
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Use /say <message> to send message`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
