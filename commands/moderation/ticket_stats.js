/*
    wyświetli podsumowanią statystykę ocen satysfakcji
    użytkownikó z zamniętych ticketów
*/

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");

const command = new SlashCommandBuilder()
    .setName("ticket_stats")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Get ticket's statistics")

async function execute(interaction, client) {
    const guild_id = interaction.guild.id;
    const data = await database.read(`${guild_id}.closed_tickets`);
    let ratings_list = []

    Object.values(data).forEach(day => {
        day.forEach(ticket => {
            ratings_list.push(ticket.rating);
        });
    });

    const average_rating = ratings_list.reduce((a, b) => a + b, 0) / ratings_list.length;


    return await interaction.reply({
        content: `Average rating: ${average_rating}`,
        ephemeral: true
    });
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `-`,
        ephemeral: true
    })
}

module.exports = {command, execute, help_message}