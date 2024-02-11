const { SlashCommandBuilder, ChannelType, PermissionsBitField, PermissionFlagsBits } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");
//TODO: dodać opcję usówania welcome z db
const command = new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("add roles to a new server member")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option => option
        .setName('role')
        .setDescription("what role user get")
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName("status")
        .setDescription("turn autorole on / off\n deafult is on")
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

    const role = interaction.options.getRole("role");
    const status = interaction.options.getBoolean("status") || true

    const server_id = interaction.guild.id;

    const data = {
        role_id: role.id,
        status: status
    };

    database.write(`${server_id}.autorole`, data);

    await interaction.reply("autorole set up!");
}

// Return message if user uses /help/welcome
async function help_message(interaction, client) {
    interaction.reply({
        content: `Set up autorole`,
        ephemeral: true,
    });
}

module.exports = { command, execute, help_message };