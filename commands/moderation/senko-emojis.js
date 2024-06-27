const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Cooldowns = require("../../handlers/cooldowns")

const fs = require('fs');
const path = require('path');

const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()

const cooldowns = new Cooldowns();

const command = new SlashCommandBuilder()
    .setName("senko-emojis")
    .setDescription("import senko emojin to the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) => option
        .setName("type")
        .setDescription('chose emoji types')
        .setChoices(
            { name: "only normal", value: "normal" },
            { name: "only animated", value: "animated" },
            { name: "all", value: "all" }
            // { name: "Population-mode", value: "population" }
        )
        .setRequired(true)
    )

async function execute(interaction, client) {
    const guild = interaction.guild;
    const user_id = interaction.user.id;
    const type = interaction.options.getString('type');

    // Check for cooldowns
    if (!cooldowns.isEnd(`${guild.id}.${user_id}.import_emojis`)) {
        return interaction.reply({
            content: `Wait for cooldown to end. (10s)`,
            ephemeral: true
        });
    }
    cooldowns.add(`${user_id}.import_emojis`, 10, "s");

    let emojiFolderPath;

    if (type === "normal") {
        emojiFolderPath = path.join(process.cwd(), "/assets/senko-emojis/normal");
    } else if (type === "animated") {
        emojiFolderPath = path.join(process.cwd(), "/assets/senko-emojis/animated");
    } else if (type === "all") {
        emojiFolderPath = path.join(process.cwd(), "/assets/senko-emojis/all");
    } else {
        await interaction.reply("Incorrect action");
        return;
    }

    // Get all files in the selected folder
    const emojiFiles = fs.readdirSync(emojiFolderPath);
    const numberOfEmojis = emojiFiles.length;

    // Check how many free emoji slots the server has
    const maxEmojis = guild.premiumTier > 1 ? 150 : 50;
    const maxAnimatedEmojis = guild.premiumTier > 1 ? 150 : 50;
    const currentEmojis = guild.emojis.cache.size;
    const freeSlots = maxEmojis - currentEmojis;
    const freeAnimatedSlots = maxAnimatedEmojis - guild.emojis.cache.filter(e => e.animated).size;

    if ((type === "normal" || type === "all") && freeSlots < numberOfEmojis) {
        return interaction.reply({
            content: `Not enough free slots for normal emojis. Free slots: ${freeSlots}, Needed: ${numberOfEmojis}`,
            ephemeral: true
        });
    }

    if ((type === "animated" || type === "all") && freeAnimatedSlots < numberOfEmojis) {
        return interaction.reply({
            content: `Not enough free slots for animated emojis. Free slots: ${freeAnimatedSlots}, Needed: ${numberOfEmojis}`,
            ephemeral: true
        });
    }

    const embed = new EmbedBuilder()
        .setTitle('Senko emojis')
        .setDescription(`Importing ${numberOfEmojis} ${type} emojis.`)
        .setTimestamp();
    interaction.reply({ embeds: [embed] });

    // Upload the emojis
    for (const file of emojiFiles) {
        const filePath = path.join(emojiFolderPath, file);
        const emojiName = path.basename(file, path.extname(file));
        const isAnimated = type === "animated" || (type === "all" && file.endsWith('.gif'));

        try {
            await guild.emojis.create({
                attachment: filePath,
                name: emojiName,
                animated: isAnimated
            });
        } catch (error) {
            console.error(`Failed to upload emoji: ${file}`, error);
        }
    }

    // Log information on bot log channel
    BotLogsHandler.SendLog(guild.id, `User: <@${user_id}> imported senko emojis to the server\n Cooldown: 10s`);
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `import senko emojis to the server.`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
