const fetch = require('node-fetch');

class Auth {
    constructor() {
        if (!Auth.instance) {
            this.cache = {};
            Auth.instance = this;
        }
    }

    static getInstance() {
        if (!this.instance) {
          this.instance = new Auth();
        }
    
        return this.instance;
    }

    async verification(tokenType, token, server_id) {
        const cacheKey = `${token}_${server_id}`;

        if (this.cache[cacheKey]) {
            return this.cache[cacheKey];
        }

        try {
            const userResponse = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${tokenType} ${token}`,
                },
            });
            if (!userResponse.ok) {
                throw new Error(`User request failed with status ${userResponse.status}`);
            }
            const userData = await userResponse.json();
            const { id } = userData;

            const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
                headers: {
                    authorization: `${tokenType} ${token}`,
                },
            });
            if (!guildsResponse.ok) {
                throw new Error(`Guilds request failed with status ${guildsResponse.status}`);
            }
            const guildsData = await guildsResponse.json();

            const verified_servers = guildsData.some(guild => guild.id === server_id);
            this.cache[cacheKey] = verified_servers;

            return verified_servers;
        } catch (error) {
            console.error('An error occurred during authentication:', error);
            return false;
        }
    }
}

module.exports = Auth;
