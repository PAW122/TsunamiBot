const Database = require("../db/database");
const database = new Database(__dirname + "/../db/files/servers.json");

class InviteTracker {

    async userJoin(member, client) {
        let invites = {}

        client.guilds.cache.forEach(async guild => {
            const guildInvites = await guild.invites.fetch();
            invites[guild.id] = new Map(guildInvites.map(invite => [invite.code, invite.uses]));
        });

        // Pobierz aktualne zaproszenia
        const newInvites = await member.guild.invites.fetch();

        // Konwersja kolekcji na tablicę
        const newInvitesArray = [...newInvites.values()];

        // Upewnij się, że invites dla danej gildii jest zainicjalizowane
        if (!invites[member.guild.id]) {
            invites[member.guild.id] = new Map();
        }

        // Sprawdź, które zaproszenie zostało użyte
        const usedInvite = newInvitesArray.find(invite => invite.uses > (invites[member.guild.id].get(invite.code) || 0));

        // Zaktualizuj zaproszenia
        invites[member.guild.id] = new Map(newInvites.map(invite => [invite.code, invite.uses]));

        database.init()
        const data = await database.read(`${member.guild.id}.invite_tracker`)
        if(!data || !data.status || !data.channel_id) return;

        const channel_id = data.channel_id
        const channel = client.channels.cache.get(channel_id)

        if(!channel) return

        if(usedInvite) {
            channel.send(`User <@${member.user.id}> joined using invite created by ***${usedInvite.inviter.tag}***`)
        } else {
            channel.send(`User <@${member.user.tag}> joined via unknown means`)
        }
    }

    // /**
    //  * tracks how many users joined on server using that invite
    //  * (każdy user może być liczony tylko raz jako nowo dołączająca osoba)
    //  * @param {*} guild_id 
    //  * @param {*} invite 
    //  * @param {*} user_id 
    //  */
    // addInviteUsage(guild_id, invite, user_id) {

    // }

    // /**
    //  * load all existing invites from server
    //  */
    // loadInvitesFromServer(guild_id) {
    //     const { client } = require("../main")
    //     const created_by = null
    //     const invite = null
    // }

    // newInvite(guild_id, created_by, invite) {
    //     const invite_id = invite.id
    //     const data = {
    //         created_by: created_by,//zamienić na user id
    //         invite_id: invite_id,
    //         users_joined: 0,
    //         users_list: []//lista id użytkowników którzy użyli tego zaproszenia
    //     }
    //     database.write(`${guild_id}.invites.${invite_id}`, data)
    // }

    // deleteInvite(guild_id, invite) {

    // }
}

module.exports = InviteTracker