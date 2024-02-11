const { SlashCommandBuilder } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/ideas.json");

const command = new SlashCommandBuilder()
    .setName("idea")
    .setDescription("Share your idea for new bot features")
    .addStringOption(option => option
        .setName("content")
        .setDescription('describe your idea')
        .setRequired(true)
    )

async function execute(interaction, client) {
    const content = interaction.options.getString("content");
    const interaction_id = interaction.id
    const user_id = interaction.user.id
    database.init();
    database.add(`${user_id}`, {[interaction_id]: content})
    await interaction.reply("saved");
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Share your idea for new bot features`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
