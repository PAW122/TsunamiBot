const express = require('express');
const router = express.Router();
router.use(express.json());
const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/modlogs.json")

const {Auth, AuthV2} = require("../handlers/auth")
const auth = Auth.getInstance();
const authV2 = AuthV2.getInstance();

const ConsoleLogger = require("../../handlers/console")
const logger = ConsoleLogger.getInstance();

const checkServerExists = require("../handlers/checkServerExists")

// /mod_logs/full_load/content
router.post("full_load/content/:server_id/:token/:tokenType", async (req, res) => {

    if(!req.body) {
        return res.status(400).json({error: "No data provided"})
    }

    const tokenType = req.body.tokenType
    const token = req.body.token
    const server_id = req.body.server_id

    let { client } = require("../../main");
    if(!client) {
        console.error("Client is undefind")
        return res.status(401).json({error: "client is offline"})
    }

    if(!tokenType || !token || !server_id) {
        return res.status(400).json({error: "one or more body argument is undefined"})
    }
    
    const is_authV2 = await authV2.verification(tokenType, token, server_id)

    //const is_auth = await auth.verification(tokenType, token, server_id)
    if(!is_authV2) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id)
    if(!is_server) {
        return res.status(400).json({error: "server_id is invalid"})
    }

    db.init();
    const data = await db.read(`${server_id}`);
    console.log(data);


    //var
    let mod_logs_enable = "N/A"

    if(!mod_logs_enable) {
        return res.sendStatus(401).json({error: "mod logs are disablen on this server"})
    }
    
    //load data if server is in DB
    //else database.data = "N/A"
    if(data) {
        
    }

    const response_data = {
        test: 200
    }

    return res.json(response_data);
})

module.exports = router