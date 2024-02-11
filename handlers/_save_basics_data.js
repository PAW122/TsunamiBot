const Database = require("../db/database");
const database = new Database(__dirname + "/../db/files/servers.json");

const ConsoleLogger = require("../handlers/console")
const logger = ConsoleLogger.getInstance();
/**
 * return basics informations about server (from db)
 * @param {*} server_id 
 */
function return_basics(server_id) {
    
}

/**
 * check is in db data about server exist
 * @param {*} server_id 
 */
function check_basics(server_id) {

}

/**
 * save data in db about server
 * @param {*} server_id 
 */
function save_basics(server_id) {
    logger.log(`save basics ${server_id}`)
    const { client } = require("../main");
    const guild = client.guilds.cache.get(server_id);
    const data = {
        name: guild.name,
        owner: guild.ownerId
    }
    database.push(`${server_id}`, data)
}

module.exports = {save_basics, check_basics, return_basics}