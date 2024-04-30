const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");

const command = new SlashCommandBuilder()
    .setName("auto_vc")
    .setDescription("creates vc when someone joins")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option => option
        .setName('channel')
        .setDescription('Create trigger channel')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName("status")
        .setDescription("turn auto vc on / off\n default is on")
        .setRequired(false) 
    );

async function execute(interaction) {
    database.init();

    const channel = interaction.options.getChannel('channel');
    const status = interaction.options.getBoolean("status") ?? true;
    const server_id = interaction.guild.id;

    let vcChannelID = null;

    // Check if the specified channel exists

    vcChannelID = channel.id;


    // Save the voice channel ID to the database
    database.write(`${server_id}.auto_vc.${vcChannelID}`, { auto_vc: { channel_id: vcChannelID, status: status } });

    await interaction.reply({
        content: `Auto VC channel set to <#${vcChannelID}> with status ${status ? "on" : "off"}.`,
        ephemeral: true
    });
}

// Return message if user uses /help/welcome
async function help_message(interaction, client) {
    interaction.reply({
        content: `Set up auto VC channels`,
        ephemeral: true,
    });
}

module.exports = { command, execute, help_message };
