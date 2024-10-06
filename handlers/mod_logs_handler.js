const Database = require("../db/database");
const database_modLogs = new Database(__dirname + "/../db/files/modlogs.json")


const ConsoleLogger = require("./console")
const logger = ConsoleLogger.getInstance();

const LoadModLogsGuilds = require("./modlogsMessages_handler")
const sendLogs = LoadModLogsGuilds.getInstance(null)

/*
logika wyświetlanie wiadomości przez api
filtry: <filtrname> -> zwraca ostatnie x wiadomości z danej kategori
filtry: <brak> -> bierze ostatnie x wiadomości z każdej kategorii, i leci od najnowsze po timesamp. jeżeli wiadomośc
jest starsza niż 7d to odrzuca ją i wszystkie wiadomości znajdujące się po niej
*/

/*
kategorie
messageDelete - messageDelete
guildMemberAddRole - add role to user
guildMemberRemoveRole - remove user role
guildMemberNicknameUpdate - update nickname
guildMemberJoin - user join guild
guildBannerChange - guild baner update
guildAfkChannelAdd - add afk channel
messageContentEdited
rolePositionUpdate
rolePermissionsUpdate
userUsernameUpdate
*/


//todo
//vc join, leave, mute, unmute, disconect someone, move someone on another channel, start video stream, end
//channel name update
//channel description update
//channel delete
//channel create
//add, del emoji
//w Panelu Admina dodać opcję wyłączenia całego systemu mod_logs


/**
 * saves server logs
 * @param {*} client - discord bot client
 */
