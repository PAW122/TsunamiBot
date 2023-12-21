const { StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, SlashCommandBuilder } = require('discord.js');
const { return_commands } = require("../../handlers/commandsMap");
const commandsMap = return_commands();
const command = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Sends information about commands");

async function execute(interaction, client) {

    // Create options for the select menu based on your commands
    const options = Array.from(commandsMap.keys()).map(commandName => ({
        label: commandName,
        value: commandName
    }));

    // Create a StringSelectMenuBuilder
    const select = new StringSelectMenuBuilder()
        //!!!!!!! setCustomId dla selectMenu musi być nazwą komendy
        .setCustomId('help') // Custom ID for interaction handling
        .setPlaceholder('Select a command') // Placeholder text
        .addOptions(...options); // Add options dynamically based on your commands

    // Create an ActionRowBuilder and add the select menu
    const row = new ActionRowBuilder()
        .addComponents(select);

    // Reply to the interaction with the select menu
    await interaction.reply({
        content: 'Please select a command:',
        components: [row],
    });
}

async function selectMenu(interaction, client) {
    console.log(interaction.customId + "interaction executed")

    const option = interaction.values[0]
    const commandLocation = commandsMap.get(option)

    if (commandLocation) {
        const { help_message } = require(commandLocation);
        try {
            await help_message(interaction, client);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    } else {
        interaction.reply({
            content: "This command dont have description",
            ephemeral: true
        })
    }
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `sends help message`,
        ephemeral: true
    })
}

module.exports = { command, execute, selectMenu, help_message };