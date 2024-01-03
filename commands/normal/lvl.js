const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const calculate_lvl = require("../../handlers/calculateLvl")
const Database = require("../../db/database")
const db = new Database(__dirname + "\\..\\..\\db\\files\\servers.json")

const command = new SlashCommandBuilder()
    .setName("lvl")
    .setDescription("view your level information")
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("view someone level information")
            .setRequired(false)
    );

async function execute(interaction, client) {
    const user_option = interaction.options.getUser('user')
    db.init()

    if (!user_option) {
        //show author data
        const user = interaction.user.id
        const guild = interaction.guild.id
        const user_data = await db.read(`${guild}.users_lvls.${user}`)
        if (!user_data) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${interaction.user.username}`)
                .setDescription(`**Level:** 0\n**XP:** 0\n**Messages:** 0`)
                .setTimestamp();

            return await interaction.reply({ embeds: [embed] })
        }
        const xp = user_data.xp
        const messages = user_data.messages

        const lvl_calculator = calculate_lvl(xp)
        const level = lvl_calculator.level
        const remainingXP = lvl_calculator.remainingXP
        const NextLevel = lvl_calculator.NextLevel


        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${interaction.user.username}`)
            .setDescription(`**Level:** ${level}\n**XP:** ${remainingXP}/${NextLevel}\n**Messages:** ${messages}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] })

    } else {
        //show marked user data
        const user = user_option.id
        const guild = interaction.guild.id
        const user_data = await db.read(`${guild}.users_lvls.${user}`)
        if (!user_data) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${user_option.username}`)
                .setDescription(`**Level:** 0\n**XP:** 0\n**Messages:** 0`)
                .setTimestamp();

            return await interaction.reply({ embeds: [embed] })
        }
        const xp = user_data.xp
        const messages = user_data.messages
        const lvl_calculator = calculate_lvl(xp)
        const level = lvl_calculator.level
        const remainingXP = lvl_calculator.remainingXP
        const NextLevel = lvl_calculator.NextLevel

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${interaction.user.username}`)
            .setDescription(`**Level:** ${level}\n**XP:** ${remainingXP}/${NextLevel}\n**Messages:** ${messages}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] })
    }
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `view your level information`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
