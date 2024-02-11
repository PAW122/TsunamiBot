const express = require("express");
const app = express();

const { client } = require("../main")

//web
app.get('/', (request, response) => {
    return response.sendFile(process.cwd() + '/web2/views/index.html');
});

app.get('/main.js', (request, response) => {
    return response.sendFile(process.cwd()  + '/web2/scripts/main.js');
});

/**
 * /load/server-list/:token_type/:token
 * @param :token_type
 * @param token
 * @return {json} list of user servers
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
            const { username, discriminator, avatar, id } = response;
            // Fetch user's guilds (servers)
            fetch('https://discord.com/api/users/@me/guilds', {
                headers: {
                    authorization: `${tokenType} ${token}`,
                },
            })
                .then(guildsResult => {
                    if (!guildsResult.ok) {
                        throw new Error(`HTTP error! Status: ${guildsResult.status}`);
                    }
                    //sprawdź na jakich serwerach jest bot.},
                    

                    return guildsResult.json();
                })
                .then(guildsResponse => {

                    return res.json(guildsResponse)

                })
                .catch(console.error);
        })
        .catch(console.error);
})

module.exports = app;