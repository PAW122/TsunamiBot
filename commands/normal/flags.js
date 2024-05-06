const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRow, ActionRowBuilder } = require("discord.js");
const flags_data = require("../../db/data/flags_game.json")
const path = require('path');
const Flags_handler = require("../../handlers/flags_handler")
const flags_handler = Flags_handler.getInstance()

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
    const user_id = interaction.user.id

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
        //losuj randomowy kraj
        const random_country = Math.floor(Math.random() * count) + 1;

        const fake_answer1 = Math.floor(Math.random() * count) + 1;
        const fake_answer2 = Math.floor(Math.random() * count) + 1;
        const fake_answer3 = Math.floor(Math.random() * count) + 1;

        // answers order
        const order = Math.floor(Math.random() * 4) + 1;
        if(order < 1) order = 1
        if(order > 4) order = 4
        let content = `N/A`

        if (order === 1) {
            content = `A): ${flags_data[random_country][0]}
            B): ${flags_data[fake_answer1][0]}
            C): ${flags_data[fake_answer2][0]}
            D): ${flags_data[fake_answer3][0]}
            `

            flags_handler.set(user_id, "a");
        } else if (order === 2) {
            content = `A): ${flags_data[fake_answer1][0]}
            B): ${flags_data[random_country][0]}
            C): ${flags_data[fake_answer2][0]}
            D): ${flags_data[fake_answer3][0]}
            `

            flags_handler.set(user_id, "b");
        } else if (order === 3) {
            content = `A): ${flags_data[fake_answer1][0]}
            B): ${flags_data[fake_answer2][0]}
            C): ${flags_data[random_country][0]}
            D): ${flags_data[fake_answer3][0]}
            `

            flags_handler.set(user_id, "c");
        } else if (order === 4) {
            content = `A): ${flags_data[fake_answer1][0]}
            B): ${flags_data[fake_answer2][0]}
            C): ${flags_data[fake_answer3][0]}
            D): ${flags_data[random_country][0]}
            `

            flags_handler.set(user_id, "d");
        }

        const filePath = path.join(__dirname, '..', '..', 'assets', 'flags', `${random_country}.png`);

        // const attachment = new Discord.MessageAttachment(filePath)
        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("Guess the country\n use ***/flags_answer*** to answer")
            .setDescription(content)

        interaction.reply({ embeds: [embed], files: [filePath] })
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
