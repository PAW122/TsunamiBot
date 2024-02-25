const express = require('express');
const router = express.Router();

const Auth = require("../handlers/auth")
const auth = Auth.getInstance();

const config = require("../config.json")
const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/servers.json")
const ConsoleLogger = require("../../handlers/console")
const logger = ConsoleLogger.getInstance();

const checkServerExists = require("../handlers/checkServerExists")


/**
 * @param {string} tokenType
 * @param {string} token
 * @param {string} server_id
 * @param {bool} status - enable/disable command for server 
 * 
 */
router.get("/dad_messages/enable/:tokenType/:token/:server_id/:status", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let status = req.params.status

    const is_auth = await auth.verification(tokenType, token, server_id)
    if(!is_auth) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id)
    if(!is_server) {
        return res.status(400).json({error: "server_id is invalid"})
    }

    if(status == "true") {
        status = true
    } else if(status == "false") {
        status = false
    } else {
        return res.status(400).json({error: ":status should be boolean"})
    }

    db.init()
    db.write(`${server_id}.dad_channel_enable`, status);
    return res.status(200).json({ok: 200});
})

/**
 * @param {string} tokenType
 * @param {string} token
 * @param {string} server_id
 * @param {string} channel_id - dad command channel listener
 * 
 */
router.get("/dad_messages/channel/:tokenType/:token/:server_id/:channel_id", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    const channel_id = req.params.channel_id

    const is_auth = await auth.verification(tokenType, token, server_id)
    if(!is_auth) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id);
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" });
    }
    
    const channel = client.channels.resolve(channel_id);
    if (!channel || channel.guildId !== server_id) {
        return res.status(400).json({ error: "invalid channel id or channel doesn't belong to the specified server" });
    }    

    db.init()
    db.write(`${server_id}.dad_channel_id`, channel_id);
    return res.status(200).json({ok: 200});
})



/**
 * @param tokenType
 * @param token
 * @param server_id
 * @param message
 * @return {json} ok:200
 */
router.get("/welcome_messages_content/:tokenType/:token/:server_id/:message", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    const message = req.params.message

    const is_auth = await auth.verification(tokenType, token, server_id)
    if(!is_auth) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id)
    if(!is_server) {
        return res.status(400).json({error: "server_id is invalid"})
    }

    if(message.length > 1024) {
        return res.status(400).json({error: "message lenght should be < 1024 characters"})
    }

    db.init();
    db.write(`${server_id}.welcome_dm_message`, message);
    
    return res.status(200).json({ok: 200})
})

/**
 * @param tokenType
 * @param token
 * @param server_id
 * @param {bool} status
 * @return {json} 
 * 
 */
router.get("/auto_role_status/:tokenType/:token/:server_id/:status", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let status = req.params.status

    const is_auth = await auth.verification(tokenType, token, server_id)
    if(!is_auth) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id)
    if(!is_server) {
        return res.status(400).json({error: "server_id is invalid"})
    }

    if(status == "true") {
        status = true
    } else if(status == "false") {
        status = false
    } else {
        return res.status(400).json({error: ":status should be boolean"})
    }

    db.init();
    db.write(`${server_id}.autorole.status`, status);
    
    return res.status(200).json({ok: 200})
})

/**
 * @param tokenType
 * @param token
 * @param server_id
 * @param {string} role_id
 * @return {json}
 * 
 */
router.get("/auto_role_id/:tokenType/:token/:server_id/:role_id", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let role_id = req.params.role_id

    const is_auth = await auth.verification(tokenType, token, server_id)
    if(!is_auth) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id)
    if(!is_server) {
        return res.status(400).json({error: "server_id is invalid"})
    }

    let { client } = require("../../main");
    const server = await client.guilds.fetch(server_id);
        // Sprawdź, czy serwer został znaleziony
        if (!server) {
            return false; // Serwer nie istnieje, więc rola na pewno też nie
        }
        
        // Spróbuj uzyskać rolę na podstawie jej ID
        const role = server.roles.resolve(role_id);
        if(!role) {
            return res.status(400).json({error: "invalid role_id"})
        }
    

    db.init();
    db.write(`${server_id}.autorole.role_id`, role_id);
    
    return res.status(200).json({ok: 200})
})

/**
 * @param tokenType
 * @param token
 * @param server_id
 * @param {bool} status
 * @return {json} 
 * 
 */
router.get("/welcome_messages_status/:tokenType/:token/:server_id/:status", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let status = req.params.status

    const is_auth = await auth.verification(tokenType, token, server_id)
    if(!is_auth) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id)
    if(!is_server) {
        return res.status(400).json({error: "server_id is invalid"})
    }

    if(status == "true") {
        status = true
    } else if(status == "false") {
        status = false
    } else {
        return res.status(400).json({error: ":status should be boolean"})
    }

    db.init();
    db.write(`${server_id}.welcome_status`, status);
    
    return res.status(200).json({ok: 200})
})

/**
 * @param tokenType
 * @param token
 * @param server_id
 * @param {string} channel_id
 * @return {json}
 * 
 */
router.get("/welcome_messages_channel/:tokenType/:token/:server_id/:channel_id", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let channel_id = req.params.channel_id

    const is_auth = await auth.verification(tokenType, token, server_id)
    if(!is_auth) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id)
    if(!is_server) {
        return res.status(400).json({error: "server_id is invalid"})
    }

    let { client } = require("../../main");
    const channel = client.channels.resolve(channel_id);
    if (!channel || channel.guildId !== server_id) {
        return res.status(400).json({ error: "invalid channel id or channel doesn't belong to the specified server" });
    }

    db.init();
    db.write(`${server_id}.welcome_channel`, channel_id);
    
    return res.status(200).json({ok: 200})
})

/**
 * @param tokenType
 * @param token
 * @param server_id
 * @param {string} bot_name max length: 32
 * @return {json} 
 * 
 * @error
 * @user_error - user mistake -> display to the user
 */
router.get("/bot_name/:tokenType/:token/:server_id/:bot_name", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    const bot_name = req.params.bot_name

    const is_auth = await auth.verification(tokenType, token, server_id)
    if(!is_auth) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id)
    if(!is_server) {
        return res.status(400).json({error: "server_id is invalid"})
    }

    //name length?
    if(bot_name.length > config.api.max_bot_name_length) {
        return res.status(400).json({user_error: `Max bot name length is ${config.api.max_bot_name_length}` })
    }

    //illegar chars?
    const allowedCharactersRegex = /^[a-zA-Z0-9_.]+$/;
    if(!allowedCharactersRegex.test(bot_name)) {
        return res.status(400).json({user_error: `your bot name contains illegar characters` })
    }

    //save data
    db.init();
    db.write(`${server_id}.bot_nickname`, `${bot_name}`);

    //zmień nick bota
    let { client } = require("../../main");
    const server = client.guilds.cache.get(server_id);

    if (server) {
        const botMember = server.members.cache.get(client.user.id);

        if (botMember) {
            // Ustaw nick bota na serwerze
            botMember.setNickname(bot_name)
                .then(() => {
                    return res.status(200).json({ok: `Successfully set bot's nickname to "${bot_name}" on server ${server.name}`});
                })
                .catch(error => {
                    return res.status(400).json({error: `Error setting bot nickname: ${error}`});
                });
        } else {
            return res.status(400).json({error: 'Bot is not a member of the specified server'});
        }
    } else {
        return res.status(400).json({error: 'Server not found'});
    }
})

module.exports = router