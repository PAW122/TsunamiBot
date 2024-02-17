const config_manager = require("./config.json")
const config = config_manager[config_manager.using]
const is_test = config.is_test ? config.is_test : false
const token = config.token

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

client.on("ready",async (res) => {
    logger.log(`${res.user.tag} is ready`);

    status_handler(client)
    database.backup(__dirname + "/db/backup")

    api();
    mod_logs(client);


    //dodać sprawdzanie listy / commands bota na discordzie, jeżeli jest jakaś któraj nie ma w map to tylko wtedy usówać!
    unregisterAllCommands(client)
        .then(register_slash_commands(client, is_test))
        .then(logger.log("All commands registered successfully on all guilds."))
});

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

client.on('guildMemberAdd', member => {
    welcome_messages(member, client)
    autorole(member, client)
});

client.on("messageCreate", message => {
    log_messages(message)
    lvl_system(message)
})

client.on("uncaughtException", (e) => {
    logger.warn(e)
});

client.login(token)
module.exports = { client, config }
// /*TODO
// podstronę z pomysłami.
// opcje dodawania up vote i down vote,
// posty segregowane za względu na:
// ilość votów albo który został pierwszy wczytany
// */