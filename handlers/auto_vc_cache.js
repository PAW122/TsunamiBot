class auto_vc_cache {
    constructor() {
        this.cache = []
        this.admins = []
        this.actions = []
    }

    get() {
        return this.cache
    }

    // async actions tracking

    /*
    action = {
        moving: bool

    }
    */

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