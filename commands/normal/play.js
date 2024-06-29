/*
zrobić zakładkę api na stronie która tłumaczy jak to działa.

po użyciu /play <> <>
edit wiadomości na : pobieranie piosenki od stacji
edit playing <nazwa piosenki>

przyciski pod wiadomością play | pause | exit | star (dodaje gwiazdkę nutce)

*/

const { SlashCommandBuilder } = require("discord.js");
const { DataStore, get_song } = require("../../handlers/audio/api")
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const path = require("path");
const { SongManager } = require("../../handlers/audio/api")
const songmanager = SongManager.getInstance()
const fs = require("fs")
const { PassThrough } = require("stream");

//new api
// const { get_songV2, DataStoreV2 } = require("../../handlers/audio/apiV2")

const command = new SlashCommandBuilder()
    .setName("play")
    .setDescription("play any song from any station")
    .addStringOption((option) => option
        .setName("station_name")
        .setDescription("Choose station")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("song")
        .setDescription("Choose song")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addBooleanOption((option) => option
        .setName("autoplay")
        .setDescription("auto play next song")
        .setRequired(true)
    )

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

    const data_instance = DataStore.getInstance();

    if (focusedOptionName === "station_name") {
        const stations = Object.values(data_instance.get()).map(item => item.name);
        // Sortujemy stacje według podobieństwa do focusedOptionValue
        stations.sort((a, b) => {
            const similarityA = similarity(a, focusedOptionValue);
            const similarityB = similarity(b, focusedOptionValue);
            return similarityB - similarityA; // Sortowanie malejąco według podobieństwa
        });
        // Wybieramy tylko 25 najbardziej podobnych stacji
        const topStations = stations.slice(0, 25);
        try{
            await interaction.respond(
                topStations.map(choice => ({ name: choice, value: choice })),
            );
        }catch(err) {
            return;
        }

    } else if (focusedOptionName === "song") {
        const files = Object.values(data_instance.get()).flatMap(item => item.files);
        // Sortujemy pliki według podobieństwa do focusedOptionValue
        files.sort((a, b) => {
            const similarityA = similarity(a, focusedOptionValue);
            const similarityB = similarity(b, focusedOptionValue);
            return similarityB - similarityA; // Sortowanie malejąco według podobieństwa
        });
        // Wybieramy tylko 25 najbardziej podobnych plików
        const topFiles = files.slice(0, 25);
        try {
            await interaction.respond(
                topFiles.map(choice => ({ name: choice, value: choice })),
            );
        } catch (err) {
            return;
        }

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



    /*  
    dodać logikę jsona dla autocomplete (jeżeli json posiada  < niż 25 wpisów to wyświetlać wszystkie tylko w innej kolejności (logika z help.js))

    */

}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function playAudio(interaction, song, station_name, autoplay) {
    // Get data
    let data = DataStore.getInstance();

    var ipAddress = data.get_by_name(station_name)
    ipAddress = Object.keys(ipAddress)[0]

    var files = data.data[ipAddress].files

    if (!station_name) return interaction.reply("error");

    // Check if ipAddress is defined
    if (!ipAddress) {
        console.error("Station not found for station name:", station_name);
        return;
    }

    // Check if files are available
    if (!files || files.length === 0) {
        console.error("No files found for station:", ipAddress.name);
        return;
    }

    if (autoplay) {
        // Join the user's voice channel
        const voiceChannel = interaction.member.voice.channel;
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        // Create an audio player
        const audioPlayer = createAudioPlayer();
        connection.subscribe(audioPlayer);

        // Play the first song
        await playNextSong(audioPlayer, files, ipAddress, station_name);

        interaction.channel.send("No more songs to play.")
        //Add leave vc

    } else {
        playAudioOnce(interaction, song, station_name);
    }
}

async function playNextSong(audioPlayer, files, ipAddress, station_name) {
    if (files.length === 0) {
        return;
    }

    let song = files.shift(); // Take the next song from the list
    let song_path = await get_song(Object.keys(ipAddress)[0] + ":3002", station_name, song);

    if (!song_path) {
        console.error("An error occurred while downloading the audio file.");
        return;
    }

    // Wait for a short delay before attempting to read the file
    await delay(500);

    // Read the audio file
    let buffer = fs.readFileSync(song_path);

    // Create a PassThrough stream from the buffer
    const stream = new PassThrough();
    stream.end(buffer);

    // Create an audio resource from the stream
    const audioResource = createAudioResource(stream);

    // Play the audio resource
    audioPlayer.play(audioResource);

    // Event listener for audio player state change
    audioPlayer.on("stateChange", async (oldState, newState) => {
        if (oldState.status === "playing" && newState.status === "idle") {
            // Play the next song when the current one finishes
            await playNextSong(audioPlayer, files, ipAddress, station_name);
        }
    });
}




async function execute(interaction, client) {
    const station_name = interaction.options._hoistedOptions[0].value;
    const song = interaction.options._hoistedOptions[1].value;
    const autoplay = interaction.options.getBoolean("autoplay");
    // Play the audio
    await playAudio(interaction, song, station_name, autoplay);
}

async function playAudioOnce(interaction, song, station_name) {
    // Get data
    let data = DataStore.getInstance();
    let ipAddress = data.get_by_name(station_name);
    if (!station_name) return interaction.reply("error");

    // Download the song
    const song_path = await get_song(Object.keys(ipAddress)[0] + ":3002", station_name, song);
    if (!song_path) {
        return interaction.reply("An error occurred while downloading the audio file");
    }

    // Check if the user is in a voice channel
    if (!interaction.member.voice || !interaction.member.voice.channel) {
        return await interaction.reply({ content: "You need to be in a voice channel to use this command.", ephemeral: true });
    }

    // Get the user's voice channel
    const voiceChannel = interaction.member.voice.channel;

    // Path to the video file
    const videoPath = path.join(song_path);

    try {
        // Create an audio resource from the video file
        const audioResource = createAudioResource(videoPath);

        // Create an audio player
        const audioPlayer = createAudioPlayer();

        // Join the user's voice channel
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        // Subscribe the audio player to the voice connection
        connection.subscribe(audioPlayer);

        // Play the audio resource
        audioPlayer.play(audioResource);

        //TEST
        audioPlayer.on("stateChange", async (oldState, newState) => {

            if (oldState.status == "playing" && newState.status == "idle") {
                songmanager.notPlaying(song)
            }
        })

        // Send a message indicating that the song is now playing
        await interaction.channel.send({ content: `Now playing ${song} in your voice channel.`, ephemeral: true });

    } catch (error) {
        console.error("Error playing opening with audio:", error);
        await interaction.reply({ content: "An error occurred while playing the opening with audio.", ephemeral: true });
    }
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Play music`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message, autocomplete };
