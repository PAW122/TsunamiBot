const { SlashCommandBuilder } = require("discord.js");
const config = require("../../config.json")
const sensivity_calculator_data = config.sensivity_calculator_data.games
const game_list = config.sensivity_calculator_data.game_list

const command = new SlashCommandBuilder()
    .setName("sensivity_calculator")
    .setDescription("calculate sensivity between games")
    .addStringOption((option) => option
        .setName("game1")
        .setDescription("chose game")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addNumberOption((option) => option
        .setName("sensivity")
        .setDescription("type your sensivity in game1")
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("game2")
        .setDescription("chose second game")
        .setRequired(true)
        .setAutocomplete(true)
    )


async function execute(interaction, client) {
    const game1 = interaction.options.getString("game1")
    const game2 = interaction.options.getString("game2")
    const sensivity = interaction.options.getNumber("sensivity")
    try {
        const multiplayer = sensivity_calculator_data[game1][game2]
        const result = sensivity * multiplayer
        return await interaction.reply(`sensivity ${sensivity} in ${game1} is === to **${result}** in ${game2}`)
    } catch (err) {
        console.error(err)
        return await interaction.reply("an error ocured")
    }
}

async function autocomplete(interaction) {
    const options = interaction.options._hoistedOptions;

    // Szukanie opcji, w której użytkownik pisze
    let focusedOptionName = null;
    let focusedOptionValue = null;
    for (const option of options) {
        if (option.focused) {
            focusedOptionName = option.name;
            focusedOptionValue = option.value;
            break;
        }
    }

    if (!focusedOptionName) {
        console.error("No focused option found.");
        return;
    }
    const songs = game_list

    // Sortujemy pliki według podobieństwa do focusedOptionValue
    songs.sort((a, b) => {
        const similarityA = similarity(a, focusedOptionValue);
        const similarityB = similarity(b, focusedOptionValue);
        return similarityB - similarityA; // Sortowanie malejąco według podobieństwa
    });
    // Wybieramy tylko 25 najbardziej podobnych plików
    const topSongs = songs.slice(0, 25);
    try {
        await interaction.respond(
            topSongs.map(choice => ({ name: choice, value: choice })),
        );
    } catch (err) {
        return;
    }



    // Funkcja obliczająca podobieństwo między dwoma ciągami znaków
    function similarity(s1, s2) {
        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;
        const longerLength = longer.length;
        if (longerLength === 0) {
            return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }

    // Funkcja obliczająca odległość edycyjną między dwoma ciągami znaków
    function editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                } else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) {
                costs[s2.length] = lastValue;
            }
        }
        return costs[s2.length];
    }

}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Calculate sensivity betwen games\nChose your game, type sensivity and chose to witch game calculate sensivity`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message, autocomplete };
