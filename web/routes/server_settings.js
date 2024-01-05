const Database = require("../../db/database");
const database = new Database(__dirname + "\\..\\..\\db\\files\\servers.json");

const ConsoleLogger = require("../../handlers/console")
const logger = ConsoleLogger.getInstance();
/**
 * 
 * @param {*} type - db variable name
 * @param {*} value - variable balue
 */
function save_server_settings(type, value, server_id) {
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
    database.init()
    const data = database.read(`${server_id}.${type}`).toString()
    return data;
}

module.exports = { save_server_settings, load_server_settings }