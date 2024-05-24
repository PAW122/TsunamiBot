//flags_answer
const { SlashCommandBuilder} = require("discord.js");
const Flags_handler = require("../../handlers/flags_handler")
const flags_handler = Flags_handler.getInstance()

const command = new SlashCommandBuilder()
    .setName("flags_answer")
    .setDescription("answer flags game")
    .addStringOption((option) => option
        .setName("answer")
        .setDescription("chose an answer")
        .setChoices(
            { name: "a", value: "a" },
            { name: "b", value: "b" },
            { name: "c", value: "c" },
            { name: "d", value: "d" },
        )
        .setRequired(true)
    );

async function execute(interaction, client) {
    let answer = interaction.options.getString('answer');
    const user_id = interaction.user.id

    const {correctAnswers, result} = flags_handler.check_answer(user_id, answer);
    flags_handler.clear(user_id)
    
    if(!result) {
        await interaction.reply({
            content: `Incorrect answer.\n Correct answer: ***${correctAnswers}***`,
            ephemeral: false
        })
    } else {
        await interaction.reply({
            content: `Correct answer`,
            ephemeral: false
        })
    }
    
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `check your answer`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };