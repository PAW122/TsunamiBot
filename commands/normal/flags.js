const { SlashCommandBuilder } = require("discord.js");
const flags_data = require("../../db/data/flags_game.json")

const command = new SlashCommandBuilder()
    .setName("flags")
    .setDescription("Play guess the flag game")
    .addStringOption((option) => option
        .setName("game-mode")
        .setDescription('chose game category')
        .setChoices(
            { name: "Flags-mode", value: "flags" },
            { name: "Population-mode", value: "population" }
        )
        .setRequired(true)
    );



async function execute(interaction, client) {
    const gameMode = interaction.options.getString('game-mode');

    const keys = Object.keys(flags_data);
    // amount of countries in db
    let count = 0;
    keys.forEach(key => {
        const num = parseInt(key);
        if (!isNaN(num) && num == (count += 1)) {
            count++;
        }
    });


    if (gameMode === "flags") {
        console.log(count)
    }

}

/*
    dla Guess Flag:
    A)
    B)
    C)
    Flaga.png
    3 przyciski A,B,C
*/

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Play guess the flag game on discord.`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
