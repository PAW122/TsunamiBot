const express = require('express');
const router = express.Router();

const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/servers.json")

const Auth = require("../handlers/auth")
const auth = Auth.getInstance();

const checkServerExists = require("../handlers/checkServerExists")

/**
 * @param tokenType
 * @param token
 * @param server_id
 * @return {json, Bool} welcome messages enable / disable
 */
router.get("/server-settings/welcome_status/:tokenType/:token/:server_id", async (req, res) => {

    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    const is_auth = await auth.verification(tokenType, token, server_id)
    console.log(is_auth)
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    db.init();
    const data = await await db.read(`${server_id}`);
    //dodać checki czy data instnieje
    if(!data) {
        return res.json({error: "no data"})
    }
    const to_send = data.welcome_status ?? "data not found";
    return res.json(to_send);

})

/**
 * @param tokenType
 * @param token
 * @param server_id
 * @return {json} welcome messages {id: channel_id, name: channel_name}
 */
router.get("/server-settings/welcome_channel/:tokenType/:token/:server_id", async (req, res) => {
    let { client } = require("../../main");
    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }

    db.init();
    const data = await db.read(`${server_id}`);
    if(!data) {
        return res.json({error: "no data"})
    }
    //dodać checki czy data instnieje
    const channel_name = client.channels.cache.get(data.welcome_channel) ?? "data not found";;
    const json = {
        id: data.welcome_channel,
        name: channel_name.name
    }

    return res.json(json);

})

/**
 * @param tokenType
 * @param token
 * @param server_id
 * @return {json} server cahnnel list {channel_id: id, channel_name: name}...
 */
router.get("/server-channels-list/:tokenType/:token/:server_id", async (req, res) => {
    let { client } = require("../../main");
    const tokenType = req.params.tokenType
    const token = req.params.token
    const serverId = req.params.server_id;
    const is_auth = await auth.verification(tokenType, token, serverId)
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(serverId)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }
    // Pobierz serwer na podstawie jego identyfikatora
    const server = client.guilds.cache.get(serverId);

    if (!server) {
        return res.status(404).json({ error: "Server not found" });
    }

    // Pobierz wszystkie kanały na serwerze
    const channels = server.channels.cache;

    // Zbuduj listę kanałów
    const channelList = channels.map(channel => ({
        id: channel.id,
        name: channel.name
    }));

    // Zwróć listę kanałów w odpowiedzi
    return res.json(channelList);
});


/**
 * @param tokenType
 * @param token
 * @param server_id
 * @return {json, Bool} autorole status enable / disable
 */
router.get("/server-settings/autorole/:tokenType/:token/:server_id", async (req, res) => {

    const tokenType = req.params.tokenType
    const token = req.params.token
    const server_id = req.params.server_id
    const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }
    db.init();
    const data = await db.read(`${server_id}`);
    if(!data) {
        return res.json({error: "no data"})
    }
    const to_send = data.autorole.status ?? false;

    return res.json(to_send);
})

/**
 * @param tokenType
 * @param token
 * @param server_id
 * @return {json} autorole: {role_id, role_name} 
 */
router.get("/server-settings/get_autorole_role/:tokenType/:token/:server_id", async (req, res) => {

    let { client } = require("../../main");
    const server_id = req.params.server_id;
    const tokenType = req.params.tokenType
    const token = req.params.token
    const is_auth = await auth.verification(tokenType, token, server_id)
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(server_id)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }
    db.init();
    const data = await db.read(`${server_id}`);

    // Sprawdź, czy dane dotyczące roli autora są dostępne
    if (!data || !data.autorole || !data.autorole.role_id) {
        return res.status(404).json({ error: "Nie znaleziono danych roli autora dla podanego serwera." });
    }

    const roleId = data.autorole.role_id;

    // Pobierz serwer na podstawie jego identyfikatora
    const server = client.guilds.cache.get(server_id);

    if (!server) {
        return res.status(404).json({ error: "Nie znaleziono serwera o podanym identyfikatorze." });
    }

    // Pobierz rolę na podstawie jej identyfikatora
    const role = server.roles.cache.get(roleId);

    if (!role) {
        return res.status(404).json({ error: "Nie znaleziono roli o podanym identyfikatorze." });
    }

    // Utwórz obiekt JSON z identyfikatorem i nazwą roli
    const json = {
        id: role.id,
        name: role.name
    };

    // Zwróć nazwę roli w odpowiedzi
    return res.json(json);
});


/**
 * @param tokenType
 * @param token
 * @param server_id
 * @return {json} server roles list {role_id, role_name}
 */
router.get("/server-roles-list/:tokenType/:token/:server_id", async (req, res) => {

    let { client } = require("../../main");
    const serverId = req.params.server_id;
    const tokenType = req.params.tokenType
    const token = req.params.token
    const is_auth = await auth.verification(tokenType, token, serverId)
    if (!is_auth) {
        return res.status(400).json({ error: "Not auth" })
    }

    const is_server = await checkServerExists(serverId)
    if (!is_server) {
        return res.status(400).json({ error: "server_id is invalid" })
    }
    // Pobierz serwer na podstawie jego identyfikatora
    const server = client.guilds.cache.get(serverId);

    if (!server) {
        return res.status(404).json({ error: "Nie znaleziono serwera o podanym identyfikatorze." });
    }

    // Pobierz wszystkie role na serwerze
    const roles = server.roles.cache;

    // Zbuduj listę ról
    const roleList = roles.map(role => ({
        id: role.id,
        name: role.name
    }));

    // Zwróć listę ról w odpowiedzi
    res.json(roleList);
});


/**
 * @param tokenType
 * @param token
 * @param server_id
 * @return {json} list with all user servers
 */
router.get("/server-list/:token_type/:token", (req, res) => {
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
                        if (member && (member.permissions.bitfield & BigInt(8)) === BigInt(8) || guild.ownerId === id) {
                            guildsWithAdminPermission.push(guildId);
                        }
                        
                        
                        
                    });
                    guildsResponse = guildsResponse.filter(guild => guildsWithAdminPermission.includes(guild.id));


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
});

module.exports = router;
