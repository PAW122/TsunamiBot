
const Database = require("../../db/database")
const database = new Database(__dirname + "/../../db/files/users.json");

const { DataStore } = require("../../handlers/audio/api")
const datastore = DataStore.getInstance()

const { SlashCommandBuilder } = require("discord.js");
const { get_songs, AudioDataStore } = require("../../handlers/audio/cache")
const audioCache = AudioDataStore.getInstance()

const config = require("../../config.json")
const configuration = config[config.using].config.max_song_name_len

const command = new SlashCommandBuilder()
    .setName("delsong")
    .setDescription("delete song from your playlist")
    .addStringOption((option) => option
        .setName("song_name")
        .setDescription("chose song name")
        .setRequired(true)
        .setAutocomplete(true)
    )

async function execute(interaction, client) {
    const data_instance = AudioDataStore.getInstance();
    const song_name = interaction.options.getString("song_name")
    const user_id = interaction.user.id

    if (!song_name) {
        await interaction.reply("invalid song name")
        return
    }

    if (song_name.length < 3) {
        await interaction.reply("song name must be longer then 3 characters")
        return
    }

    if (song_name.length > configuration) {
        await interaction.reply("song name must be shorter then 24 characters")
        return
    }

    let data = database.read(`${user_id}.songs.${song_name}`)
    if (!data) {
        return await interaction.reply("cannot find song with this title")
    }
    // TODO: add remove() to db

    data.check_count = 0

    database.write(`${user_id}.songs.${song_name}`, data)
    data_instance.remove_song(interaction.user.username, song_name)

    await interaction.reply(`Sucesfully deleted **${song_name}** from playlist`)
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

    const data_instance = AudioDataStore.getInstance();

    const selectedUserName = interaction.user.username
    const user_data = data_instance.get(selectedUserName); // Pobieramy dane użytkownika na podstawie jego nazwy
    if (!user_data || !user_data.songs) return; // Sprawdzamy, czy użytkownik istnieje i czy ma piosenki

    const songs = Object.values(user_data.songs).map(song => song.song_name); // Pobieramy tytuły piosenek

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
        content: `add song to your playlist. song_name: type name of your song`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message, autocomplete };
