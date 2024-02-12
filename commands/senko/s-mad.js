const { SlashCommandBuilder } = require("discord.js");
const path = require("path")

const command = new SlashCommandBuilder()
    .setName("s-mad")
    .setDescription("mad command");

async function execute(interaction, client) {

    const asset = path.join(__dirname, "../../assets/senko/mad.gif");

    await interaction.reply({
        files: [asset]
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `Sneds senko mad gif`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
