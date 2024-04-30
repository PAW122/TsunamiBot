const fs = require('fs');
const ConsoleLogger = require("./console")
const logger = ConsoleLogger.getInstance();
const config = require("../config.json")
let disable_commands;
const is_ellie = config[config.using].is_ellie_config

if(is_ellie) {
    disable_commands = config[config.using].disable_ellie_commands
} else {
    disable_commands = config[config.using].disable_commands
}

async function register_slash_commands(client, is_test) {
    const commandsDir = fs.readdirSync(__dirname + `/../commands`);

    // Iterate through each guild the bot is a member of
    client.guilds.cache.forEach(async (guild) => {
        for (const folder of commandsDir) {
            const commandsFile = fs.readdirSync(__dirname + `/../commands/${folder}`).filter(file => file.endsWith(".js"));

            for (const file of commandsFile) {
                const filePath = __dirname + `/../commands/${folder}/${file}`;
                delete require.cache[require.resolve(filePath)]; // Clear the cache
                const { command, _  } = require(filePath);
                if(!command) {
                    return logger.error("blank command")
                }

                try {
                    // Register command on the specific guild
                    if(!disable_commands.includes(command.name)) {
                        await guild.commands.create(command);
                    } else {
                        logger.log(`disable command: ${command.name}`)
                    }
                    //console.log(`Command registered on guild ${guild.id}: ${command.name}`);
                } catch (error) {
                    if(!is_test) {
                        logger.log(command)
                        logger.error(`Error registering command ${command.name} on guild ${guild.id}:`, error);
                    } else {
                        logger.extra(command)
                        logger.extra(`Error registering command ${command.name} on guild ${guild.id}:`, error);
                    }
                }
            }
        }
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
async function registerSlashCommandsForGuild(guild, client) {
    const commandsDir = fs.readdirSync(__dirname + `/../commands`);

    for (const folder of commandsDir) {
        const commandsFile = fs.readdirSync(__dirname + `/../commands/${folder}`).filter(file => file.endsWith(".js"));

        for (const file of commandsFile) {
            const filePath = __dirname + `/../commands/${folder}/${file}`;
            delete require.cache[require.resolve(filePath)]; // Clear the cache
            const { command, _, settings } = require(filePath);
            if(!command) {
                return console.log("global blank command")
            }

            try {
                // Register command on the specific guild
                if(!disable_commands.includes(command.name)) {
                    await guild.commands.create(command);
                } else {
                    logger.log(`disable command: ${command.name}`)
                }
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

module.exports = {unregisterAllCommands, register_slash_commands, registerSlashCommandsForGuild, unregisterAllCommandsForGuild}