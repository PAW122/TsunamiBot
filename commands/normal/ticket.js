const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const calculate_lvl = require("../../handlers/calculateLvl")
const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/servers.json")

const command = new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("view your level information")
    .addStringOption((option) =>
        option
            .setName("content")
            .setDescription("ticket content")
            .setRequired(true)
    );

async function execute(interaction, client) {
    const guild_id = interaction.guild.id

    const content = interaction.options.getString('content')
    db.init()
    const ticket_channel = await db.read(`${guild_id}.ticketChannel`)
    const channel = await client.channels.fetch(ticket_channel.channel_id);
    if (ticket_channel && ticket_channel.status === false) return await interaction.reply({content: "Tikcet system is off on this server", ephemeral: true})
    if (!ticket_channel || !ticket_channel.status || !channel) return await interaction.reply({ content: "Ticket system is not set up on this server.", ephemeral: true })
    if (!content) return await interaction.reply({ content: "Can't send empty ticket", ephemeral: true })

    const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Ticket from: ${interaction.user.username}`)
        .setDescription(`${content}`)
        .setTimestamp();

    await channel.send({embeds: [embed]})
    await interaction.reply("Ticket send")
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `send ticket to server administration\n*requires to setup /ticket_channel by server administrator`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
