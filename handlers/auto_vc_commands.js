async function auto_vc_commands_handler(message, auto_vc_channels) {

    if (!auto_vc_channels.is_exist(message.channel.id)) {
        return
    };

    if (!auto_vc_channels.is_admin(message.channel.id, message.author.id)) {
        return
    }

    const prefix = ""

    const args = message.content.slice(prefix.length).trim().split(/ +/);

    if (args[0] === "help") {
        message.reply("command list: ***max_members <amount>***")
    } else if (args[0] === "max_members") {
        if (!args[1]) {
            return message.reply("Tru using **help**")
        }

        if (isNaN(args[1])) {
            return message.reply("Argument must be a number")
        }
        let max_users = 99

        if (args[1] > 99) {
            max_users = 99
        } else if (args[1] < 1) {
            return message.reply("max users need to be a number between 1 - 99")
        }

        max_users = args[1]

        const voiceChannel = await message.guild.channels.fetch(message.channel.id);
        if (!voiceChannel) {
            return message.reply("Error can't find channel")
        }
        try {
            await voiceChannel.edit({ userLimit: max_users });
            message.reply("set")
            return
        } catch (err) {
            return message.reply("an error occurred")
        }
    }


    if (message.content.startsWith("max_members")) {
        console.log(message.content)
    }
}

module.exports = auto_vc_commands_handler