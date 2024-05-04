const Database = require("../db/database")
const db = new Database(process.cwd() + "/db/files/servers.json")

// if admin dont delete
// dodac filtr od danej ilosci dni istnienia konta można wysyłąć
// dodać filtr od danej ilości dni na serwie można wysyłać
// dodać filtr od danej ranig można wysyłać
// dodać opcje dodania listy userów którzy mogą wysyłać

async function filter_links(client, message) {
    let valid = false
    db.init()
    const guild_id = message.guild.id

    if (message.member.permissions.has("MANAGE_MESSAGES")) {
        // todo: log for mods "cant delete message: user, message,id time, content"
        return
    }

    const settings = await db.read(`${guild_id}.link_filter`)
    if (!settings || !settings.status || settings.status != true) return;

    let exception = settings.exception
    let exception_if_starts_with = settings.exception_if_starts_with

    const content = message.content

    if (content.includes("http://") || content.includes("https://")) {
        
    if (exception) {
        let exceptionsArray = exception.split(/[,\s]+/);
        exceptionsArray.forEach(ex => {
          if (content.includes(ex)) valid = true;
        });
      }

        // if (exception_if_starts_with) {
        //     exception_if_starts_with = Array(exception_if_starts_with)
        //     exception_if_starts_with.forEach(exception => {
        //         console.log("2-return")
        //         if (content.startsWith(exception)) return
        //     })
        // }

        try {
            if(!valid) {
                await message.delete()
            }
            return valid
        } catch (err) {
            //TODO: log for mods "cant delete message: user, message,id time, content"
        }

    }
}

module.exports = filter_links