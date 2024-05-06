const { exec } = require('child_process');
const config_manager = require("./config.json")
const config = config_manager[config_manager.using]
const is_test = config.is_test ? config.is_test : false
const rsc_config = config.register_slash_commands

require('dotenv').config();
let token;
if (is_test) {
    token = process.env.TOKEN2;
} else {
    token = process.env.TOKEN;
}

if (is_test) {
    const pathToExe = process.cwd() + '/progress_display/code_counter.exe';
    const directoryPath = 'C:\\Users\\oem\\OneDrive\\Dokumenty\\GitHub\\TsunamiBot';


    exec(`${pathToExe} "${directoryPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Błąd podczas wykonywania pliku .exe: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Błąd podczas wykonywania pliku .exe: ${stderr}`);
            return;
        }
        console.log(stdout); // Wyświetl wynik w konsoli
    });
}

const ConsoleLogger = require("./handlers/console")
const logger = ConsoleLogger.getInstance();

console.log({
    "Using configuration": config_manager.using,
    "Test mode: ": is_test,
})

const { Client, GatewayIntentBits } = require("discord.js")
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
    ]
});

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
const run_sdk = require("./sdk/server/server")
const manage_auto_vc = require("./handlers/auto_vc_handler")
const filter_links = require("./handlers/filter_links")
const auto_vc_commands_handler = require("./handlers/auto_vc_commands")
const auto_vc_cache = require("./handlers/auto_vc_cache")

// "/test" handlers
require("./test/handlers/handler")(client)
const test_msg_handler = require("./test/handlers/msg_handler")

const auto_vc_channels = new auto_vc_cache()

client.on("ready", async (res) => {

    logger.log(`${res.user.tag} is ready`);

    status_handler(client)
    database.backup(__dirname + "/db/backup")

    if (!is_test) {
        run_sdk()
    }
    api();

    audio_api_run();
    // AudioApiV2();

    mod_logs(client);

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

//execute
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const commandName = interaction.commandName;
    const commandLocation = commandsMap.get(commandName);

    if (commandLocation) {
        const { data, execute } = require(commandLocation);

        try {
            await execute(interaction, client);
        } catch (error) {
            logger.error(error);
            await interaction.reply({
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
                await interaction.reply({
                    content: "There was an error while executing autocomplete in this command!",
                    ephemeral: true,
                });
            }
        }
    }
});

client.on('guildMemberAdd', async member => {
    welcome_messages(member, client)
    autorole(member, client)
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
});

client.login(token)
module.exports = { client, config, restartBot, bot_off, bot_on }