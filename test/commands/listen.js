const { joinVoiceChannel, createAudioResource, NoSubscriberBehavior, createAudioPlayer } = require('@discordjs/voice');

let recordedAudio = [];
// ???
// https://youtu.be/h7CC-8kTsGI?si=885B70LZdVbpR68m
const command_data = {
    name: "listen"
}

async function execute(message, args, client) {
    if (!message.member.voice.channel) {
        return message.reply('Musisz być na kanale głosowym, aby użyć tej komendy!');
    }

    const connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false
    });

    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    });

    connection.subscribe(player);

    player.on('stateChange', (oldState, newState) => {
        console.log(`Odtwarzacz zmienił stan: ${oldState.status} => ${newState.status}`);
    });

    connection.on('stateChange', (oldState, newState) => {
        console.log(`Stan połączenia głosowego zmienił się: ${oldState.status} => ${newState.status}`);
    });

    const speakingMap = connection.receiver.speaking;

    speakingMap.addListener('speaking', (userId, startTime) => {
        console.log(`Użytkownik o ID ${userId} zaczął mówić.`);
    });

    speakingMap.addListener('stoppedSpeaking', (userId, startTime) => {
        console.log(`Użytkownik o ID ${userId} przestał mówić.`);
        handleRecordedAudio(recordedAudio); // Przekazanie zapisanych danych audio do innej funkcji
        recordedAudio = []; // Wyczyszczenie zmiennych po zakończeniu aktywności użytkownika
    });

    player.on('data', (data) => {
        recordedAudio.push(data); // Zapisywanie danych audio
    });

    message.reply('Bot jest teraz podłączony do kanału głosowego i słucha audio.');
}

function handleRecordedAudio(audioData) {
    console.log('Dane audio zostały przesłane do funkcji obsługującej.');
}


function help() {

}

module.exports = {command_data, execute, help}