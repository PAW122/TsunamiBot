const { SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const puppeteer = require('puppeteer');

const command = new SlashCommandBuilder()
    .setName("live_caption")
    .setDescription("Translate what users on VC say to text for deaf people")
    .addStringOption(option =>
        option.setName('language')
            .setDescription('Select the language for transcription')
            .setRequired(true)
            .addChoices(
                { name: 'English', value: 'en-US' },
                { name: 'Polish', value: 'pl-PL' }
            )
    );

async function execute(interaction, discordClient) {
    const channel = interaction.member.voice.channel;
    const language = interaction.options.getString('language');

    if (!channel) {
        return interaction.reply("You need to be in a voice channel to use this command.");
    }

    // Join the voice channel
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, async () => {
        interaction.reply(`Live captioning has started in ${language}! Using Chromium for Web Speech API.`);
        startCaptioning(connection, interaction, discordClient, language);
    });

    // Listening to the speaking event for identifying the user speaking
    connection.receiver.speaking.on('start', (userId) => {
        console.log(`User with ID ${userId} started speaking`);
        const guildId = connection.joinConfig.guildId;
        const guild = discordClient.guilds.cache.get(guildId); // Pobierz serwer za pomocą guildId

        if (!guild) {
            console.error("Guild not found for guildId:", guildId);
            return;
        }

        const user = guild.members.cache.get(userId);
        if (!user) {
            console.error("Failed to find user in the guild members cache");
            return;
        }

        // Update the userId dynamically when they start speaking
        currentUserId = userId; // Save the userId of the one who is speaking
    });
}

let currentUserId = null; // To hold the userId of the current speaker

async function startCaptioning(connection, interaction, discordClient, language) {
    try {
        // Launch Puppeteer with Chromium
        console.log("lunch puppeteer")
        const browser = await puppeteer.launch({
            headless: true, // Run in headless mode
            args: ["--use-fake-ui-for-media-stream"] // Automatically allow microphone
        }).catch(err => {
            console.error('Puppeteer launch error:', err);
        });
        console.log("succes lunch")
        if(!browser) {
            console.log("browser err")
        }
        
        const page = await browser.newPage().catch(err => {
            console.error('browser.newPage() launch error:', err);
        });;
        console.log("page.")

        // Load a minimal HTML file with Web Speech API
        await page.setContent(`
            <!doctype html>
            <html>
            <body>
                <script>
                    const recognition = new webkitSpeechRecognition();
                    recognition.continuous = true;
                    recognition.interimResults = true;
                    recognition.lang = '${language}';

                    recognition.onresult = (event) => {
                        let finalTranscript = '';
                        for (let i = event.resultIndex; i < event.results.length; i++) {
                            if (event.results[i].isFinal) {
                                finalTranscript += event.results[i][0].transcript + '\\n';
                            }
                        }
                        window.transcriptCallback(finalTranscript);
                    };

                    recognition.start();
                </script>
            </body>
            </html>
        `);

        // Expose a callback to receive transcripts
        await page.exposeFunction('transcriptCallback', async (transcript) => {
            if (transcript.trim() && currentUserId) {
                const guildId = connection.joinConfig.guildId;
                const guild = discordClient.guilds.cache.get(guildId);

                if (!guild) {
                    console.error("Guild not found for guildId:", guildId);
                    return;
                }

                const user = guild.members.cache.get(currentUserId);
                if (!user) {
                    console.error("Failed to find user in the guild members cache");
                    return;
                }

                console.log(`User ${user.user.username}: ${transcript}`);
                interaction.channel.send(`**${user.user.username}:** ${transcript}`);
            }
        });

        // Keep Chromium running while bot is active
        connection.once(VoiceConnectionStatus.Disconnected, async () => {
            await browser.close();
        });
    } catch (error) {
        console.error("Error with Puppeteer or Web Speech API:", error);
    }
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `Use the /live_caption command to start real-time captioning of your voice channel. Select a language from the options (English or Polish). Make sure the bot has permissions to join and speak in the voice channel!`,
        ephemeral: true,
    });
}

module.exports = { command, execute, help_message };
