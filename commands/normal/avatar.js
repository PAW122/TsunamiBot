const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get avatar")
    .addUserOption((option) =>
        option
            .setName("tag_person")
            .setDescription("tag a person to see their avatar")
            .setRequired(true)
    );

async function execute(interaction) {
    const user = interaction.options.getUser('tag_person')

    const embed2 = new EmbedBuilder()
                .setColor("Blue")
                .setTitle('Avatar')
                .setDescription(`Avatar user ${user}\n[press here](${user.avatarURL({ dunamic: true, size: 2048 })}), to see the avatar in higher resolution`)
                .setImage(user.avatarURL({ dynamic: true, size: 512 }))
                .setTimestamp()

    await interaction.reply({
        embeds: [embed2]
    })
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `sends the avatar of the person you tag`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };