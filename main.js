// const { exec } = require('child_process');
const config_manager = require("./config.json")
const config = config_manager[config_manager.using]
const is_test = config.is_test ? config.is_test : false
const rsc_config = config.register_slash_commands

require('dotenv').config();
let token;
if (is_test) {
    token = process.env.TOKEN_TEST;
} else {
    token = process.env.TOKEN;
}

// if (is_test) {
//     const pathToExe = process.cwd() + '/progress_display/code_counter.exe';
//     const directoryPath = 'C:\\Users\\oem\\OneDrive\\Dokumenty\\GitHub\\TsunamiBot';


//     exec(`${pathToExe} "${directoryPath}"`, (error, stdout, stderr) => {
//         if (error) {
//             console.error(`Błąd podczas wykonywania pliku .exe: ${error.message}`);
//             return;
//         }
//         if (stderr) {
//             console.error(`Błąd podczas wykonywania pliku .exe: ${stderr}`);
//             return;
//         }
//         console.log(stdout); // Wyświetl wynik w konsoli
//     });
// }

const ConsoleLogger = require("./handlers/console")
const logger = ConsoleLogger.getInstance();

console.log({
    "Using configuration": config_manager.using,
    "Test mode: ": is_test,
})

const { Client, GatewayIntentBits, Events, Partials } = require("discord.js")
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ],
});

const LoadModLogsGuilds = require("./handlers/modlogsMessages_handler")
LoadModLogsGuilds.getInstance().LoadGuilds()

const { register_slash_commands, unregisterAllCommands } = require("./handlers/SlashCommandHandler")
const { commandsMap } = require("./handlers/commandsMap")
const welcome_messages = require("./handlers/welcome")
const autorole = require("./handlers/autorole")
const log_messages = require("./handlers/logMessages")
const { lvl_system } = require("./handlers/lvlHandler")
const status_handler = require("./handlers/botStatus")
const api = require("./api/api")
const mod_logs = require("./handlers/mod_logs_handler")
const Database = require("./db/database")
const database = new Database(__dirname + "/db/files/servers.json")
const dad_handler = require("./handlers/dad_handler");
const { messages_stats_handler } = require("./handlers/stats_handler")
const { registerSlashCommandsForGuild, unregisterAllCommandsForGuild } = require("./handlers/SlashCommandHandler")
const { audio_api_run } = require("./handlers/audio/api")
const { AudioApiV2 } = require("./handlers/audio/apiV2")
const manage_auto_vc = require("./handlers/auto_vc_handler")
const filter_links = require("./handlers/filter_links")
const auto_vc_commands_handler = require("./handlers/auto_vc_commands")
const auto_vc_cache = require("./handlers/auto_vc_cache")
const { handleCustomTextCommands, CustomCommands } = require("./handlers/custom_commands")
const CustomCommandsHandler = CustomCommands.getInstance();
const BotLogs = require("./handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance();
const InviteTracker = require("./handlers/invite_tracker")
const { AudioDataStore } = require("./handlers/audio/cache")
const AudioStore = AudioDataStore.getInstance()
const { addEmoji, removeEmoji } = require("./handlers/emoji_handler")
const { addRatingEmoji } = require("./handlers/ticket_ratings_emoji_handler")
const { tickets_loop, load_tickets_db, } = require("./handlers/tickets_handler")
const { leaveServerHandler } = require("./handlers/leave_server_handler")


// "/test" handlers
require("./test/handlers/handler")(client)
const test_msg_handler = require("./test/handlers/msg_handler")

const auto_vc_channels = new auto_vc_cache()
CustomCommandsHandler.loadTextCommands()
BotLogsHandler.LoadGuilds()
const inviteTracker = new InviteTracker(client)
mod_logs(client);


client.on("ready", async (res) => {
    logger.log(`${res.user.tag} is ready`);

    status_handler(client, config)
    load_tickets_db().then(tickets_loop())
    // database.backup(__dirname + "/db/backup")

    api();

    audio_api_run();
    // AudioApiV2();

    await AudioStore.load_songs(client)
    // console.log(AudioStore.get())

    // RSC_config - register slash commands config
    if (rsc_config) {
        //dodać sprawdzanie listy / commands bota na discordzie, jeżeli jest jakaś któraj nie ma w map to tylko wtedy usówać!
        await unregisterAllCommands(client)
            .then(await register_slash_commands(client, is_test))
            .then(logger.log("All commands registered successfully on all guilds."))
    } else {
        console.error("RSC disabled")
    }
});

client.on("guildCreate", async (guild) => {
    if (!guild) return
    registerSlashCommandsForGuild(guild, client);
})

//execute
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const commandName = interaction.commandName;
    const commandLocation = commandsMap.get(commandName);

    if (commandLocation) {
        const { _, execute } = require(commandLocation);

        try {
            await execute(interaction, client);
        } catch (error) {
            logger.error(error);
            await interaction.channel.send({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }
});

//autocomplete
client.on('interactionCreate', async interaction => {
    if (interaction.isAutocomplete()) {
        const commandName = interaction.commandName
        if (!commandName) return;
        if (interaction.responded) return;
        const commandLocation = commandsMap.get(commandName);
        if (commandLocation) {
            const { data, autocomplete } = require(commandLocation);

            try {
                await autocomplete(interaction, client);
            } catch (error) {
                logger.error(error);
                console.log(error)
                await interaction.channel.send({
                    content: "There was an error while executing autocomplete in this command!",
                    ephemeral: true,
                });
            }
        }
    }
});

// Buttons
// button id is required to be command_name:button_id e.g: s-manga:manga_previous
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;
    const customId = interaction.customId.split(":");
    const commandName = customId[0];
    if (!commandName) return;

    const commandLocation = commandsMap.get(commandName);
    const { buttons } = require(commandLocation);
    if (buttons) {
        try {
            await buttons(interaction);
        } catch (error) {
            logger.error(error);
        }
    }
});

