const express = require('express');
const router = express.Router();

const { Auth, AuthV2 } = require("../handlers/auth")
const auth = AuthV2.getInstance();

const config = require("../config.json")
const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/servers.json")
const ConsoleLogger = require("../../handlers/console")
const logger = ConsoleLogger.getInstance();

const mod_logs_cache = require("../../handlers/modlogsMessages_handler")
const mlc = mod_logs_cache.getInstance()// mod logs cache

const BotLogs = require("../../handlers/bot_logs_handler")
const blh = BotLogs.getInstance()// bot logs handler

const checkServerExists = require("../handlers/checkServerExists")

router.use(express.json());

/**
 * 
 * @param {string} path database data path 
 * @param {*} status data to save
 * @param {json} req request data
 * @param {json} res response data
 * @param {string} tokenType token type
 * @param {string} token user auth token
 * @param {string} server_id server Id
 * @returns {json} return res.status(200).json({ok: 200})
 */
async function default_save(path, status, req, res, tokenType, token, server_id) {
    db.init()
    const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    if (status == "true") {
        status = true
    } else if (status == "false") {
        status = false
    }

    db.init()
    db.write(path, status);
    return res.status(200).json({ ok: 200 });
}

router.get("/tikcet_channel/:tokenType/:token/:server_id/:channel", (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let channel = req.params.channel

    default_save(
        `${server_id}.ticketChannel.channel_id`,
        channel,
        req, res,
        tokenType,
        token,
        server_id
    )
})

router.get("/tikcet_status/:tokenType/:token/:server_id/:status", (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let status = req.params.status

    default_save(
        `${server_id}.ticketChannel.status`,
        status,
        req, res,
        tokenType,
        token,
        server_id
    )
})

router.get("/invite_tracker_channel/:tokenType/:token/:server_id/:channel", (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let channel = req.params.channel

    default_save(
        `${server_id}.invite_tracker.channel_id`,
        channel,
        req, res,
        tokenType,
        token,
        server_id
    )
})

router.get("/invite_tracker_enable/:tokenType/:token/:server_id/:status", (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let status = req.params.status

    default_save(
        `${server_id}.invite_tracker.status`,
        status,
        req, res,
        tokenType,
        token,
        server_id
    )
})

router.get("/botlogsMessages_channel/:tokenType/:token/:server_id/:channel", (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let channel = req.params.channel
    //TODO wywołać kod z funkcji modlogsMessages podczas dodania
    default_save(
        `${server_id}.botLogs.channel`,
        channel,
        req, res,
        tokenType,
        token,
        server_id
    )

    const data = db.read(`${server_id}.botLogs`)
    if (data && data.status === true && data.channel) {
        blh.AddGuild(server_id, channel)
    }

})

router.get("/botlogsMessages_enable/:tokenType/:token/:server_id/:status", (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let status = req.params.status
    //TODO wywołać kod z funkcji modlogsMessages podczas dodania
    default_save(
        `${server_id}.botLogs.status`,
        status,
        req, res,
        tokenType,
        token,
        server_id
    )
    
    const data = db.read(`${server_id}.botLogs`)
    if (data && data.status === true && data.channel) {
        blh.AddGuild(server_id, channel)
    } else if (status === false) {
        blh.RemoveGuild(server_id)
    }
})

router.get("/modlogs_channel_id/:tokenType/:token/:server_id/:channel", (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let channel = req.params.channel
    //TODO wywołać kod z funkcji modlogsMessages podczas dodania
    default_save(
        `${server_id}.modLogsMessages.channel`,
        channel,
        req, res,
        tokenType,
        token,
        server_id
    )

    //check status
    const data = db.read(`${server_id}.modLogsMessages`)
    if (data && data.status === true && data.channel_id) {
        mlc.AddGuild(server_id, channel)
    }
})

router.get("/modlogs_channel_enable/:tokenType/:token/:server_id/:status", (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let status = req.params.status

    //TODO wywołać kod z funkcji modlogsMessages podczas dodania
    default_save(
        `${server_id}.modLogsMessages.status`,
        status,
        req, res,
        tokenType,
        token,
        server_id
    )

    const data = db.read(`${server_id}.modLogsMessages`)
    if (status === true && data && data.channel_id) {
        mlc.AddGuild(server_id, channel)
    } else if (status === false) {
        mlc.RemoveGuild(server_id)
    }
})

router.post("/custom_commands_list/:tokenType/:token/:server_id", (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let data = req.body.data

    const slot = data.slot
    const type = data.type
    const save_data = {
        trigger: data.trigger,
        response: data.response,
        commandType: data.commandType,
        command_status: data.command_status
    }

    default_save(
        `${server_id}.custom_commands.${type}.${slot}`,
        save_data,
        req, res,
        tokenType,
        token,
        server_id
    )
})

router.post("/exception_is_starts_with_filter/:tokenType/:token/:server_id", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let data = req.body.data


    default_save(
        `${server_id}.link_filter.exception_if_starts_with`,
        data,
        req, res,
        tokenType,
        token,
        server_id
    )
})

