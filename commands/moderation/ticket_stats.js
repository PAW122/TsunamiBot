/*
    wyświetli podsumowanią statystykę ocen satysfakcji
    użytkownikó z zamniętych ticketów
*/

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("ticket_stats")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Get ticket's statistics")

async function execute(interaction, client) {
    
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `-`,
        ephemeral: true
    })
}

module.exports = {command, execute, help_message}