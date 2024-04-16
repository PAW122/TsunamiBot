const fetch = require('node-fetch');
const { PermissionsBitField } = require('discord.js');

const _config = require("../../config.json")
const using = _config.using
const admin_list = _config[using].admin_list

class AuthV2 {
    constructor() {
        if (!AuthV2.instance) {
            this.cache = {};
            AuthV2.instance = this;
        }
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new AuthV2();
        }
        return this.instance;
    }

    save_data(data) {
        Object.assign(this.cache, data);
    }


    is_data(key) {
        return this.cache.hasOwnProperty(key) ? this.cache[key] : false;
    }


    remove_data(key) {
        if (this.cache.hasOwnProperty(key)) {
            delete this.cache[key];
        }
    }


    async admin_verification(tokenType, token) {
        let user = this.is_data(token + tokenType)
        if (!user) {
            //jeżeli nie uda się zalogować to wywal error
            //zwykłe login wykonuje 1 usles req do restapi!
            user = await this.login(tokenType, token)
        }

        if (!user) return false;
        //console.log(user)
        const id = user.id

        if (admin_list.includes(id)) {
            return true;
        } else {
            return false;
        }

    }

    async verification(tokenType, token, server_id) {
        const { client } = require("../../main")
        let user = this.is_data(token + tokenType)
        if (!user) {
            //jeżeli nie uda się zalogować to wywal error
            user = await this.login(tokenType, token)
        }

        if (!user) return false;
        //console.log(user)
        const id = user.id

        //veryfy guilds
        const sharedGuilds = user.guilds
        let guildsWithAdminPermission = [];

        //console.log(sharedGuilds)

        sharedGuilds.forEach(guildId => {//dla każdego wspulnego serwera
            let guild = client.guilds.cache.get(guildId);//dane serwera
            let member = guild.members.cache.get(id);//dane usera w danym serweże
            if (this.has_permisions(member) || guild.ownerId == id) {
                guildsWithAdminPermission.push(guildId);
            }
        });

        if (guildsWithAdminPermission.includes(`${server_id}`)) {
            return true
        } else {
            return false;
        }
    }

    /**
     * RUN after user log in
     * @param {*} tokenType 
     * @param {*} token 
     */
    async login(tokenType, token) {
        try {
            const user_data = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${tokenType} ${token}`
                }
            })

            if (!user_data.ok) {
                return false;
            }

            const userData = await user_data.json();
            const { id } = userData;

            const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
                headers: {
                    authorization: `${tokenType} ${token}`,
                },
            })

            if (!guildsResponse.ok) {
                console.log("AUTHV2 ratelimit")
                return false;
            }

            //Serwery użytkownika
            const guildsData = await guildsResponse.json();

            const { client } = require("../../main")

            let botGuilds = client.guilds.cache.map(guild => guild.id);//serwery bota
            let userGuilds = guildsData.map(guild => guild.id);//serwery usera
            let sharedGuilds = userGuilds.filter(guildId => botGuilds.includes(guildId));//wspólne serwery

            let cache_data = {
                [token + tokenType]: {
                    id: id,
                    ip: "",
                    last_login_timesamp: "",
                    guilds: sharedGuilds
                }
            }

            this.save_data(cache_data)
            return cache_data[token + tokenType];
        } catch (err) {
            console.log(err)
        }
    }

    async logout(tokenType, token) {
        this.remove_data(token + tokenType)
    }

    has_permisions(member) {
        if (member && member.permissions) {
            return member.permissions.has(PermissionsBitField.Flags.Administrator);
        } else {
            return false;
        }
    }
}

//old AUTH class
//to remove
class Auth {
    constructor() {
        if (!Auth.instance) {
            this.cache = {};
            this.requests = {};
            Auth.instance = this;
        }
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Auth();
        }

        return this.instance;
    }

    /**
     * jeżeli user jest adminem na danym server_id to return true
     * else return false
     * @param {*} tokenType 
     * @param {*} token 
     * @param {*} server_id 
     * @returns 
     */
    async verification(tokenType, token, server_id) {
        const cacheKey = `${token}_${server_id}`

        //todo system wygasania kluczy po 24h
        if (this.cache[cacheKey]) {
            return true
        }

        try {
            const user_data = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${tokenType} ${token}`
                }
            })

            if (!user_data.ok) {
                console.log("ratelimit")
                return false;
            }

            //Dane użytkownika
            const userData = await user_data.json();
            const { id } = userData;

            const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
                headers: {
                    authorization: `${tokenType} ${token}`,
                },
            })

            if (!guildsResponse.ok) {
                console.log("ratelimit")
                return false;
            }
            //Serwery użytkownika
            const guildsData = await guildsResponse.json();

            const { client } = require("../../main")

            let botGuilds = client.guilds.cache.map(guild => guild.id);//serwery bota
            let userGuilds = guildsData.map(guild => guild.id);//serwery usera
            let sharedGuilds = userGuilds.filter(guildId => botGuilds.includes(guildId));//wspólne serwery
            let guildsWithAdminPermission = [];

            sharedGuilds.forEach(guildId => {//dla każdego wspulnego serwera
                let guild = client.guilds.cache.get(guildId);//dane serwera
                let member = guild.members.cache.get(id);//dane usera w danym serweże
                if (this.has_permisions(member) || guild.ownerId == id) {
                    guildsWithAdminPermission.push(guildId);
                }
            });

            this.cache[cacheKey] = guildsWithAdminPermission;
            if (guildsWithAdminPermission.includes(`${server_id}`)) {
                return true
            } else {
                return false;
            }
        } catch (error) {
            console.error(error)
            return false;
        }
    }

    has_permisions(member) {
        if (member && member.permissions) {
            return member.permissions.has(PermissionsBitField.Flags.Administrator);
        } else {
            return false;
        }
    }

    get_data() {
        console.log(this.cache)
    }
}

module.exports = { Auth, AuthV2 }