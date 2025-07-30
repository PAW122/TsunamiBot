const Database = require("../db/database");
const database = new Database(__dirname + "/../db/files/servers.json");

/*

Database structure:

server_id: {
    leave_messages: {
        status: boolean, // true if enabled, false if disabled
        channel_id: string, // ID of the channel where the message will be sent
    }
*/

async function leaveServerHandler(member, client) {
  try {
    database.init();
    const data = await database.read(`${member.guild.id}.leave_messages`);

    if (!data || !data.status || !data.channel_id) return;

    // Dodaj sprawdzenie flagi leave_notify
    if (data.status === false || !data.status) return;

    const channel_id = data.channel_id;
    const channel = client.channels.cache.get(channel_id);

    if (!channel) return;

    channel.send(`User <@${member.user.id}> has left the server.`);
  } catch (error) {
    console.error("Error in leaveServerHandler:", error);
  }
}

module.exports = { leaveServerHandler };
