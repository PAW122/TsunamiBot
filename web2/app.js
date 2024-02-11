const express = require("express");
const app = express();

app.get('/', (request, response) => {
    return response.sendFile('/web2/views/index.html', { root: '.' });
});

app.get('/main.js', (request, response) => {
    return response.sendFile('/web2/scripts/main.js', { root: '.' });
});

module.exports = app;