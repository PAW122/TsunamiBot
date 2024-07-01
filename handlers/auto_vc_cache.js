const Database = require("../db/database")
const db = new Database(__dirname + "/../db/files/servers.json")
class auto_vc_cache {
    constructor() {
        this.cache = []
        this.admins = []
        this.actions = []
    }

    get() {
        return this.cache
    }

    // NEW COMMANDS

    // keep track of created channels in db
    // if bot server went down after restart bot isn't going to deelete
    // auto vc channels created before restart

    // load data from db
    // exec on bot startup
    load_data() {
        const data = db.read()
        
    }

    // save data to db
    save_data(guild_id, channel_id) {
        db.write()
    }

    // get all server's auto vc's data, remove deleted channel, save
    delete_data() {

    }

    // END == NEW COMMANDS

    set_action(channel_id, action) {
        this.actions[channel_id] = {
            moving: action.moving
        }
    }

    // track channels
    add(channel_id) {
        this.cache[channel_id] = true
    }

    is_exist(channel_id) {
        if (this.cache[channel_id]) {
            return true
        } else {
            return false
        }
    }

    remove(channel_id) {
        delete this.cache[channel_id];
        delete this.actions[channel_id];
        //delete every user with rights to channel.
    }

    // channel admin
    add_admin(user_id, channel_id) {
        this.admins[user_id] = channel_id
    }

    remove_admin(user_id, channel_id) {
        if(this.admins[user_id] === channel_id) {
            delete this.admins[user_id]
            return true
        }
        return false
    }

    is_admin(channel_id, user_id) {
        if(this.admins[user_id] === channel_id){
            return true
        } else {
            return false
        }
    }

    len() {
        return this.cache.length
    }
}

module.exports = auto_vc_cache