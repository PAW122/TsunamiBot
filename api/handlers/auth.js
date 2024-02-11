function auth(tokenType, token, server_id) {
    return fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${tokenType} ${token}`,
        },
    })
    .then(result => result.json())
    .then(response => {
        const { username, discriminator, avatar, id } = response;

        if(!id) {
            return false;
        }

        return fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                authorization: `${tokenType} ${token}`,
            },
        })
        .then(guildsResult => {
            if (!guildsResult.ok) {
                throw new Error(`HTTP error! Status: ${guildsResult.status}`);
            }

            return guildsResult.json();
        })
        .then(guildsResponse => {
            let { client } = require("../../main");

            let botGuilds = client.guilds.cache.map(guild => guild.id);
            let userGuilds = guildsResponse.map(guild => guild.id);
            let updatedUserGuilds = userGuilds.filter(guildId => botGuilds.includes(guildId));
            let guildsWithAdminPermission = [];
            updatedUserGuilds.forEach(guildId => {
                let guild = client.guilds.cache.get(guildId);
                let member = guild.members.cache.get(id);
                if (member.permissions.has("ADMINISTRATOR") || guild.ownerId === id) {
                    guildsWithAdminPermission.push(guildId);
                }
            });
            guildsResponse = guildsResponse.filter(guild => guildsWithAdminPermission.includes(guild.id));

            const verified_servers = guildsResponse.some(guild => guild.id === server_id);
            return verified_servers;
        });
    });
}

module.exports = auth;
