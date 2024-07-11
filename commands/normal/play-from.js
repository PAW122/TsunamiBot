const { SlashCommandBuilder } = require("discord.js");
const Discord = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const { AudioDataStore } = require("../../handlers/audio/cache")
const fs = require('fs');
const path = require('path');
const axios = require("axios")
const Database = require("../../db/database")
const db = new Database(__dirname + "../../../db/files/users.json")
let cache = new Set()

const command = new SlashCommandBuilder()
    .setName("play-from")
    .setDescription("play music from other users")
    .addStringOption((option) => option
        .setName("user_name")
        .setDescription("chose user from who u want to play music")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("song")
        .setDescription("Choose song to play")
        .setAutocomplete(true)
        .setRequired(true)
    )
    // .addBooleanOption((option) => option
    //     .setName("autoplay")
    //     .setDescription("Auto play next song")
    //     .setRequired(false)
    // )

async function execute(interaction, client) {
    const user_name = interaction.options.getString('user_name');
    const song = interaction.options.getString('song');

    playAudio(interaction, song, user_name, client);

}// dodać przyciski do pause(pauza odtwarzania), skip(skip nuty), play

async function playAudio(interaction, song_name, user_name, client) {
    const data_instance = AudioDataStore.getInstance();
    const selectedUserName = interaction.options.getString('user_name');
    const user_data = data_instance.get(selectedUserName);
    if (!user_data || !user_data.songs) return;

    const song_data = user_data.songs.find(song => song.song_name === song_name);
    if (!song_data) return interaction.reply("canot find song data")

    const messageLink = song_data.link


    const regex = /discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
    const match = messageLink.match(regex);
    if (!match) {
        console.error('Nieprawidłowy link do wiadomości Discord.');
        return;
    }

    const guildId = match[1];
    const channelId = match[2];
    const messageId = match[3];

    try {
        const guild = await client.guilds.fetch(guildId);
        if (!guild) {
            interaction.reply("cannot find audio file")
            invalid_link(selectedUserName, song_name, messageLink, client)
            return;
        }

        const channel = await guild.channels.fetch(channelId);
        if (!channel || !(channel instanceof Discord.TextChannel)) {
            interaction.reply("cannot find audio file")
            invalid_link(selectedUserName, song_name, messageLink, client)
            return;
        }

        const message = await channel.messages?.fetch(messageId);
        if (!message) {
            interaction.reply("cannot find audio file")
            invalid_link(selectedUserName, song_name, messageLink, client)
            return;
        }

        const attachment = message.attachments.first();

        const attachmentData = {
            name: attachment.name,
            size: attachment.size,
            url: attachment.url,
            proxyURL: attachment.proxyURL,
            contentType: attachment.contentType
        };

        playAudioOnce(interaction, attachmentData)

    } catch (error) {
        console.error('Wystąpił błąd podczas pobierania wiadomości Discord:', error);
        if (error.code === 10008 || error.rawError.message === 'Unknown Message') {
            invalid_link(selectedUserName, song_name, messageLink, client)
        }
        await interaction.reply("An error occurred while trying to obtain the audio file")
    }

}

/**
 * check_count --
 * if check_count = 0
 * send owner message and delete song from db 
 */
function invalid_link(selectedUserName, song_name, messageLink, client) {
    const user = client.users.cache.find(user => user.username === selectedUserName);;
    if (!user) return;

    const user_id = user.id; if (!user_id) return;
    let data = db.read(`${user_id}.songs.${song_name}`)
    if (data === null || data === undefined) return;

    const new_count = data.check_count - 1
    let new_data = { ...data }
    new_data.check_count = new_count


    if (data.check_count <= 0) {
        const data_instance = AudioDataStore.getInstance();
        // user.send(`Cannot find message "${messageLink}" to play **${song_name}** song\ncheck out file and reupload if needed`)
        data_instance.remove_song(selectedUserName, song_name)
    } else {
        db.write(`${user_id}.songs.${song_name}`, new_data)
    }

}

