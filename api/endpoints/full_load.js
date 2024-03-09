const express = require('express');
const router = express.Router();
router.use(express.json());
const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/servers.json")

const Auth = require("../handlers/auth")
const auth = Auth.getInstance();

const ConsoleLogger = require("../../handlers/console")
const logger = ConsoleLogger.getInstance();

const checkServerExists = require("../handlers/checkServerExists")

//main load router
router.post("/content", async (req, res) => {

    if(!req.body) {
        return res.status(400).json({error: "No data provided"})
    }
    const tokenType = req.body.tokenType
    const token = req.body.token
    const server_id = req.body.server_id

    let { client } = require("../../main");
    if(!client) {
        console.error("Client is undefind")
        return res.status(401).json({error: "client is offline"})
    }

    if(!tokenType || !token || !server_id) {
        return res.status(400).json({error: "one or more body argument is undefined"})
    }

    const is_auth = await auth.verification(tokenType, token, server_id)
    if(!is_auth) {
        return res.status(400).json({error: "Not auth"})
    }

    const is_server = await checkServerExists(server_id)
    if(!is_server) {
        return res.status(400).json({error: "server_id is invalid"})
    }

    db.init();
    const data = await db.read(`${server_id}`);

    //var
    const server = client.guilds.cache.get(server_id);//dont send
    let welcome_message_content = "N/A"
    let welcome_message_enable = "N/A"
    let welcome_message_channel = "N/A"
    let autorole_enable = "N/A"
    let autorole_role = "N/A"
    let dad_responses_enable = "N/A"
    
    //load data if server is in DB
    //else database.data = "N/A"
    if(data) {
        welcome_message_content =  data.welcome_dm_message
        welcome_message_enable = data.welcome_status
    
        const channel_name = client.channels.cache.get(data.welcome_channel)//dont send
        welcome_message_channel = {
            id: data.welcome_channel,
            name: channel_name.name
        }

        autorole_enable =  data.autorole.status ?? false

        const roleId = data.autorole.role_id;//dont send
        const role = server.roles.cache.get(roleId);//dont send
        autorole_role = {
            id: role.id,
            name: role.name
        };

        dad_responses_enable = data.dad_channel_enable ?? false
        dad_bot = {
            enable: dad_responses_enable,
            channel_id: false,//to do opcja globalna / 1 kanał
            // value: true -> all channels
            // value <id> -> one channel
            // value undefined -> disables
            select: {

            }
        }
    }

    //load data from client
    const channels = server.channels.cache;//dont send
    const server_channels_list = channels.map(channel => ({
        id: channel.id,
        name: channel.name
    }));

    const roles = server.roles.cache;//dont send
    const server_roles_list = roles.map(role => ({
        id: role.id,
        name: role.name
    }));

    const response_data = {
        welcome_message_content: welcome_message_content,
        welcome_message_enable: welcome_message_enable,
        welcome_message_channel: welcome_message_channel,
        server_channels_list: server_channels_list,
        autorole_enable: autorole_enable,
        autorole_role: autorole_role,
        server_roles_list: server_roles_list,
        dad_bot: dad_bot
    }

    return res.json(response_data);
})

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
                .catch(logger.error);
        })
        .catch(logger.error);
});

module.exports = router;