function mod_logs(client) {
    database_modLogs.init();
    function getCurrentTimestampInSeconds() {
        return Math.floor(Date.now() / 1000);
    }

    //delete message
    client.on("messageDelete", async (message) => {
        try {
            const guildId = message.guild.id
            if (!guildId) return;

            const data = {
                timesamp: getCurrentTimestampInSeconds(),
                channelId: message.channelId,
                messageId: message.id,
                createdTimestamp: message.createdTimestamp,
                content: message.content,
                author: message.author,
                pinned: message.pinned,
                tts: message.tts,
                attachments: message.attachments,
                deleted_by: null

            }//deleted by

            let logs = await message.guild.fetchAuditLogs({ type: 72 });
            let entry = logs.entries.first() ?? false;

            if (entry && entry.executor) {
                data.deleted_by = entry.executor
            }

            database_modLogs.addToList(`${guildId}.modlogs.messageDelete`, data)
            if (data.content.length > 500) return;
            sendLogs.SendLog(guildId, `***Message Deleted***\nmessage Author: **${data.author}**\nContent: **${data.content}**\nDeleted by: **${data.deleted_by}**\nChannel: <#${data.channelId}>`)
        } catch (err) {
            console.error(err)
            return
        }
    })

    // + role for user
    client.on("guildMemberUpdate", (oldMember, newMember) => {
        const guildId = newMember.guild.id;
        if (!guildId) return;

        // Sprawdzamy czy użytkownik otrzymał nową rolę
        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));

        // Jeżeli długość tablicy addedRoles jest większa niż 0, oznacza to, że użytkownik otrzymał nową rolę
        if (addedRoles.size > 0) {
            addedRoles.forEach(role => {
                const fetchedBy = newMember.guild.members.cache.find(member => member.roles.cache.has(role.id));
                const data = {
                    timesamp: getCurrentTimestampInSeconds(),
                    addedRole: role,
                    addedBy: fetchedBy,
                    addedTo: newMember
                }
                database_modLogs.addToList(`${guildId}.modlogs.guildMemberAddRole`, data)
                sendLogs.SendLog(guildId, `***guild Member Update***\n Added Role: **${data.addedRole}**\nAdded By: **${data.addedBy}**\nAdded To: **${data.addedTo}**`)
            });
        }
    });

    // - role from user
    client.on("guildMemberUpdate", (oldMember, newMember) => {
        const guildId = newMember.guild.id;
        if (!guildId) return;

        // Sprawdzamy czy użytkownik stracił jakąś rolę
        const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

        // Jeżeli długość tablicy removedRoles jest większa niż 0, oznacza to, że użytkownik stracił rolę
        if (removedRoles.size > 0) {
            removedRoles.forEach(role => {
                const removedBy = newMember.guild.members.cache.find(member => member.roles.cache.has(role.id));
                const data = {
                    timesamp: getCurrentTimestampInSeconds(),
                    removedRole: role,
                    removedBy: removedBy,
                    removedFrom: newMember
                }
                database_modLogs.addToList(`${guildId}.modlogs.guildMemberRemoveRole`, data);
                sendLogs.SendLog(guildId, `***guild Member Update***\nRemoved Role: **${data.removedRole}**\nRemoved By: **${data.removedBy}**\nRemoved From: **${data.removedFrom}**`)
            });
        }
    });

    //TODO sprawdzić działanie
    client.on("guildMemberNicknameUpdate", (member, oldNickname, newNickname) => {
        const guildId = member.guild.id;
        if (!guildId) return;

        const data = {
            timesamp: getCurrentTimestampInSeconds(),
            member: member,
            oldNickname: oldNickname,
            newNickname: newNickname
        };

        database_modLogs.addToList(`${guildId}.modlogs.guildMemberNicknameUpdate`, data);
        sendLogs.SendLog(guildId, `***Nickname Update***\nOld Nickname: **${data.oldNickname}**\nNew Nickname: **${data.newNickname}**\nMember: <@${data.member.id}>`)
    });

    client.on("guildMemberAdd", (member) => {
        const guildId = member.guild.id;
        if (!guildId) return;

        const data = {
            timesamp: getCurrentTimestampInSeconds(),
            member: member
        };

        database_modLogs.addToList(`${guildId}.modlogs.guildMemberJoin`, data);
        sendLogs.SendLog(guildId, `***guild Member Add***\n member: **<@${data.member.id}>**`)
    });

    // guild baner
    client.on("guildUpdate", (oldGuild, newGuild) => {
        const guildId = newGuild.id;
        if (!guildId) return;

        // Sprawdzamy czy banner serwera został zmieniony
        if (oldGuild.banner !== newGuild.banner) {
            const data = {
                timesamp: getCurrentTimestampInSeconds(),
                oldBanner: oldGuild.banner,
                newBanner: newGuild.banner
            };

            database_modLogs.addToList(`${guildId}.modlogs.guildBannerChange`, data);
        }
    });

    client.on("guildUpdate", (oldGuild, newGuild) => {
        const guildId = newGuild.id;
        if (!guildId) return;

        // Sprawdzamy czy kanał AFK został dodany
        if (!oldGuild.afkChannel && newGuild.afkChannel) {
            const data = {
                timesamp: getCurrentTimestampInSeconds(),
                afkChannel: newGuild.afkChannel
            };

            database_modLogs.addToList(`${guildId}.modlogs.guildAfkChannelAdd`, data);
            sendLogs.LoadGuilds(guildId, `***guild Update***\nNew Afk Channel: **<#${data.afkChannel.id}>`)
        }
    });

    client.on("messageUpdate", (oldMessage, newMessage) => {
        const guildId = newMessage.guild?.id;
        if (!guildId) return;

        const data = {
            timesamp: getCurrentTimestampInSeconds(),
            oldContent: oldMessage.content,
            newContent: newMessage.content,
            editedBy: newMessage.author
        };

        database_modLogs.addToList(`${guildId}.modlogs.messageContentEdited`, data);
        sendLogs.LoadGuilds(guildId, `***message Update***\nOld Content: **${data.oldContent}**\nNew Content: **${data.newContent}**\nEdited By: **<@${data.editedBy.id}>**`)
    });

    //guild member offline
    //guild member online
    //nie dodaje bo mogą wysyłać sporo niepotrzebnych req i danych do db

    //roleposition update
    client.on("roleUpdate", (oldRole, newRole) => {
        const guildId = newRole.guild.id;
        if (!guildId) return;

        // Pobieramy pozycję roli przed i po aktualizacji
        const oldPosition = oldRole.position;
        const newPosition = newRole.position;

        // Sprawdzamy czy pozycja roli została zmieniona
        if (oldPosition !== newPosition) {
            const data = {
                timesamp: getCurrentTimestampInSeconds(),
                oldPosition: oldPosition,
                newPosition: newPosition,
                role: newRole
            };

            database_modLogs.addToList(`${guildId}.modlogs.rolePositionUpdate`, data);
        }
    });

    //rolePermissionsUpdate
    client.on("roleUpdate", (oldRole, newRole) => {
        const guildId = newRole.guild.id;
        if (!guildId) return;

        // Sprawdzamy czy uprawnienia roli zostały zmienione
        const oldPermissions = oldRole.permissions;
        const newPermissions = newRole.permissions;

        if (oldPermissions !== newPermissions) {
            const data = {
                timesamp: getCurrentTimestampInSeconds(),
                oldPermissions: oldPermissions.toArray(),
                newPermissions: newPermissions.toArray(),
                role: newRole
            };

            database_modLogs.addToList(`${guildId}.modlogs.rolePermissionsUpdate`, data);
        }
    });

    client.on("guildMemberUpdate", (oldMember, newMember) => {
        const guildId = newMember.guild.id;
        if (!guildId) return;

        // Sprawdzamy, czy nazwa użytkownika została zmieniona
        if (oldMember.displayName !== newMember.displayName) {
            const data = {
                timesamp: getCurrentTimestampInSeconds(),
                oldUsername: oldMember.nickname,
                newUsername: newMember.nickname,
                member: newMember
            };

            database_modLogs.addToList(`${guildId}.modlogs.userUsernameUpdate`, data);
            sendLogs.SendLog(guildId, `***Username Update***\nOld Username: **${data.oldUsername}**\nNew Username: **${data.newUsername}**\nMember: <@${data.member.id}>`)
        }
    });

}

module.exports = mod_logs;