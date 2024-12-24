const Database = require("../db/database")
const db = new Database(process.cwd() + "/db/files/servers.json")


async function addRatingEmoji(client, reaction, user) {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
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
    const data = await db.read(`${guildId}.pending_tickets.${channelId}.${messageId}`);
    if (!data) return;

    if (data.status === true) {
        // console.log("Dodawanie roli użytkownikowi:");
        // console.log(element.role_id);

        try {
            const data = await db.read(`${guildId}.pending_tickets.${channelId}.${messageId}`);
            if (!data) return;
            const guild = client.guilds.cache.get(guildId); // Pobranie serwera

            const member = guild ? await guild.members.fetch(userId) : null; // Pobranie członka serwera, jeśli istnieje
            if (!member) {
                return;
            }

            //get channel name
            const channel = client.channels.cache.get(channelId);
            const channelName = channel.name;
            // sprawdz czy channelName zaczyna się od "ticket-"
            if (channelName.startsWith('ticket-')) {
                // usuń ticket- z nazwy kanału
                const ticketAuthorId = channelName.slice(7);
                // sprawdz czy osoba zostawiajaca reakcje to autor ticketu
                if (userId !== ticketAuthorId) return;
            }

            // odczytaj jaką emoji zostawil user
            const emojiName = emoji.name;

            let rating = null;
            let i = 0;

            data.ticket_opinion.emoji_list.forEach(element => {
                if (element === emojiName) {
                    rating = i;
                } else {
                    i++;
                }
            });

            if (rating === null || rating > 4 || rating < 0) {
                console.log("rating error")
                console.log(rating)
                return;
            }

            // change scale from 0-4 to 1-5
            rating += 1;

            const now = new Date();
            now.setHours(0, 1, 0, 0);
            const todayDateTimestamp = now.getTime();

            const close_time = new Date();

            const save_data = {
                channelId: channelId,
                messageId: messageId,
                userId: userId,
                rating: rating,
                close_time: close_time
            }

            await db.addToList(`${guildId}.closed_tickets.${todayDateTimestamp}`, save_data);
            await db.write(`${guildId}.pending_tickets.${channelId}.${messageId}.status`, false);

            // save user option & move to ticket closed_tikcets_category
            // & remove user permisions to see channel
            channel.permissionOverwrites.edit(userId, {
                ViewChannel: false
            });
            
            // move channel to closed_tickets_category
            const settings = await db.read(`${guildId}.ticket_settings`)
            if(!settings) return;
            if(settings.delete_on_close) {
                channel.delete();
            } else {
                const closed_tickets_category = client.channels.cache.get(settings.closed_tickets_category_id);
                if(!closed_tickets_category) return;
                channel.setParent(closed_tickets_category);
            }

            // & set status to false on pending_tickets db

            // console.log(`Rola ${element.role_id} została dodana użytkownikowi ${member.user.tag}.`);
        } catch (err) {
            console.error('Błąd podczas dodawania roli - ticket_ratings_emoji_handler:', err);
        }
    }


}

module.exports = { addRatingEmoji }