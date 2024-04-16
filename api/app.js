const express = require("express");
const favicon = require('serve-favicon');
const app = express();
const path = require("path");
const config = require("../config.json")
const bodyParser = require('body-parser');
//routes
const server_list = require("./endpoints/load")
const save = require("./endpoints/save")
const mod_logs = require("./endpoints/mod_logs")
const full_load = require("./endpoints/full_load")
const actions = require("./endpoints/actions")
const admin = require("./endpoints/admin")
const full_mod_load = require("./endpoints/full_mod_logs_load")

// index file serving
app.get("/", (req, res) => {
    return res.sendFile(process.cwd() + "/api/webpanel/index.html")
})

app.get("/partners", (req, res) => {
    return res.sendFile(process.cwd() + "/api/webpanel/partners.html")
})

app.get("/admin", (req, res) => {
    return res.sendFile(process.cwd() + "/api/webpanel/admin.html")
})


let currentMode = config.using
app.get("/config.js", (req, res) => {
    return res.sendFile(process.cwd() + `/api/webpanel/config/${currentMode}.js`)
})

// front-end scripts file serving
const frontFolder = process.cwd() + "/api/webpanel/dist";
app.use("/", express.static(frontFolder))


app.use(favicon(path.join(__dirname, './assets/favicon.ico')));
app.get("/favicon.ico", (req, res) => {
    return res.sendFile(`/api/assets/favicon.ico`)
})

/**
 * /load/~~~/:token_type/:token
 * @param :token_type
 * @param token
 * @return {json}
 */
app.use("/load", server_list)

/**
 * load all webside elements in one request
 * /load/~~~/:token_type/:token
 * @param :token_type
 * @param token
 * @return {json}
 */
app.use("/full_load", full_load);

/**
 * /save/~~~/:token_type/:token/:server_id
 * @param token_type
 * @param token
 * @param server_id
 * @return {json}
 */
app.use("/save", save)

/**
 * /modlogs/:tokenType/:token/:server_id/:filter/:elements
 * @param tokenType
 * @param token
 * @param server_id
 * @param filter - filtry jakie logi wczytać
 * @param {int} elements - ilość logów do wczytania
 * @return {json}
 */
app.use("/modlogs", mod_logs)
app.use("/actions", actions)
app.use("/admin", admin)
app.use("/mod_logs", full_mod_load)
app.use(bodyParser.json());
// AUDIO TEST API ==================================================

const { DataStore } = require("../handlers/audio/api")
let data = DataStore.getInstance()

app.post("/connect/:station_name/:ip", async (req, res) => {
    let ipAddress = req.params.ip
    const station_name = req.params.station_name
    console.log(`ip: ${ipAddress}`)
    // console.log(req)
    
    //test req
    // if (ipAddress === "::1") {
    //     ipAddress = "127.0.0.1"
    // }

    // if(!station_name) {
    //     return req.status(401).json({error: "station name undefined"})
    // } else if (audio_station_banned_names.has(station_name)) {
    //     console.log(`IP: ${ipAddress} try to use banned station name: ${station_name}`)
    //     return req.status(401).json({error: "station name is not available"})
    // }

    ipAddress = ipAddress.includes('::ffff:') ? ipAddress.slice(7) : ipAddress;

   //lista piosenek przyjdzie w body

    console.log(req.body)
    const songs_list = req.body

    console.log(station_name)
   
    //client odpowiedział, dodaj go do listy
    data.add(ipAddress, { name: station_name, files: songs_list });

    console.log("wszystkie dane")
    console.log(data.get())
    
    return res.status(200).json({ok: 200})
})

module.exports = app;