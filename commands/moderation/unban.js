const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()

const command = new SlashCommandBuilder()
    .setName("unban")
    .setDescription("unban user from server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) => option
        .setName("user")
        .setDescription("chose user to unban")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("reason")
        .setDescription("add reason to unban")
        .setAutocomplete(false)
        .setRequired(false)
    )

async function execute(interaction, client) {
    const guild = interaction.guild
    const user = interaction.options.getString("user")
    let reason = interaction.options.getString("reason")
    if(!user) {
        return await interaction.reply(`invalid user`)
    }

    if(!reason) {
        reason = "/unban command"
    }

    await interaction.guild.members.unban(`${user}`, reason)
            .catch(err => {
                if(err) return interaction.channel.send('Something went wrong')
            })

    await interaction.reply(`Unbaned: <@${user}>`)

    BotLogsHandler.SendLog(guild.id, `User: <@${interaction.user.id}> Unbaned: ${user.id}`)
}

async function autocomplete(interaction) {

    let guild_bans = null
    if (!guild_bans || guild_bans === null) {
        const bans_list = await interaction.guild.bans.fetch();
        guild_bans = bans_list.map(ban => {
            return {
                name: ban.user.username,
                value: ban.user.id
            };
        });
    }

    const focusedValue = interaction.options.getFocused();

    const filtered = guild_bans.filter(ban => ban.name.toLowerCase().startsWith(focusedValue.toLowerCase())).slice(0, 25);

    await interaction.respond(
        filtered.map(choice => ({ name: choice.name, value: choice.value }))
    );
}
//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `unban user`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message, autocomplete };
