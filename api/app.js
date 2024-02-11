const express = require("express");
const app = express();

const {client} = require("../main")

app.get('/', (request, response) => {
    return response.send({status: "ok"})
});

app.get("load/server-list/:token", (req, res) => {

})

module.exports = app;