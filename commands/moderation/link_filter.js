const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");
const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()

const command = new SlashCommandBuilder()
    .setName("link_filter")
    .setDescription("Delete messages with links")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption(option => option
        .setName("status")
        .setDescription("turn auto vc on / off\n default is on")
        .setRequired(false)
    );

async function execute(interaction, client) {
    database.init();

    const server_id = interaction.guild.id
    const status = interaction.options.getBoolean("status") ?? true;


    database.write(`${server_id}.link_filter`, { status: status, exception: [], exception_if_starts_with: [] })

    await interaction.reply({ content: `Set status: ${status ? "on" : "off"}\n\nyou can add links that do not want to be removed on the bot's website`, ephemeral: true });
    BotLogsHandler.SendLog(server_id, `User: <@${interaction.user.id}> set filter link:\nstatus: ${status}`)
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Ping return "Pong!" message if bot is online`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
