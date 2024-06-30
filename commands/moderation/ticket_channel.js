const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");
const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()

//TODO: dodać opcję usówania welcome z db
const command = new SlashCommandBuilder()
    .setName("ticket_channel")
    .setDescription("Set up a ticket channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('ticket channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName("status")
        .setDescription("turn modlogs on / off\n deafult is on")
        .setRequired(false) 
    );

async function execute(interaction) {
    database.init();
    // Check if the user has administrator permissions
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({
            content: "You must have administrator permissions to use this command.",
            ephemeral: true, // Only visible to the user who used the command
        });
    }

    const channel = interaction.options.getChannel('channel');
    const channel_id = channel.id
    let status = interaction.options.getBoolean("status");
    if(status === undefined || status === null) {
        status = true
    }

    const server_id = interaction.guild.id;

    const data = {
        channel_id: channel_id,
        status: status
    };

    database.write(`${server_id}.ticketChannel`, data);

    await interaction.reply("Channel set up!");
    BotLogsHandler.SendLog(server_id, `User: <@${interaction.user.id}> set Ticket Channel:\nchannel: <#${channel_id}>\n status: ${status}`)
}

// Return message if user uses /help/welcome
async function help_message(interaction, client) {
    interaction.reply({
        content: `Set up channel for tickets. When user use /ticket -> ticket content is send on this channel`,
        ephemeral: true,
    });
}

module.exports = { command, execute, help_message };