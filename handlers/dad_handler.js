/**
 * dodać system cache:
 * zamienić całość na kalsę,
 * po odpaleniu przelecieć przez wszystkie serwerery i wczytać który ma włączone,
 * funkcja ebzpośrednio dodające server_id do cache
 * funkcje bezpośrednio usówjąca z cache,
 * obie podłączyć pod endpoint z save i w zależności od zmniennej na bieżącoi zmieniać aby nie wczytywać danych z db
 */

const Database = require("../db/database")
const db = new Database(__dirname + "/../../db/files/servers.json")

async function dad_handler(client, message) {
    return //in progress
    const server_id = message.guild.id
    const channel_id = message.channel.id
    
    db.init()
    const enable = await db.read(`${server_id}.dad_channel_enable`)
    if(!enable) return;
    const channel_ = await db.read(`${server_id}.dad_channel_id`)
    if(!channel_) return;

    if(channel_id == channel_) {
        return console.log("dat channel triger" + channel_)
    }

    const args = message.split(" ");
    console.log(args)
    let i = 0;

    args.forEach(element => {
        if(element == "I'am" || element == "I am") {
            const name = args[i+1];
            message.reply(`Hello ${name} I'am dad`)
        }
        i+=1
    });

    //if args have I'am
    //następny argument = nick
    //reply hello <nick> iam dad
}

module.exports = dad_handler;