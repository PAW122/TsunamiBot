const express = require('express');
const router = express.Router();

const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/modlogs.json")

const {Auth, AuthV2} = require("../handlers/auth")
const authV2 = AuthV2.getInstance();

const checkServerExists = require("../handlers/checkServerExists")

const config = require("../config.json")
const mod_logs_list = config.api.mod_logs_list

router.get("/:tokenType/:token/:server_id/:filter/:elements", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    const filter = req.params.filter
    let elements = req.params.elements

    const is_auth = await authV2.verification(tokenType, token, server_id)
    if(!is_auth) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id)
    if(!is_server) {
        return res.status(400).json({error: "server_id is invalid"})
    }

    //deafult val for elements = 10;
    if(isNaN(elements)) {
        elements = 10
    } else {
        elements = parseInt(elements);
    }

    /**
     * max elements = 25
     * load max <elements> of logs for every log type and add all to one list
     * @returns {json}
     */
    async function load_all() {

        if(elements > 25) {
            return res.status(400).json({error: "u cant load more then 25 elements one type. elements is to big"})
        }

        db.init();
        const allLogs = [];
        for (const filter of mod_logs_list) {
            const data = await load_one(filter); // Pobierz ostatnie 10 wpisów dla danego typu logów
            if(data) {
                allLogs.push(...data); // Dodaj wpisy do listy wszystkich logów
            }
        }
        // Posortuj listę wszystkich logów na podstawie czasu timestamp (od najstarszego do najnowszego)
        allLogs.sort((a, b) => a.timestamp - b.timestamp);
        return allLogs;
    }
    

    /**
     * load max elements = 50
     * load <elements> of logs for <filter> type of logs
     * @param {int} filter log type to load
     * @returns 
     */
    async function load_one(filter) {

        if(elements > 50) {
            return res.status(400).json({error: "u cant load more then 50 elements one type. elements is to big"})
        }

        db.init();
        const data = db.readList(`${server_id}.modlogs.${filter}`, elements)
        return data;
    }

    //load all last logs
    if(filter == null || filter === "all") {
        const send = await load_all();
        return res.status(200).json(send);

    }else if(mod_logs_list.includes(filter)) {
        const send = await load_one(filter);
        return res.status(200).json(send);

    } else {
        return res.status(400).json({error: "invalid filter"})
    }
})

module.exports = router;