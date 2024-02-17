const express = require("express");
const favicon = require('serve-favicon');
const app = express();
const path = require("path");

//routes
const server_list = require("./endpoints/load")
const save = require("./endpoints/save")
const mod_logs = require("./endpoints/mod_logs")

// static file serving
const staticsFolder = process.cwd() + "/api/webpanel";
app.use("/", express.static(staticsFolder))


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