const express = require("express");
const app = express();

//web
app.get('/', (request, response) => {
    return response.sendFile(process.cwd() + '/web2/views/index.html');
});

app.get('/main.js', (request, response) => {
    return response.sendFile(process.cwd() + '/web2/scripts/main.js');
});

/**
 * /load/server-list/:token_type/:token
 * @param :token_type
 * @param token
 * @return {json} .servers -> list of user servers + .user -> user data
 */
app.get("/load/server-list/:token_type/:token", (req, res) => {
    const tokenType = req.params.token_type
    const token = req.params.token

    fetch('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${tokenType} ${token}`,
        },
    })
        .then(result => result.json())
        .then(response => {
            const { client } = require("../main")
            const { username, discriminator, avatar, id } = response;
            // Fetch user's guilds (servers)
            fetch('https://discord.com/api/users/@me/guilds', {
                headers: {
                    authorization: `${tokenType} ${token}`,
                },
            })
                .then(guildsResult => {
                    console.log(tokenType, token, guildsResult)
                    if (!guildsResult.ok) {
                        throw new Error(`HTTP error! Status: ${guildsResult.status}`);
                    }
                    //sprawdź na jakich serwerach jest bot.},


                    return guildsResult.json();
                })
                .then(guildsResponse => {

                    let botGuilds = client.guilds.cache.map(guild => guild.id);
                    let userGuilds = guildsResponse.map(guild => guild.id);
                    let updatedUserGuilds = userGuilds.filter(guildId => botGuilds.includes(guildId));
                    guildsResponse = guildsResponse.filter(guild => updatedUserGuilds.includes(guild.id));

                    // Zwrócenie danych
                    return res.json({
                        servers: guildsResponse,
                        user: {
                            username: username,
                            discriminator: discriminator,
                            avatar: avatar,
                            id: id
                        }
                    });

                })
                .catch(console.error);
        })
        .catch(console.error);
})

module.exports = app;