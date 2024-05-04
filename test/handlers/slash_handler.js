const config = require("../../config.json")
const using = config.using
const is_test = config[using].is_test
const server_whitelist = config[using].test_commands_server_list
const test_slash_commands_path = config[using].test_slash_commands_path

const fs = require('fs');
const ConsoleLogger = require("../../handlers/console")
const logger = ConsoleLogger.getInstance();


async function register_slash_commands(client, is_test, test_slash_commands_path) {
    server_whitelist.forEach(guildId => {
        const guild = client.guilds.cache.get(guildId);
        registerSlashCommandsForGuild(guild, client, test_slash_commands_path)
    })
}


async function unregisterAllCommands(client) {
    try {
        const commands = await client.application.commands.fetch();

        for (const command of commands.values()) {
            await client.application.commands.delete(command.id);
        }

        logger.log('All commands unregistered successfully.');
    } catch (error) {
        logger.error('Error while unregistering commands:', error);
    }

}
/**
 * 
 * @param {string} guild guild Id
 * @param {object} client client
 */
async function registerSlashCommandsForGuild(guild, client, folder_name) {
    const commandsDir = fs.readdirSync(__dirname + `/../${folder_name}`);

    for (const folder of commandsDir) {
        const commandsFile = fs.readdirSync(__dirname + `/../${folder_name}/${folder}`).filter(file => file.endsWith(".js"));

        for (const file of commandsFile) {
            const filePath = __dirname + `/../${folder_name}/${folder}/${file}`;
            delete require.cache[require.resolve(filePath)]; // Clear the cache
            const { command, _, settings } = require(filePath);
            if (!command) {
                return console.log("global blank command")
            }

            try {
                // Register command on the specific guild
                await guild.commands.create(command);
                //console.log(`Command registered on guild ${guild.id}: ${command.name}`);
            } catch (error) {
                logger.error(`Error registering command ${command.name} on guild ${guild.id}:`, error);
            }
        }
    }

    logger.log(`All commands registered successfully on guild ${guild.id}.`);
}

/**
 * 
 * @param {string} guild guild Id
 * @param {*} client client
 */
async function unregisterAllCommandsForGuild(guild, client) {
    try {
        const commands = await guild.commands.fetch();

        for (const command of commands.values()) {
            await guild.commands.delete(command.id);
        }

        //console.log(`All commands unregistered successfully on guild ${guild.id}.`);
    } catch (error) {
        logger.error(`Error while unregistering commands on guild ${guild.id}:`, error);
    }
}

module.exports = { unregisterAllCommands, register_slash_commands, registerSlashCommandsForGuild, unregisterAllCommandsForGuild }