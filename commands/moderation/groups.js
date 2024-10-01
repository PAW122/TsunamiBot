/*
    włączanie / wyłączanie możliwości użycia funkcji
*/

const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");
const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()

const command = new SlashCommandBuilder()
    .setName("groups")
    .setDescription("allow users to create groups")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) => option
        .setName("category_name")
        .setDescription("set name for category")
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName("status")
        .setDescription("turn groups on / off")
        .setRequired(false)
    );

async function execute(interaction, client) {
    database.init();

    const category_name = interaction.options.getString('category_name');
    const status = interaction.options.getBoolean("status");
    const server_id = interaction.guild.id;

    // Sprawdzenie, czy kategoria o podanej nazwie istnieje
    let category = interaction.guild.channels.cache.find(
        channel => channel.name === category_name && channel.type === 4 // Typ 4 to kategoria
    );

    // Jeśli kategoria nie istnieje, stwórz ją
    if (!category) {
        category = await interaction.guild.channels.create({
            name: category_name,
            type: 4, // Typ 4 oznacza kategorię
        });
        console.log(`Stworzono nową kategorię o nazwie ${category_name}`);
    } else {
        console.log(`Kategoria o nazwie ${category_name} już istnieje`);
    }


    const categoryId = category.id;
    if(!categoryId) {
        return await interaction.reply("error incorect category id");
    }

    database.write(`${server_id}.groups`, { settings: { category_name: category_name,category_id: categoryId, status: status } });
    BotLogsHandler.SendLog(server_id, `User: <@${interaction.user.id}> set up groups with status: ${status}`)

    await interaction.reply({
        content: `Groups set with status ${status ? "on" : "off"}.`,
        ephemeral: true
    });
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `Set groups function -  allow users to create new channel in specified group`,
        ephemeral: true,
    });
}

module.exports = { command, execute, help_message };