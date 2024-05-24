const Database = require("../db/database")
const db = new Database(__dirname + "/../db/files/servers.json");
const {EmbedBuilder} = require("discord.js")
const ConsoleLogger = require("./console")
const logger = ConsoleLogger.getInstance();

class BotLogs {
    constructor() {
        if (!BotLogs.instance) {
            this.guilds = {};
            BotLogs.instance = this
        }
        return BotLogs.instance
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new BotLogs()
        }
        return this.instance
    }

    /**
     * load guilds from db to cache to log messages without db
     * @returns {bool}
     */
    LoadGuilds() {
        //for each guild in db load all commands using

        const data = db.getAllKeys()
        if (!data) return;

        data.forEach(key => {
            const botLogs_channel = db.read(`${key}.botLogs`)
            if (!botLogs_channel) return;

            if (!botLogs_channel ||!botLogs_channel.status || botLogs_channel.status != true) return;

            const channel_id = botLogs_channel.channel

            this.guilds[key] = channel_id
        })

        logger.log("All Bot logs Guild Loaded")
        return true
    }

    /**
    * add guild to cache without reolading all guilds
    * @param {*} guild_id 
    * @returns {bool} true
    */
    AddGuild(guild_id, channel_id) {
        this.guilds[guild_id] = channel_id
        return true
    }

    /**
     * 1. get channel id from cache
     * 2. send message
     * @param {string} guild_id 
     * @param {string} message
     * @returns {bool}
     */
    SendLog(guild_id, message) {
        const { client } = require("../main")
        // client.guilds.cache.get(guild_id)
        if (!this.guilds[guild_id]) return;
        const channel_id = this.guilds[guild_id]
        const channel = client.channels.cache.get(channel_id)
        if (!channel || !channel_id) return false;

        const embed = new EmbedBuilder()
            .setTitle("Bot Logs")
            .setColor("Yellow")
            .setDescription(message)

        channel.send({ embeds: [embed] })
        return true
    }
}

module.exports = BotLogs