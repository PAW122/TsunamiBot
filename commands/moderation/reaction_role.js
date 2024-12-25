const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()

const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");

const command = new SlashCommandBuilder()
    .setName("reaction_role")
    .setDescription("add reaction role to message")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option => option
        .setName("emoji")
        .setDescription("select emoji users will be reacting with")
        .setRequired(true)
    )
    .addRoleOption(option => option
        .setName("role")
        .setDescription("select role you want to give to users")
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName("message_id")
        .setDescription("id of message users will be adding emoji to")
        .setRequired(true)
    )
    .addChannelOption(option => option 
        .setName("channel")
        .setDescription("channel witch on is message")
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName("status")
        .setDescription("True - on, False - off")
        .setRequired(false)
    )

async function execute(interaction, client) {
    const guild = interaction.guild
    const guild_id = guild.id
    const role = interaction.options.getRole("role")//get role id from role
    const message_id = interaction.options.getString("message_id")// msg id from options
    const emoji = interaction.options.getString("emoji")
    const channel = interaction.options.getChannel("channel")
    const status = interaction.options.getBoolean("status")
    const name = "added_by_command"

    database.init()

    if(!guild_id || !role.id || !role.name || !message_id || !channel.id || !emoji || !name) {
        return await interaction.reply({
            content: "error procesing command",
            ephemeral: true
        })
    }

    const save_data = {
        emoji: emoji,
        status: status || true,
        role_id: role.id,
        name: role.name,
    }

    database.addToList(`${guild_id}.reaction_role.${channel.id}.${message_id}`, save_data)

    BotLogsHandler.SendLog(guild.id, `Reaction role set on bot website\n channel_id: ${channel.id}\n message_id: ${message_id}`)

    return await interaction.reply({
        content: `set reaction role with emoji ${emoji} to message id: ${message_id} on channel: <#${channel.id}>`,
        ephemeral: true
    })
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `If any of the commands are not working properly, try using **/reload** to refresh the commands`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
