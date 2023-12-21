const Database = require("../db/database");
const database = new Database(__dirname + "\\..\\db\\files\\servers.json");

async function autorole(member, client) {
    const guild_id = member.guild.id;
    const guild = member.guild;

    const data = database.read(`${guild_id}`);
    const role_id = data.autorole.role_id
    if (!role_id) return;

    const role = guild.roles.cache.get(role_id);

    if (!role) return;
    try {
        //give user role
        member.roles.add(role)
    } catch (err) {
        console.log(err)
    }

}

module.exports = autorole;
//todo: bot ma spróbować przenieść swoją rangę na samą górę!