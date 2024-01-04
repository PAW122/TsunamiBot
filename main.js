const TOKEN = "OTI4Mzk5NDU4NTcwNTAyMTU1.G0laP_.-muoboXSKZ4aqA7kyJ_YJBKc7wBVwkigRWsF98"
const OWNER_ID = "438336824516149249";
const { Client, GatewayIntentBits } = require("discord.js")
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates]
});

const { register_slash_commands, unregisterAllCommands } = require("./handlers/SlashCommandHandler")
const { commandsMap } = require("./handlers/commandsMap")
const welcome_messages = require("./handlers/welcome")
//const autorole = require("./handlers/autorole")
const web = require("./web/main")
const log_messages = require("./handlers/logMessages")
const { lvl_system } = require("./handlers/lvlHandler")

const ConsoleLogger = require("./handlers/console")
const logger = ConsoleLogger.getInstance();

client.on("ready", (res) => {
    logger.log(`${res.user.tag} is ready`);
    client.user.setActivity("Watching TTV TsunamiCat");

    //dodać sprawdzanie listy / commands bota na discordzie, jeżeli jest jakaś któraj nie ma w map to tylko wtedy usówać!
    unregisterAllCommands(client)
        .then(register_slash_commands(client))
    //register_slash_commands(client)

    //run bot webside
    web();
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

//!!!!!!! setCustomId dla selectMenu musi być nazwą komendy
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isSelectMenu()) return;
    //console.log(interaction)
    // można zamienić na StringSelectMenuInteraction

    const command_name = interaction.customId
    const commandLocation = commandsMap.get(command_name);

    if (commandLocation) {
        const { data, execute, selectMenu } = require(commandLocation);

        try {//selectMenu is function name in command to execute selectMenu interaction
            await selectMenu(interaction, client);
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
    //autorole(member, client)
});

client.on("messageCreate", message => {
    log_messages(message)
    lvl_system(message)
})

client.on("uncaughtException", (e) => {
    logger.warn(e)
});

client.login(TOKEN)
module.exports = { client }
/*TODO
podstronę z pomysłami.
opcje dodawania up vote i down vote,
posty segregowane za względu na:
ilość votów albo który został pierwszy wczytany
*/