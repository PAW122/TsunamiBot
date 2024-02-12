async function checkServerExists(serverId) {
    let { client } = require("../../main");
    if(!client) {
        throw new Error("checkServerExists.js client is undefind.")
    }
    try {
        const server = await client.guilds.fetch(serverId);
        if (server) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}

module.exports = checkServerExists