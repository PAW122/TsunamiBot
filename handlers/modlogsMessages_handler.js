
const ConsoleLogger = require("./console")
const logger = ConsoleLogger.getInstance();

const Database = require("../db/database")
const db = new Database(__dirname + "/../db/files/servers.json");

const {EmbedBuilder} = require("discord.js")

class LoadModLogsGuilds {
    constructor() {
        if (!LoadModLogsGuilds.instance) {
            this.guilds = {};
            LoadModLogsGuilds.instance = this
        }
        return LoadModLogsGuilds.instance
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new LoadModLogsGuilds()
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
            const guild_mod_logs_channel = db.read(`${key}.modLogsMessages`)
            if (!guild_mod_logs_channel) return;
            
            if(!guild_mod_logs_channel || guild_mod_logs_channel.status != true) return;

            const channel_id = guild_mod_logs_channel.channel_id

            this.guilds[key] = channel_id
        })

        logger.log("All mod logs Guild Loaded")
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

    RemoveGuild(guild_id) {
        delete this.guilds[guild_id]
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
        const {client} = require("../main")
        // client.guilds.cache.get(guild_id)
        if(!this.guilds[guild_id]) return;
        const channel_id = this.guilds[guild_id]
        const channel = client.channels.cache.get(channel_id)
        if(!channel || !channel_id) return false;

        const embed = new EmbedBuilder()
            .setTitle("Mod Logs")
            .setColor("Red")
            .setDescription(message)

        try {
            channel.send({embeds: [embed]})
        } catch (err) {
            console.log("modlogsMessages_handler.js:89 $ " + err)
        }
        return true
    }
}

module.exports = LoadModLogsGuilds