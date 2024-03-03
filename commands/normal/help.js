const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { return_commands } = require("../../handlers/commandsMap");
const commandsMap = return_commands();
const maxChoices = 25;
const ConsoleLogger = require("../../handlers/console")
const logger = ConsoleLogger.getInstance();

const choices = Array.from(commandsMap.keys());

const command = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Sends information about commands")
    .addStringOption((option) => option
        .setName("command")
        .setDescription("Choose command")
        .setAutocomplete(true)
        .setRequired(false)
    );


async function autocomplete(interaction) {

    const focusedValue = interaction.options.getFocused();
    const filtered = choices.filter(choice => choice.startsWith(focusedValue)).slice(0, maxChoices);

    await interaction.respond(
        filtered.map(choice => ({ name: choice, value: choice })),
    );

}

async function execute(interaction, client) {
    const chosenCommand = interaction.options.getString("command");

    const commandLocation = commandsMap.get(chosenCommand);
    if (commandLocation) {
        const { help_message } = require(commandLocation);

        try {
            await help_message(interaction, client);
        } catch (error) {
            logger.error(error);
            await interaction.reply({
                content: "There was an error while executing autocomplete in this command!",
                ephemeral: true,
            });
        }
    } else {


        let content = ""

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Commands list.')

        choices.forEach((choice, index) => {
            content += `${index + 1}: **/${choice}**\n`;
        });

        embed.setDescription(content)


        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `Sends help message`,
        ephemeral: true
    });
}

module.exports = { command, execute, help_message, autocomplete };