async function playAudioOnce(interaction, attachment) {
    try {
        cache.add(interaction.channel.id, true)
        // Sprawdź, czy załącznik jest typu mp3
        if (!attachment.name.endsWith('.mp3')) {
            return await interaction.channel.send("The attached file is not an mp3 file.");
        }

        // Zapisz załącznik tymczasowo na serwerze
        const attachmentPath = path.join(__dirname + "../../../db/files/audio", interaction.id);
        const file = fs.createWriteStream(attachmentPath);
        const response = await axios.get(attachment.url, { responseType: 'stream' });
        let audio_status = null
        response.data.pipe(file);

        await new Promise((resolve, reject) => {
            file.on('finish', resolve);
            file.on('error', reject);
        });

        // Sprawdź, czy użytkownik znajduje się w kanale głosowym
        if (!interaction.member.voice.channel) {
            return await interaction.channel.send({ content: "You need to be in a voice channel to use this command.", ephemeral: true });
        }

        // Pobierz kanał głosowy użytkownika
        const voiceChannel = interaction.member.voice.channel;

        // Utwórz połączenie głosowe
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        // Utwórz odtwarzacz audio
        const audioPlayer = createAudioPlayer();

        // Utwórz zasób audio z pliku mp3
        const audioResource = createAudioResource(attachmentPath);

        // Subskrybuj odtwarzacz audio do połączenia głosowego
        connection.subscribe(audioPlayer);

        // Odtwórz zasób audio
        audioPlayer.play(audioResource);

        // Zapisz komunikat, że teraz odtwarzany jest plik mp3
        try{
            await interaction.reply({ content: `Now playing ${attachment.name} in your voice channel.` });
        }catch(err) {
            await interaction.channel.send({ content: `Now playing ${attachment.name} in your voice channel.` })
        }

        audioPlayer.on("stateChange", async (oldState, newState) => {
            audio_status = newState
            if (oldState.status === "playing" && newState.status === "idle") {
                cache.delete(interaction.channel.id)
                fs.unlink(attachmentPath, (err) => {
                    if (err) {
                        console.error('Error deleting mp3 file:', err);
                    }
                });

                // if not playing next song:
                setTimeout(() => {
                    if (!cache.has(interaction.channel.id)) return;
                    const currentConnection = getVoiceConnection(connection.joinConfig.guildId);
                    if (currentConnection) {
                        currentConnection.destroy();
                        interaction.channel.send("I am leaving the voice channel due to inactivity")
                    }
                }, 1 * 60 * 1000);
            }
        });

        // audioPlayer.on(AudioPlayerStatus.Idle, () => {
        //     setTimeout(() => {
        //         if(audio_status.status != "idle") return;
        //         const currentConnection = getVoiceConnection(connection.joinConfig.guildId);
        //         if (currentConnection) {
        //             currentConnection.destroy();
        //         }
        //     }, 1 * 60 * 1000);
        // });

    } catch (error) {
        console.error('Error playing mp3 file:', error);
        await interaction.channel.send({ content: "An error occurred while playing the mp3 file.", ephemeral: true });
        return
    }
}

async function autocomplete(interaction) {
    const options = interaction.options._hoistedOptions;
    let last_focused_name = null;

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

    if (focusedOptionName === "user_name") {
        const stations = Array.from(data_instance.get_users())
        // Sortujemy stacje według podobieństwa do focusedOptionValue
        stations.sort((a, b) => {
            const similarityA = similarity(a, focusedOptionValue);
            const similarityB = similarity(b, focusedOptionValue);
            return similarityB - similarityA; // Sortowanie malejąco według podobieństwa
        });
        // Wybieramy tylko 25 najbardziej podobnych stacji
        const topStations = stations.slice(0, 25);
        try {
            await interaction.respond(
                topStations.map(choice => ({ name: choice, value: choice })),
            );
        } catch (err) {
            return;
        }

    } else if (focusedOptionName === "song") {
        const selectedUserName = interaction.options.getString('user_name');
        if(selectedUserName != last_focused_name) {
            last_focused_name = selectedUserName 
        }
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
        content: `1. send mp3 file on discord and copy message link (right click on message)\n2. use **/addsong** command\ntype song name and past link to message with mp3 file\n3. use /play-from type your username and select song`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message, autocomplete };
