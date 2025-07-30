const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");
const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()

/*

Database structure:

server_id: {
    leave_messages: {
        status: boolean, // true if enabled, false if disabled
        channel_id: string, // ID of the channel where the message will be sent
    }
*/

const command = new SlashCommandBuilder()
    .setName("leave_message")
    .setDescription("Set up a message to be sent when a user leaves the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option => option
        .setName("channel")
        .setDescription("Channel where the leave message will be sent")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    )
    .addBooleanOption(option => option
        .setName("status")
        .setDescription("on / off\n default is on")
        .setRequired(false)
    );

async function execute(interaction, client) {
    database.init();

    const server_id = interaction.guild.id
    const status = interaction.options.getBoolean("status") ?? true;
    const channel_id = interaction.options.getChannel("channel").id

    database.write(`${server_id}.leave_messages`, { status: status,  channel_id: channel_id })

    await interaction.reply({ content: `Set status: ${status ? "on" : "off"}\n`, ephemeral: true });
    BotLogsHandler.SendLog(server_id, `User: <@${interaction.user.id}> set leave_message:\nstatus: ${status}`)
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Leave Message command allows you to set a channel where a message will be sent when a user leaves the server.\n\nUsage: /leave_message <channel> [status]\n\n- channel: The channel where the leave message will be sent.\n- status: Optional, true to enable or false to disable the leave message.`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
