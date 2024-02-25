/**
 * dodać system cache:
 * zamienić całość na kalsę,
 * po odpaleniu przelecieć przez wszystkie serwerery i wczytać który ma włączone,
 * funkcja ebzpośrednio dodające server_id do cache
 * funkcje bezpośrednio usówjąca z cache,
 * obie podłączyć pod endpoint z save i w zależności od zmniennej na bieżącoi zmieniać aby nie wczytywać danych z db
 */

const Database = require("../db/database")
const db = new Database(__dirname + "/../db/files/servers.json")

async function dad_handler(client, message) {

    const server_id = message.guild.id
    const channel_id = message.channel.id

    db.init()
    const enable = await db.read(`${server_id}.dad_channel_enable`)
    if (!enable) return;
    const channel_ = await db.read(`${server_id}.dad_channel_id`)
    // if(!channel_) return;

    if (channel_id == channel_) {
        return console.log("dat channel triger" + channel_)
    }



    const dad_message = message.content.toLowerCase().replace("i'm ", "im ").replace("i’m ", "im ");
    if (dad_message.includes("im ")) {
        const dadMessageIndex = dad_message.indexOf("im ");
        const dadMessage = dad_message.substring(dadMessageIndex + 3);
        await message.channel.send(`Hi ${dadMessage}, I'm dad!`);
    }



    //if args have I'am
    //następny argument = nick
    //reply hello <nick> iam dad
}

module.exports = dad_handler;