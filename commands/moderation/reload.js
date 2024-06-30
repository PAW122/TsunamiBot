const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()

const { registerSlashCommandsForGuild, unregisterAllCommandsForGuild } = require("../../handlers/SlashCommandHandler")

const command = new SlashCommandBuilder()
    .setName("reload")
    .setDescription("reload commands for this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

async function execute(interaction, client) {
    const guild = interaction.guild

    await interaction.reply("commands are being refreshed. This may take a few minutes");
    BotLogsHandler.SendLog(guild.id, `User: <@${interaction.user.id}> Reloaded Bot commands for this server.`)

    await unregisterAllCommandsForGuild(guild, client)
    await registerSlashCommandsForGuild(guild, client)
    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ content: `commands are refreshed ✅` })
    }
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `If any of the commands are not working properly, try using **/reload** to refresh the commands`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
