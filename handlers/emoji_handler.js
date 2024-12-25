const Database = require("../db/database")
const db = new Database(process.cwd() + "/db/files/servers.json")

/*
    TODO:
    jezeli user zareaguje na wiadomość ktora nie istnieje,
    usunac wpis z db aby nie marnowac czasu na sprawdzanie wiadomosci
*/

async function addEmoji(client, reaction, user) {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Nie udało się pobrać wiadomości:', error);
            return;
        }
    }

    // Wyciągnięcie informacji
    const guildId = reaction.message.guild?.id || 'Brak serwera'; // Jeśli to wiadomość prywatna
    const channelId = reaction.message.channel.id;
    const messageId = reaction.message.id;
    const userId = user.id;
    const emoji = reaction.emoji;

    if (!guildId || !channelId || !messageId || !userId || !emoji) {
        return //console.log("emoji_handler error - no data")
    }

    // db actions
    db.init()
    const data = await db.read(`${guildId}.reaction_role.${channelId}.${messageId}`);
    if (!data) return;

    for (const element of data) {
        if (element.emoji === emoji.name && element.status === true) {
            // console.log("Dodawanie roli użytkownikowi:");
            // console.log(element.role_id);

            try {
                const guild = client.guilds.cache.get(guildId); // Pobranie serwera
                const member = guild ? await guild.members.fetch(userId) : null; // Pobranie członka serwera, jeśli istnieje
                if (!member) {
                    console.error('Nie znaleziono członka na serwerze.');
                    continue;
                }

                // Próba dodania roli
                await member.roles.add(element.role_id);
                // console.log(`Rola ${element.role_id} została dodana użytkownikowi ${member.user.tag}.`);
            } catch (err) {
                console.error('Błąd podczas dodawania roli - emoji_handler:', err);

                if (err.message.includes('Missing Permissions')) {
                    try {
                        // Pobranie kanału na podstawie client.channels
                        const channel = client.channels.cache.get(channelId); // Pobranie kanału
                        if (channel && channel.isTextBased()) {
                            await channel.send(
                                `Your bot on server "${guild.name}" does not have sufficient permissions to add role: ${element.role_id}. Please make sure the bot has "Manage Roles" permissions.`
                            );
                        } else {
                            console.error('Nie znaleziono kanału lub kanał nie obsługuje wiadomości tekstowych.');
                        }
                    } catch (channelErr) {
                        console.error('Nie udało się wysłać wiadomości na kanał:', channelErr);
                    }
                }
            }
        }
    }

}

async function removeEmoji(client, reaction, user) {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Nie udało się pobrać wiadomości:', error);
            return;
        }
    }

    // Wyciągnięcie informacji
    const guildId = reaction.message.guild?.id || 'Brak serwera'; // Jeśli to wiadomość prywatna
    const channelId = reaction.message.channel.id;
    const messageId = reaction.message.id;
    const userId = user.id;
    const emoji = reaction.emoji;

    // db actions
    db.init()
    const data = await db.read(`${guildId}.reaction_role.${channelId}.${messageId}`);
    if (!data) return;

    for (const element of data) {
        if (element.emoji === emoji.name && element.status === true) {

            try {
                const guild = client.guilds.cache.get(guildId); // Pobranie serwera
                const member = guild ? await guild.members.fetch(userId) : null; // Pobranie członka serwera, jeśli istnieje
                if (!member) {
                    console.error('Nie znaleziono członka na serwerze.');
                    continue;
                }

                // Próba zabrania roli
                await member.roles.remove(element.role_id);
                //console.log(`Rola ${element.role_id} została usunięta użytkownikowi ${member.user.tag}.`);
            } catch (err) {
                console.error('Błąd podczas usuwania roli - emoji_handler:', err);

                if (err.message.includes('Missing Permissions')) {
                    try {
                        // Pobranie kanału na podstawie client.channels
                        const channel = client.channels.cache.get(channelId); // Pobranie kanału
                        if (channel && channel.isTextBased()) {
                            await channel.send(
                                `Your bot on server "${guild.name}" does not have sufficient permissions to add role: ${element.role_id}. Please make sure the bot has "Manage Roles" permissions.".`
                            );
                        } else {
                            console.error('Nie znaleziono kanału lub kanał nie obsługuje wiadomości tekstowych.');
                        }
                    } catch (channelErr) {
                        console.error('Nie udało się wysłać wiadomości na kanał:', channelErr);
                    }
                }
            }
        }
    }

}

module.exports = { addEmoji, removeEmoji }