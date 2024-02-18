const fetch = require('node-fetch');
const { PermissionsBitField } = require('discord.js');

class Auth {
    constructor() {
        if(!Auth.instance) {
            this.cache = {};
            this.requests = {};
            Auth.instance = this;
        }
    }

    static getInstance() {
        if(!this.instance) {
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
        if(this.cache[cacheKey]) {
           return true
        }

        try{
            const user_data = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${tokenType} ${token}`
                }
            })

            if(!user_data.ok) {
                console.log("ratelimit")
                return false;
            }

            //Dane użytkownika
            const userData = await user_data.json();
            const {id} = userData;

            const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
                headers: {
                    authorization: `${tokenType} ${token}`,
                },
            })

            if(!guildsResponse.ok) {
                console.log("ratelimit")
                return false;
            }
            //Serwery użytkownika
            const guildsData = await guildsResponse.json();

            const {client} = require("../../main")

            let botGuilds = client.guilds.cache.map(guild => guild.id);//serwery bota
            let userGuilds = guildsData.map(guild => guild.id);//serwery usera
            let sharedGuilds = userGuilds.filter(guildId => botGuilds.includes(guildId));//wspólne serwery
            let guildsWithAdminPermission = [];

            sharedGuilds.forEach(guildId => {//dla każdego wspulnego serwera
                let guild = client.guilds.cache.get(guildId);//dane serwera
                let member = guild.members.cache.get(id);//dane usera w danym serweże
                if(this.has_permisions(member) || guild.ownerId == id) {
                    guildsWithAdminPermission.push(guildId);
                }
            });
            this.get_data()
            // console.log(guildsWithAdminPermission)
            // console.log(server_id)
            this.cache[cacheKey] = guildsWithAdminPermission;
            if(guildsWithAdminPermission.includes(`${server_id}`)) {
                return true
            } else {
                return false;
            }
        } catch(error) {
            console.error(error)
            return false;
        }
    }

    has_permisions(member) {
        return member.permissions.has(PermissionsBitField.Flags.Administrator)
    }

    get_data() {
        console.log(this.cache)
    }
}

module.exports = Auth