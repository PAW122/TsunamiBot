const Database = require("../db/database");
const database = new Database(__dirname + "/../db/files/servers.json");

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
        // Sprawdź, czy bot ma uprawnienia administratora lub do zarządzania rolami
        const botMember = guild.members.cache.get(client.user.id);
        
        if (!botMember.permissions.has("ADMINISTRATOR") && !botMember.permissions.has("MANAGE_ROLES")) {
            loggerInstance.log(guild_id, "Autorole Error: The bot does not have sufficient permissions to add the role.");
            return;
        }

        // Dodaj rolę użytkownikowi
        await member.roles.add(role);
        loggerInstance.log(guild_id, `Autorole -> Added roleId: ${role.id} role to user`);
    } catch (err) {
        loggerInstance.log(guild_id, "Missing Permissions. the bot cannot assign a role to the user. move the bot role higher in settings/roles")
    }
}

module.exports = autorole