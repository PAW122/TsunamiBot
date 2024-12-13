const express = require('express');
const router = express.Router();

const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/servers.json")

const { Auth, AuthV2 } = require("../handlers/auth")
const authV2 = AuthV2.getInstance();

const checkServerExists = require("../handlers/checkServerExists")

const config = require("../config.json")
const mod_logs_list = config.api.mod_logs_list

const BotLogs = require("../../handlers/bot_logs_handler")
const BotLogsHandler = BotLogs.getInstance()

// /reactionrole/...

/*
creating and deleting data by managing on bot web-page
*/

// add reaction-role to message by id
router.post("/save_reaction_by_id/:guildId", async (req, res) => {
    // get data
    if (!req.body) {
        return res.status(400).json({ error: "No data provided" })
    }
    const tokenType = req.body.tokenType
    const token = req.body.token
    const server_id = req.params.guildId
    const channel_id = req.body.channel_id
    const message_id = req.body.message_id
    const role_id = req.body.role_id
    const emoji = req.body.emoji
    const status = req.body.status
    const name = req.body.name // name to display on web

    let { client } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token || !server_id) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    if (!channel_id || !emoji) {
        return res.status(400).json({ error: "one or more body argumen's is undefined" })
    }

    const is_authV2 = await authV2.verification(tokenType, token, server_id)

    if (!is_authV2) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    const save_data = {
        emoji: emoji,
        status: status,
        role_id: role_id,
        name: name,
    }
    db.init();
    db.addToList(`${server_id}.reaction_role.${channel_id}.${message_id}`, save_data)

    BotLogsHandler.SendLog(server_id, `Reaction role set on bot website\n channel_id: ${channel_id}\n message_id: ${message_id}`)

    return res.status(200).json({ status: "ok" });
})

// delete reaction-role to message by id
router.post("/remove_reaction_by_id/:guildId", async (req, res) => {
    console.log(req.body)
    // get data
    if (!req.body) {
        return res.status(400).json({ error: "No data provided" })
    }
    const tokenType = req.body.tokenType
    const token = req.body.token
    const server_id = req.params.guildId 
    const message_id = req.body.message_id
    const emoji = req.body.emoji

    let { client } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token || !server_id) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    if (!emoji) {
        return res.status(400).json({ error: "one or more body argumen's is undefined" })
    }

    const is_authV2 = await authV2.verification(tokenType, token, server_id)

    if (!is_authV2) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    db.init();
    const data = await db.read(`${server_id}.reaction_role`)

    // przejsc po wszystkich i matchowac messageId oraz emoji
    // console.log('data')
    // console.log(data)

    // console.log("db")
    // // console.log(data.emoji, data.status, data.role_id, data.name)

    // console.log("to delete")
    // console.log(emoji)
    // console.log(message_id)
    // console.log(server_id)

    Object.keys(data).forEach(channel_id => {
        console.log(`channel id: ${channel_id}`);
    
        // Sprawdź, czy `data[channel_id][message_id]` istnieje i jest tablicą
        const messageData = data[channel_id][message_id];
        if (Array.isArray(messageData)) {
            messageData.forEach((obj, index) => {
                if (obj.emoji === emoji && obj.status === true) {
                    // Zmień status w pamięci
                    obj.status = false;
    
                    // Zapisz zmiany w bazie danych
                    const dbKey = `${server_id}.reaction_role.${channel_id}.${message_id}`;
                    const existingData = db.read(dbKey); // Pobierz aktualne dane
                    if (Array.isArray(existingData)) {
                        // Znajdź odpowiedni obiekt w bazie danych
                        const targetIndex = existingData.findIndex(
                            item => item.emoji === emoji
                        );
    
                        if (targetIndex !== -1) {
                            existingData[targetIndex].status = false; // Aktualizuj status
                            db.write(dbKey, existingData); // Zapisz zmiany w bazie
                            BotLogsHandler.SendLog(
                                server_id,
                                `Reaction role deleted on bot website\nchannel_id: ${channel_id}\nmessage_id: ${message_id}`
                            );
                            
                        } else {
                            console.warn(`Object with emoji ${emoji} not found in DB`);
                        }
                    } else {
                        console.warn(`Data at ${dbKey} is not an array`);
                    }
                }
            });
        } else {
            console.warn(
                `Message data for channel_id: ${channel_id} and message_id: ${message_id} is not an array`
            );
        }
    });
     

    return res.status(200).json({ status: "ok" });
})

// create re_ro message and autocomplete re_ro data
router.get("/create_reaction_role_message", async (req, res) => {

})

// delete re_ro message and autocomplete re_ro data
router.get("/delete_reaction_role_message", async (req, res) => {

})

/*
reaction-role-api
for webside loading / displaying data
*/

// get all user objects to display
router.get("/get_all_users_reaction_roles", async (req, res) => {

})

// load all data neede to display stuf on website
router.post("/load_all", async (req, res) => {
    // get data
    if (!req.body) {
        return res.status(400).json({ error: "No data provided" })
    }
    const tokenType = req.body.tokenType
    const token = req.body.token
    const server_id = req.body.server_id

    let { client } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token || !server_id) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    const is_authV2 = await authV2.verification(tokenType, token, server_id)

    if (!is_authV2) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    // loading aplication data
    const server = client.guilds.cache.get(server_id);
    if (!server) {
        return res.status(400).json({ error: "invalid serverId" })
    }

    db.init();
    let data = await db.read(`${server_id}.reaction_role`);
    if (data) {
        for (const guildKey in data) {
            if (data.hasOwnProperty(guildKey)) {
                for (const messageKey in data[guildKey]) {
                    if (data[guildKey].hasOwnProperty(messageKey)) {
                        const messageData = data[guildKey][messageKey];
                        
                        if (Array.isArray(messageData)) {
                            data[guildKey][messageKey] = messageData.filter(
                                element => element.status === true
                            );
                        } else {
                            console.warn(`Warning: data[${guildKey}][${messageKey}] is not an array`);
                        }
                    }
                }
            }
        }
    }
    
    // if (!data) {
    //     return res.status(400).json({error: "server reaction role not found"})
    // }

    const channels = server.channels.cache;//dont send
    const server_channels_list = channels.map(channel => ({
        id: channel.id,
        name: channel.name
    }));

    const roles = server.roles.cache;//dont send
    const server_roles_list = roles.map(role => ({
        id: role.id,
        name: role.name
    }));

    return res.status(200).json({
        reaction_role_data: data,
        channels: server_channels_list,
        roles: server_roles_list
    })
})

// api for future website to display guild reaction roles for not admin users
// to be able to get role from page without need to do that on discord.
router.get("/get_all_guild_reaction_roles", async (req, res) => {

})

function checkToken() {

}

module.exports = router;