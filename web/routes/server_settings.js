const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");

const ConsoleLogger = require("../../handlers/console")
const logger = ConsoleLogger.getInstance();

const { save_basics } = require("../../handlers/_save_basics_data")

/**
 * 
 * @param {*} type - db variable name
 * @param {*} value - variable balue
 */
function save_server_settings(type, value, server_id) {
    save_basics(server_id)
    if(value === "true") value = true;
    else if(value === "false") value = false;

    database.init()
    database.write(`${server_id}.${type}`, value)
    logger.extra(`dla serwera ${server_id}.${type} zapisano ${value}`)
}

/**
 * np welcome_status, server_id
 * @param {*} type 
 * @param {*} server_id 
 */
function load_server_settings(type, server_id) {

    //avoid wird error
    if(type === "welcome_status") {
        const data = database.read(`${server_id}`)
        let res = data.welcome_status
        console.log(res)
        return res;
    }

    database.init()
    const data = database.read(`${server_id}.${type}`)
    console.log(data)
    return data;
}

/**
 * 
 * @param {*} name 
 * @param {*} server_id 
 */
function save_bot_username(name, server_id) {
    
    var { client } = require("../../main")
    // Pobierz obiekt serwera (Guild) na podstawie ID
    const server = client.guilds.cache.get(server_id);

    if (server) {
        // Pobierz obiekt bota na danym serwerze
        const botMember = server.members.cache.get(client.user.id);

        if (botMember) {
            // Ustaw nick bota na serwerze
            botMember.setNickname(name)
                .then(() => {
                    logger.extra(`Successfully set bot's nickname to "${name}" on server ${server.name}`);

                    save_server_settings("bot_nickname",name ,server_id)
                })
                .catch(error => {
                    logger.error('Error setting bot nickname:', error);
                });
        } else {
            logger.error('Bot is not a member of the specified server');
        }
    } else {
        logger.error('Server not found');
    }
}

module.exports = { save_server_settings, load_server_settings, save_bot_username }