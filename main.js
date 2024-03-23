const config_manager = require("./config.json")
const config = config_manager[config_manager.using]
const is_test = config.is_test ? config.is_test : false
//TODO !!!!!!!!!!!!!!!!!!!!
//jak wygaśnie token autoryzacji to w /api/load:288
//wywala error http 401 crashujący całego bota.
//dać jakiś cache
require('dotenv').config();
let token;
if (is_test) {
    token = process.env.TOKEN2;
} else {
    token = process.env.TOKEN;
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
        GatewayIntentBits.GuildPresences]
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
const {audio_api_run} = require("./handlers/audio/api")

client.on("ready", async (res) => {
    logger.log(`${res.user.tag} is ready`);

    status_handler(client)
    database.backup(__dirname + "/db/backup")

    api();
    audio_api_run();
    mod_logs(client);


    //dodać sprawdzanie listy / commands bota na discordzie, jeżeli jest jakaś któraj nie ma w map to tylko wtedy usówać!
    await unregisterAllCommands(client)
        .then(await register_slash_commands(client, is_test))
        .then(logger.log("All commands registered successfully on all guilds."))
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

    if (message.author.id === "438336824516149249" && !message.author.bot && message.content.startsWith("reload")) {
        const args = message.content.trim().split(/ +/);
        if (args[0] === "reload") {
            const guild = message.guild

            unregisterAllCommandsForGuild(guild, client)
                .then(
                    registerSlashCommandsForGuild(guild, client)
                )

            await message.reply("commands are being refreshed. This may take a few minutes");
        }
    }
})

async function restartBot() {
    try {
        console.log('Restartowanie bota...');

        // Rozłączanie bota z Discord
        await client.destroy();

        // Ponowne połączenie bota z Discord
        await client.login(token);

        console.log('Bot został pomyślnie zrestartowany!');
    } catch (error) {
        console.error('Wystąpił błąd podczas restartowania bota:', error);
    }
}

// Definicja funkcji wyłączającej bota
async function bot_off() {
    try {
        console.log('Wyłączanie bota...');

        // Rozłączanie bota z Discord
        await client.destroy();

        console.log('Bot został pomyślnie wyłączony!');
    } catch (error) {
        console.error('Wystąpił błąd podczas wyłączania bota:', error);
    }
}

// Definicja funkcji włączającej bota
async function bot_on() {
    try {
        console.log('Włączanie bota...');

        // Ponowne połączenie bota z Discord
        await client.login(token);

        console.log('Bot został pomyślnie włączony!');
    } catch (error) {
        console.error('Wystąpił błąd podczas włączania bota:', error);
    }
}

client.on("uncaughtException", (e) => {
    logger.warn(e)
});

client.login(token)
module.exports = { client, config, restartBot, bot_off, bot_on }
// /*TODO
// podstronę z pomysłami.
// opcje dodawania up vote i down vote,
// posty segregowane za względu na:
// ilość votów albo który został pierwszy wczytany
// */