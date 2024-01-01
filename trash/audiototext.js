/*
1. bot wbija na vc
2. dla każdego usera oddzielnie zamienia audio na text
3. stawia stronę internetową
4. na bierząca aktualizuje stronę internetową
*/

const { SlashCommandBuilder } = require("discord.js");

const { VoiceConnection, EndBehaviorType } = require('@discordjs/voice');
const { OpusEncoder } = require('@discordjs/opus');
const https = require('https');

// Make sure you have initialized the Wit.ai client somewhere in your code
const { Wit } = require('node-wit');
const witClient = new Wit({ accessToken: 'YOUR_WITAI_ACCESS_TOKEN' });


const command = new SlashCommandBuilder()
    .setName("audiototext")
    .setDescription("turn voice to text for vc channel")

async function execute(interaction, client) {
    //1. join vc
    // Sprawdź, czy użytkownik jest na kanale głosowym
    // Check if the user is in a voice channel
  const member = interaction.guild.members.cache.get(interaction.user.id);
  if (!member.voice.channel) {
    return interaction.reply('You need to be in a voice channel for the bot to join!');
  }

  // Join the user's voice channel using @discordjs/voice
  const channel = member.voice.channel;
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  //voice to text:
  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log('Connected to voice channel');
  });

  connection.on('error', (error) => {
    console.error('Voice connection error:', error);
  });

  connection.on('stateChange', (oldState, newState) => {
    if (newState.status === VoiceConnectionStatus.Disconnected) {
      console.log('Disconnected from voice channel');
    }
  });

  const audioPlayer = createAudioPlayer();
  connection.subscribe(audioPlayer);

  audioPlayer.on('data', async (audioBuffer) => {
    try {
      const [response] = await speechClient.recognize({
        audio: {
          content: audioBuffer.toString('base64'),
        },
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
        },
      });

      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      
      console.log(`Transcription: ${transcription}`);
    } catch (error) {
      console.error('Error recognizing speech:', error);
    }
  });

  interaction.reply('Joined the voice channel!');
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `a function that helps deaf people communicate on VC`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
