const Database = require("../db/database")
const db = new Database(__dirname + "/../db/files/log_messages.json");

const config = require("../config.json")
const using = config.using
const enable = config[using].config.messages_logs

function log_messages(message) {

    if(!enable) return;

    const guild_id = message.guild.id
    const channel_id = message.channel.id
    const user = message.author.id
    const content = message.content
    const message_id = message.id

    db.init()

    const data = {
        author: user,
        content: content
    }

    db.write(`${guild_id}.${channel_id}.${message_id}`, data)
}

module.exports = log_messages;