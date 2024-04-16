const Database = require("../db/database")
const db = new Database(__dirname + "/../db/files/stats.json")
/* stats.json

{
    "server_id": {
        "messages": {
            "channel_id": {
                
                    <message(json)> = 
                    {
                        author
                        timesamp
                    }
                
            }
        },
        "voice": {

        }
    }
}

*/

function getCurrentTime() {
    return Math.floor(Date.now() / 1000);
    
}

async function messages_stats_handler(message) {

    db.init();

    if (message.author.bot) return;
    const server_id = message.guild.id
    const channel_id = message.channel.id
    const timesamp = getCurrentTime();
    const author_id = message.author.id


    const data = {
        timesamp: timesamp,
        author_id: author_id
    }

    db.addToList(`${server_id}.messages.${channel_id}`, data)
    return true;

}

async function voice_stats_handler() {
    db.init();

}

//jeżeli jakieś sprawdzane statu są z ponad x dni to usuń
/**
 * 
 * @param {*} server_id 
 * @returns {int} amount of messages
 */
async function get_server_stats(server_id) {
    db.init();
    const list = db.read(`${server_id}.messages`)
    console.log(list);
    return 1;
}

module.exports = { messages_stats_handler, voice_stats_handler,  get_server_stats }