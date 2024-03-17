const express = require('express');
const router = express.Router();
router.use(express.json());
const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/servers.json")
const partners = new Database(__dirname + "/../../db/files/partners.json")
const ideas_db = new Database(__dirname + "/../../db/files/ideas.json")

const { AuthV2 } = require("../handlers/auth")
const authV2 = AuthV2.getInstance();

const ConsoleLogger = require("../../handlers/console")
const logger = ConsoleLogger.getInstance();
//bot_off, bot_on
const checkServerExists = require("../handlers/checkServerExists")

router.get("/on/:tokenType/:token", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token

    let { client, bot_on } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    const is_authV2 = await authV2.admin_verification(tokenType, token)

    //const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_authV2) {
        return res.status(400).json({ error: "invalid_token" })
    }

    await bot_on()
    return res.status(200).json({ok: "succes"})
})

router.get("/off/:tokenType/:token", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token

    let { client, bot_off } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    const is_authV2 = await authV2.admin_verification(tokenType, token)

    //const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_authV2) {
        return res.status(400).json({ error: "invalid_token" })
    }

    await bot_off()
    return res.status(200).json({ok: "succes"})
})

router.get("/restart/:tokenType/:token", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token

    let { client, restartBot } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    const is_authV2 = await authV2.admin_verification(tokenType, token)

    //const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_authV2) {
        return res.status(400).json({ error: "invalid_token" })
    }

    await restartBot()
    return res.status(200).json({ok: "succes"})
})

router.get("/load/ideas/:tokenType/:token", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token

    let { client } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    const is_authV2 = await authV2.admin_verification(tokenType, token)

    //const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_authV2) {
        return res.status(400).json({ error: "invalid_token" })
    }

    db.init();

    const ideas = await ideas_db.read("ideas")

    return res.json(ideas);
})

router.post('/save/ideas/:tokenType/:token', async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    let body_data = false;
    try {
        body_data = JSON.parse(req.body.data);
    } catch (err) {
        return res.status(400).json({ error: err })
    }

    let { client } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    const is_authV2 = await authV2.admin_verification(tokenType, token)

    //const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_authV2) {
        return res.status(400).json({ error: "invalid_token" })
    }

    if(body_data === false) {
        return res.status(400).json({error: "invalid data"})
    }

    db.init();

    ideas_db.write("ideas", body_data)

    return res.json({ ok: 200 });
})

router.post("/save/partners.json/:tokenType/:token", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    let body_data = false;
    try{
        body_data = JSON.parse(req.body.data);
    }catch(err) {
        return res.status(400).json({error: err})
    }

    let { client } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    const is_authV2 = await authV2.admin_verification(tokenType, token)

    //const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_authV2) {
        return res.status(400).json({ error: "invalid_token" })
    }

    if(body_data == false) {
        return res.status(400).json({error: "invalid data"})
    }

    db.init();

    partners.write("partners", body_data)

    return res.json({ ok: 200 });
})

router.get("/load/partners.json/:tokenType/:token", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token

    let { client } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    const is_authV2 = await authV2.admin_verification(tokenType, token)

    //const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_authV2) {
        return res.status(400).json({ error: "invalid_token" })
    }

    db.init();

    const data = await partners.read("partners")

    const response_data = {
        partners: data
    }

    return res.json(response_data);
})

//main load router
router.get("/content/:tokenType/:token", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token

    let { client } = require("../../main");
    if (!client) {
        console.error("Client is undefind")
        return res.status(401).json({ error: "client is offline" })
    }

    if (!tokenType || !token) {
        return res.status(400).json({ error: "one or more body argument is undefined" })
    }

    const is_authV2 = await authV2.admin_verification(tokenType, token)

    //const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_authV2) {
        return res.status(400).json({ error: "invalid_token" })
    }

    db.init();


    const response_data = {
        servers_count: client.guilds.cache.size
    }

    return res.json(response_data);
})

module.exports = router;