// emoji's
client.on(Events.MessageReactionAdd, async (reaction, user) => {
    addEmoji(client, reaction, user)
    addRatingEmoji(client, reaction, user)
});

client.on(Events.MessageReactionRemove, async (reaction, user) => {
    removeEmoji(client, reaction, user)
});

// Dodanie event handlera do przycisków
// client.on("interactionCreate", async (interaction) => {
//     if (interaction.isButton()) {
//         console.log(interaction)
//         try {
//             await handleButtonInteraction(interaction, data);
//         } catch (error) {
//             console.error(error);
//             await interaction.reply({ content: "There was an error with the button interaction.", ephemeral: true });
//         }
//     }
// });


client.on('guildMemberAdd', async member => {
    welcome_messages(member, client)
    autorole(member, client)
    inviteTracker.userJoin(member, client)
});

client.on('guildMemberRemove', async member => {
    leaveServerHandler(member, client)
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    log_messages(message)
    lvl_system(message)
    dad_handler(client, message)
    messages_stats_handler(message)
    test_msg_handler(client, message)
    filter_links(client, message)
    auto_vc_commands_handler(message, auto_vc_channels)
    handleCustomTextCommands(message)

    if (message.author.id === "438336824516149249" && !message.author.bot && message.content.startsWith("reload")) {
        const args = message.content.trim().split(/ +/);
        if (args[0] === "reload") {
            const guild = message.guild

            await message.reply("commands are being refreshed. This may take a few minutes");
            unregisterAllCommandsForGuild(guild, client)
                .then(
                    registerSlashCommandsForGuild(guild, client)
                        .then(
                            await message.channel.send("All command refreshed succesfully.")
                        )
                )
        }
    }

    if (message.author.id === "438336824516149249" && !message.author.bot && message.content.startsWith("init_commands")) {
        commandsMap.forEach(async (value, key) => {
            const { init } = require(value);
            if (init) {
                try {
                    await init(client);
                } catch (error) {
                    logger.error(error);
                }
            }
        });
    }
})

client.on('voiceStateUpdate', async (oldState, newState) => {
    manage_auto_vc(client, oldState, newState, auto_vc_channels)
})

async function restartBot() {
    try {
        console.log('Restarting bot...');

        // Disconect bot from Discord
        await client.destroy();

        // Connect bota to Discord
        await client.login(token);

        console.log('Bot are restarted succesfully');
    } catch (error) {
        console.error('Wystąpił błąd podczas restartowania bota:', error);
    }
}

// Definicja funkcji wyłączającej bota
async function bot_off() {
    try {
        console.log('Turning bot off');

        // Rozłączanie bota z Discord
        await client.destroy();

        console.log('Bot are succesfully turned off');
    } catch (error) {
        console.error('Wystąpił błąd podczas wyłączania bota:', error);
    }
}

// Definicja funkcji włączającej bota
async function bot_on() {
    try {
        console.log('Turning bot on');

        // Ponowne połączenie bota z Discord
        await client.login(token);

        console.log('Bot are succesfully turned on');
    } catch (error) {
        console.error('Wystąpił błąd podczas włączania bota:', error);
    }
}

client.on("uncaughtException", (e) => {
    logger.warn(e)
    //TODO dodać funkcję zapisującą do db dane z crasha, dane bota
    // i inne pierdoły, wysyłać komunikat na webhooka że bot jest down
});

client.login(token)
module.exports = { client, config, restartBot, bot_off, bot_on }