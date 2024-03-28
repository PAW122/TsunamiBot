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
    );

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
    console.log(data_instance)

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

async function execute(interaction, client) {
    const station_name = interaction.options._hoistedOptions[0].value
    const song = interaction.options._hoistedOptions[1].value

    console.log(station_name + song)

    //get data
    let data = DataStore.getInstance()
    const ipAddress = data.get_by_name(station_name)
    if(!station_name) return interaction.reply("error")


    //download
    const song_path = await get_song(Object.keys(ipAddress)[0] + ":3002", station_name, song)
    if(!song_path) {
        return interaction.reply("An error occurred while downloading the audio file")
    }

    if (!interaction.member.voice || !interaction.member.voice.channel) {
        return await interaction.reply({ content: "You need to be in a voice channel to use this command.", ephemeral: true });
    }
    // Pobieramy kanał głosowy użytkownika
    const voiceChannel = interaction.member.voice.channel;

    // Ścieżka do pliku wideo
    const videoPath = path.join(song_path);

    try {
        // Utwórz zasób audio z pliku wideo (potrzebujemy przekonwertować wideo na audio)
        const audioResource = createAudioResource(videoPath);

        // Tworzymy odtwarzacz audio
        const audioPlayer = createAudioPlayer();

        // Dołączamy do kanału głosowego
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        // Subskrybujemy odtwarzacz audio do połączenia głosowego
        connection.subscribe(audioPlayer);

        // Odtwarzamy zasób audio
        audioPlayer.play(audioResource);

        await interaction.reply({ content: "Now playing opening in your voice channel.", ephemeral: true });
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
