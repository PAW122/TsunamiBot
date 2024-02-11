const express = require("express");
const app = express();

const { client } = require("../main")

app.get('/', (request, response) => {
    return response.send({ status: "ok" })
});

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

                    console.log(guildsResponse)
                    return res.json(guildsResponse)

                })
                .catch(console.error);
        })
        .catch(console.error);

})

module.exports = app;