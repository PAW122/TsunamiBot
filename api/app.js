const express = require("express");
const app = express();

app.get('/', (request, response) => {
    return response.sendFile('\\web\\views\\index.html', { root: '.' });
});

module.exports = app;