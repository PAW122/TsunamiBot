const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
//dodać drógą komendę która pozwala na autorole po id wiadomości!!

const Database = require("../../db/database");
const database = new Database(__dirname + "\\..\\..\\db\\files\\servers.json");


const command = new SlashCommandBuilder()
    .setName("reaction-role")
    .setDescription("get role using reactions")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addRoleOption(option => option
        .setName('role')
        .setDescription("what role user get")
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName("content")
        .setDescription("Content of the message")
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName("emoji")
        .setDescription("what emoji use to get role")
        .setRequired(true)
    )
    .addNumberOption(option => option
        .setName("id")
        .setDescription("select from 1 to 10 the id you want to assign the authorole to")
        .setRequired(true)
    )

async function execute(interaction) {

    const role = interaction.options.getRole("role");
    const content = interaction.options.getString("content");
    const emoji = interaction.options.getString("emoji");
    const id = interaction.options.getNumber("id");

    const server_id = interaction.guild.id;
    const channel_id = channel.id;

    if (id > 10 || id < 10) {
        interaction.reply({
            content: `you need to choose a number from 1 to 10.
            You can have a maximum of 10 autoroles per server, if you assign an autorole to an id that another autorola had, the information will be overwritten`,
            ephemeral: true
        })
        return;
    }

    //send message
    try {
        interaction.send(`${content}`).react(`${emoji}`)
    } catch (err) {
        interaction.send("Wystąpił błąd podczas wysyłania wiadomości")
    }

    const data = {
        role: role,
        emoji: emoji,
        channel_id: channel_id
    }
    database.write(`${server_id}.reactionRoles.${id}`, data);

}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Ping return "Pong!" message if bot is online`,
        ephemeral: true
    })
}

//module.exports = { command, execute, help_message };
