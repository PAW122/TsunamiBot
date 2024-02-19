const express = require("express");
const favicon = require('serve-favicon');
const app = express();
const path = require("path");
const config = require("../config.json")

//routes
const server_list = require("./endpoints/load")
const save = require("./endpoints/save")
const mod_logs = require("./endpoints/mod_logs")

// index file serving
app.get("/", (req, res) => {
    return res.sendFile(process.cwd() + "/api/webpanel/index.html")
})

// This is (and should) be overriding /api/webpanel/dist/config.js which is a template
// TODO: use config
let currentMode = config.using
app.get("/config.js", (req, res) => {
    return res.sendFile(process.cwd() + `/api/webpanel/config/${currentMode}.js`)
})

// front-end scripts file serving
const frontFolder = process.cwd() + "/api/webpanel/dist";
app.use("/", express.static(frontFolder))


//.ico to test!
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

module.exports = app;