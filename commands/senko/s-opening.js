const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const path = require("path");

const command = new SlashCommandBuilder()
    .setName("s-opening")
    .setDescription("Listen to opening");

async function execute(interaction, client) {
    // Sprawdzenie, czy użytkownik, który użył komendy, znajduje się na kanale głosowym
    if (!interaction.member.voice || !interaction.member.voice.channel) {
        return await interaction.reply({ content: "You need to be in a voice channel to use this command.", ephemeral: true });
    }

    // Pobieramy kanał głosowy użytkownika
    const voiceChannel = interaction.member.voice.channel;

    // Ścieżka do pliku wideo
    const videoPath = path.join(__dirname, "../../assets/opening.mp3");

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

async function help_message(interaction, client) {
    await interaction.reply({
        content: "Use `/s-opening` to start playing opening on voice channel",
        ephemeral: true
    });
}

module.exports = { command, execute, help_message };
