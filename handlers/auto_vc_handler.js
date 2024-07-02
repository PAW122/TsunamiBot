const { ChannelType } = require("discord.js");
const Database = require("../db/database");
const database = new Database(__dirname + "/../db/files/servers.json");

const GuildConsoleLogger = require("./guildConsoleLogs")
const loggerInstance = GuildConsoleLogger.getInstance();

// wysłać na kanale głosowym powysyłać wiadomości oznaczając osobę która "stworzyła kanał" z komendami do np: "max_users", "kick user" itp
async function manage_auto_vc(client, oldState, newState, auto_vc_channels) {
    database.init()

    const channel_id = newState?.channel?.id
    const guild_id = newState.guild.id

    // Exit created VC
    const oldChannelID = oldState.channelId;
    const newChannelID = newState.channelId;

    if (auto_vc_channels.is_exist(oldChannelID)) {
        const channel = newState.guild.channels.cache.get(oldChannelID);
        if ((!channel || channel.members.size === 0) || (channel.members.size === 1 && channel.members.first().id === client.user.id)) {
            auto_vc_channels.remove(oldChannelID);
            try {
                await channel.delete();
                loggerInstance.log(guild_id, "Deleted auto vc channel")
                return
            } catch (error) {
                loggerInstance.log(guild_id, `Error deleting auto VC channel: ${error}`);
            }
        }
    }

    if (!channel_id) return

    // Join Vc Create:
    const data = await database.read(`${guild_id}.auto_vc`)

    if (!data || !data.auto_vc) return

    if (data.auto_vc.channel_id != channel_id) return

    if (data.auto_vc.status === true) {
        if (!auto_vc_channels.is_exist(channel_id)) {
            //create vc and move user

            const guild = newState.guild;
            const user_id = newState.member.id;

            // Tworzymy nazwę nowego kanału
            const channel_name = `Auto-VC-${auto_vc_channels.len()}`;
            loggerInstance.log(guild_id, `Created auto-vc: ${channel_name}`)

            try {
                const parentChannelId = newState.channel.parentId;
                const createdChannel = await guild.channels.create({
                    name: channel_name,
                    type: ChannelType.GuildVoice,
                    parent: parentChannelId
                    // your permission overwrites or other options here
                });

                // Przenosimy użytkownika na nowy kanał
                await newState.member.voice.setChannel(createdChannel);
                
                auto_vc_channels.add(createdChannel.id)
                auto_vc_channels.add_admin(user_id, createdChannel.id)
                await createdChannel.send("Commnads: ***max_members <amount>***\n***pass_owner @user***")


            } catch (error) {
                console.error('Błąd podczas tworzenia kanału:', error);
            }
        }

    }
}

module.exports = manage_auto_vc