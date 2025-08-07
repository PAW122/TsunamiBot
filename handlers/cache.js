const Database = require("../db/database");
const database = new Database(__dirname + "/../db/files/messages_cache.json");

// cache.js
const messageCache = new Map();

function rememberMessage(msg) {
    if (!msg?.id) return;
    database.init();
    database.write(msg.id, msg);
}

function getBefore(id) {
  return database.read(id) || null;
}

module.exports = { messageCache, rememberMessage, getBefore };