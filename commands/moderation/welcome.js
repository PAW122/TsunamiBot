const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");
const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()
//TODO: dodać opcję usówania welcome z db
const command = new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Set up a welcome channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('Welcome channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName("message")
        .setDescription('Add message to welcome image')
        .setRequired(false)
    )
    .addStringOption(option => option
        .setName("dm")
        .setDescription('Add priv message to new user')
        .setRequired(false)
    )
    .addBooleanOption(option => option
        .setName("status")
        .setDescription("turn welcome messages on / off\n deafult is on")
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
    const message = interaction.options.getString("message");
    const status = interaction.options.getBoolean("status");
    const dm = interaction.options.getString("dm");

    const server_id = interaction.guild.id;
    const channel_id = channel.id;
    const server_name = channel.guild.name;

    const data = {
        name: server_name,
        welcome_channel: channel_id,
        welcome_message: message,
        welcome_status: status,
        welcome_dm_message: dm
    };

    database.write(`${server_id}`, data);

    await interaction.reply("Channel set up!");
    BotLogsHandler.SendLog(server_id, `User: <@${interaction.user.id}> set Welcome messages:\nChannel: <#${channel_id}>\nMessage: ${message}\nStatus: ${status}\ndm: ${dm}`)
}

// Return message if user uses /help/welcome
async function help_message(interaction, client) {
    interaction.reply({
        content: `Set up a welcome channel.\n \n  if you put {server_name} in the welcome message it will be converted to the server name\n \nstatus true / false - trun on / turn off welcome messages`,
        ephemeral: true,
    });
}

module.exports = { command, execute, help_message };