router.post("/exception_filter/:tokenType/:token/:server_id", async (req, res) => {

    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let data = req.body.data


    default_save(
        `${server_id}.link_filter.exception`,
        data,
        req, res,
        tokenType,
        token,
        server_id
    )
})

router.get("/links_filter/:tokenType/:token/:server_id/:status", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let status = req.params.status

    default_save(
        `${server_id}.link_filter.status`,
        status,
        req, res,
        tokenType,
        token,
        server_id
    )
})

router.get("/auto_vc/enable/:tokenType/:token/:server_id/:status", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let status = req.params.status

    default_save(
        `${server_id}.auto_vc.auto_vc.status`,
        status,
        req, res,
        tokenType,
        token,
        server_id
    )
})

router.get("/auto_vc/channel_id/:tokenType/:token/:server_id/:channel_id", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let channel_id = req.params.channel_id

    default_save(
        `${server_id}.auto_vc.auto_vc.channel_id`,
        channel_id,
        req, res,
        tokenType,
        token,
        server_id
    )
})

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

    default_save(
        `${server_id}.dad_channel_enable`,
        status,
        req, res,
        tokenType,
        token,
        server_id
    )
})

/**
 * @param {string} tokenType
 * @param {string} token
 * @param {string} server_id
 * @param {string} channel_id - dad command channel listener
 * 
 */
router.get("/dad_messages/channel/:tokenType/:token/:server_id/:value", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    let value = req.params.value

    const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id);
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" });
    }

    if (value == "true") {
        value = true
    } else if (value == "false") {
        value = false
    }

    //zapisz dane jeżęli są poprawne
    if (value != true || value != false || !check_channel) {
        return res.status(400).json({ error: "invalid value", value: value });
    }

    db.init()
    db.write(`${server_id}.channel`, value);
    return res.status(200).json({ ok: 200 })

    function check_channel() {
        const channel = client.channels.resolve(value);
        if (!channel || channel.guildId !== server_id) {
            return false
        }
    }
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
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    if (message.length > 1024) {
        return res.status(400).json({ error: "message lenght should be < 1024 characters" })
    }

    db.init();
    db.write(`${server_id}.welcome_message`, message);

    return res.status(200).json({ ok: 200 })
})

/**
 * @param tokenType
 * @param token
 * @param server_id
 * @param message
 * @return {json} ok:200
 */
router.get("/welcome_dm_messages_content/:tokenType/:token/:server_id/:message", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    const message = req.params.message

    if (message.length > 1024) {
        return res.status(400).json({ error: "message lenght should be < 1024 characters" })
    }

    default_save(
        `${server_id}.welcome_dm_message`,
        message,
        req, res,
        tokenType,
        token,
        server_id
    )
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
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    if (status == "true") {
        status = true
    } else if (status == "false") {
        status = false
    } else {
        return res.status(400).json({ error: ":status should be boolean" })
    }

    db.init();
    db.write(`${server_id}.autorole.status`, status);

    return res.status(200).json({ ok: 200 })
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
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    let { client } = require("../../main");
    const server = await client.guilds.fetch(server_id);
    // Sprawdź, czy serwer został znaleziony
    if (!server) {
        return false; // Serwer nie istnieje, więc rola na pewno też nie
    }

    // Spróbuj uzyskać rolę na podstawie jej ID
    const role = server.roles.resolve(role_id);
    if (!role) {
        return res.status(400).json({ error: "invalid role_id" })
    }


    db.init();
    db.write(`${server_id}.autorole.role_id`, role_id);

    return res.status(200).json({ ok: 200 })
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
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    if (status == "true") {
        status = true
    } else if (status == "false") {
        status = false
    } else {
        return res.status(400).json({ error: ":status should be boolean" })
    }

    db.init();
    db.write(`${server_id}.welcome_status`, status);

    return res.status(200).json({ ok: 200 })
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
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    let { client } = require("../../main");
    const channel = client.channels.resolve(channel_id);
    if (!channel || channel.guildId !== server_id) {
        return res.status(400).json({ error: "invalid channel id or channel doesn't belong to the specified server" });
    }

    db.init();
    db.write(`${server_id}.welcome_channel`, channel_id);

    return res.status(200).json({ ok: 200 })
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
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    //name length?
    if (bot_name.length > config.api.max_bot_name_length) {
        return res.status(400).json({ user_error: `Max bot name length is ${config.api.max_bot_name_length}` })
    }

    //illegar chars?
    const allowedCharactersRegex = /^[a-zA-Z0-9_.]+$/;
    if (!allowedCharactersRegex.test(bot_name)) {
        return res.status(400).json({ user_error: `your bot name contains illegar characters` })
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
                    return res.status(200).json({ ok: `Successfully set bot's nickname to "${bot_name}" on server ${server.name}` });
                })
                .catch(error => {
                    return res.status(400).json({ error: `Error setting bot nickname: ${error}` });
                });
        } else {
            return res.status(400).json({ error: 'Bot is not a member of the specified server' });
        }
    } else {
        return res.status(400).json({ error: 'Server not found' });
    }
})

module.exports = router