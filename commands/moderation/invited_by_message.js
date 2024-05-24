const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");
const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()

const command = new SlashCommandBuilder()
    .setName("invited_by_message")
    .setDescription("when new user join server send message who invited was used")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('message channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName("status")
        .setDescription("turn invite tracker on / off\n deafult is on")
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
    let status = interaction.options.getBoolean("status");

    if(status === null) {
        status = true
    }

    const server_id = interaction.guild.id;
    const channel_id = channel.id;

    const data = {
        channel_id: channel_id,
        status: status
    };

    database.write(`${server_id}.invite_tracker`, data);

    await interaction.reply("Channel set up!");
    BotLogsHandler.SendLog(server_id, `User: <@${interaction.user.id}> set Invite tracker:\nChannel: <#${channel_id}>\nStatus: ${status}`)
}

// Return message if user uses /help/welcome
async function help_message(interaction, client) {
    interaction.reply({
        content: `Set up invite tracker, chose channel to send message who created invite link when someone join server`,
        ephemeral: true,
    });
}

module.exports = { command, execute, help_message };