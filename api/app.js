const express = require("express");
const app = express();

//routes
const server_list = require("./endpoints/load")
const save = require("./endpoints/save")

//web
app.get('/', (request, response) => {
    return response.sendFile(process.cwd() + '/web2/views/index.html');
});

app.get('/main.js', (request, response) => {
    return response.sendFile(process.cwd() + '/web2/scripts/main.js');
});

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

module.exports = app;