const express = require("express");
const favicon = require('serve-favicon');
const app = express();
const path = require("path");
const config = require("../config.json")

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

module.exports = app;