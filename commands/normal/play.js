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
var is_user_playing = false
const fs = require("fs")
const { PassThrough } = require("stream");

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
    let focusedOptionValue = null
    for (const option of options) {
        if (option.focused) {
            focusedOptionName = option.name;
            focusedOptionValue = option.value
            break;
        }
    }

    if (!focusedOptionName) {
        console.error("No focused option found.");
        return;
    }

    const data_instance = DataStore.getInstance();
    // console.log(data_instance)

    if (focusedOptionName === "station_name") {
        const stations = Object.values(data_instance.get()).map(item => item.name).sort();
        await interaction.respond(
            stations.map(choice => ({ name: choice, value: choice })),
        );
    } else if (focusedOptionName === "song") {
        const files = Object.values(data_instance.get()).flatMap(item => item.files).sort();
        await interaction.respond(
            files.map(choice => ({ name: choice, value: choice })),
        );
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

    // Prepare an array to store the audio buffers
    let audioBuffers = [];

    if (autoplay) {
        // Iterate through each song in the list
        for await (const file of files) {
            let song_path = await get_song(Object.keys(ipAddress)[0] + ":3002", station_name, file);
            if (!song_path) {
                console.error("An error occurred while downloading the audio file.");
                continue;
            }

            // Wait for a short delay before attempting to read the file
            await delay(500);

            // Read the audio file and push the buffer to the array
            let buffer = fs.readFileSync(song_path);
            audioBuffers.push(buffer);
        }

        // Check if all songs have been downloaded
        if (audioBuffers.length === files.length) {
            // Concatenate all audio buffers into one buffer
            let concatenatedBuffer = Buffer.concat(audioBuffers);

            // Create a PassThrough stream from the concatenated buffer
            const stream = new PassThrough();
            stream.end(concatenatedBuffer);

            // Create an audio resource from the PassThrough stream
            const audioResource = createAudioResource(stream);

            // Create an audio player
            const audioPlayer = createAudioPlayer();

            // Join the user's voice channel
            const voiceChannel = interaction.member.voice.channel;
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            connection.subscribe(audioPlayer);

            // Play the audio resource
            audioPlayer.play(audioResource);

            // Send a message indicating that the playlist is now playing
            await interaction.channel.send({ content: `Now playing the playlist in your voice channel.`, ephemeral: true });
        } else {
            console.error("Not all songs have been downloaded.");
        }
    } else {
        playAudioOnce(interaction, song, station_name);
    }
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
