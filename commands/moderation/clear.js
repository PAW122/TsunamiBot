const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Cooldowns = require("../../handlers/cooldowns")

const cooldowns = new Cooldowns();

const command = new SlashCommandBuilder()
    .setName("clear")
    .setDescription("delete some messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addNumberOption(option => option
        .setName("amount")
        .setDescription("amount of messages to delete")
        .setRequired(true)
    );

async function execute(interaction, client) {
    const guild = interaction.guild.id
    const user_id = interaction.user.id
    const to_delete = interaction.options.getNumber('amount');

    //check for cooldowns
    if (!cooldowns.isEnd(`${guild}.${user_id}.clear`)) {
        return interaction.reply({
            content: `Wait for cooldown to end. (10s)`,
            ephemeral: true
        })
    }

    cooldowns.add(`${user_id}.clear`, 10, "s")//cooldown 30s

    try {
        interaction.channel.bulkDelete(to_delete, true)
    } catch (err) {
        return (interaction.reply({ content: "I can't delete the message", ephemeral: true }));
    }

    const embed2 = new EmbedBuilder()
        .setTitle('clear')
        .setDescription(`deleted ${to_delete} messages`)
        .setTimestamp()
    interaction.reply({ embeds: [embed2] })
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `delete a certain number of messages`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
