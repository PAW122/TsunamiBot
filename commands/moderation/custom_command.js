//customCommand.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { CustomCommands } = require("../../handlers/custom_commands")

const command = new SlashCommandBuilder()
    .setName("custom_command")
    .setDescription("setup custom commands")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) => option
        .setName("type")
        .setDescription('chose commands category')
        .setChoices(
            { name: "text", value: "text" }
            // { name: "Population-mode", value: "population" }
        )
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("slot")
        .setDescription('in which slot you want to save the command')
        .setChoices(
            { name: "1/10", value: "1" },
            { name: "2/10", value: "2" },
            { name: "3/10", value: "3" },
            { name: "4/10", value: "4" },
            { name: "5/10", value: "5" },
            { name: "6/10", value: "6" },
            { name: "7/10", value: "7" },
            { name: "8/10", value: "8" },
            { name: "9/10", value: "9" },
            { name: "10/10", value: "10" }
            // { name: "Population-mode", value: "population" }
        )
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("trigger")
        .setDescription('execute if the message is:')
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("response")
        .setDescription('reply to the message with the given text')
        .setRequired(true)
    )
    .addBooleanOption((option) => option
        .setName("status")
        .setDescription('turn off/on')
        .setRequired(true)
    );

// za pomocą "_" oddzielamy dane z nazwy więc nie może być w name
async function execute(interaction, client) {
    const commandType = interaction.options.getString('type');
    const trigger = interaction.options.getString("trigger")
    const response = interaction.options.getString("response")
    const slot = interaction.options.getString("slot")
    const command_status = interaction.options.getBoolean("status")

    const user_id = interaction.user.id
    const guild_id = interaction.guild.id

    const CcHandler = CustomCommands.getInstance();

    if(trigger.includes("_")) {
        await interaction.reply({
            content: "***trigger*** cant include '_' character",
            ephernal: true
        })
        return
    }

    const data = {
        trigger: trigger,
        response: response,
        commandType: commandType,
        command_status: command_status
    }

    const status = CcHandler.addCommand(trigger, guild_id, data, slot, commandType)

    if(status) {
        await interaction.reply({
            content: "saved",
            ephernal: true
        })
    } else {
        await interaction.reply({
            content: "An error occurred while saving. please try again later",
            ephernal: true
        })
    }


}

async function help_message(interaction, client) {
    interaction.reply({
        content: `add your own custom command. /custom_command <command type> <slot where you want to save the command (you can save a maximum of 10 commands)>
        <message text that should trigger the command> <message text sent in response>`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message }
