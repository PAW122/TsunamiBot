const Database = require("../db/database");
const database = new Database(__dirname + "\\..\\db\\files\\servers.json");

const GuildConsoleLogger = require("./guildConsoleLogs")
const loggerInstance = GuildConsoleLogger.getInstance();

async function autorole(member, client) {
    const guild_id = member.guild.id;
    const guild = member.guild;

    const data = database.read(`${guild_id}`);
    const role_id = data.autorole.role_id;
    if (!role_id) return;

    const role = guild.roles.cache.get(role_id);

    if (!role) return;

    try {
        // Pobierz obiekty roli dla użytkownika i bota
        const memberHighestRole = member.roles.highest;
        const botMember = guild.members.cache.get(client.user.id);
        const botHighestRole = botMember.roles.highest;

        // Sprawdź czy bot ma wyższą pozycję niż użytkownik
        if (memberHighestRole.comparePositionTo(botHighestRole) >= 0) {
            loggerInstance.log(guild_id,`Autorole -> Added roleId: ${role.id} role to user`);
            // Możesz dodać rolę użytkownikowi
            member.roles.add(role);
        } else {
            loggerInstance.log(guild_id, 'Autorole Error: The bot does not have sufficient permissions to add the role.');
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = autorole;
