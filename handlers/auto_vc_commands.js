async function auto_vc_commands_handler(message, auto_vc_channels) {

    if(message.author.bot) return;

    if (!auto_vc_channels.is_exist(message.channel.id)) {
        return
    };

    if (!auto_vc_channels.is_admin(message.channel.id, message.author.id)) {
        
        if(message.content.startsWith("max_members")) {
            await message.reply("Only chanel creator can do that")
        }
        
        return 
    }

    /*
    TODO:
    zapisywać w db jakie kanały zostały stworezone przez bota tak aby wczytywać to po jego restarcie i przelecieć po wysztkich zapisanych
    jeżeli ktoś jest na tym kanale to dodać do pamięci cache, jeżeli nikogo na nim nie ma to usunąć kanał
    */


    const prefix = ""

    const args = message.content.slice(prefix.length).trim().split(/ +/);

    if (args[0] === "help") {
        message.reply("command list: ***max_members <amount>***\n***pass_owner @user***")
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
    } else if(args[0] === "pass_owner") {
        if (!args[1]) {
            return message.reply("Tru using **help**")
        }

        if (!auto_vc_channels.is_exist(message.channel.id)) {
            return
        };

        if (!auto_vc_channels.is_admin(message.channel.id, message.author.id)) {
        
            await message.reply("Only chanel creator can do that")
            return 
        }

        //get marked user
        const mentionedUsers = message.mentions.users;

        // Sprawdź, czy są jacyś oznaczeni użytkownicy
        if (mentionedUsers.size > 0) {
            const user = mentionedUsers.values().next().value

            if(!user || !user.id) {
                await message.reply("invalid user")
                return
            }

            //TODO: TEST
            auto_vc_channels.add_admin(user.id, message.channel.id)
            auto_vc_channels.remove_admin(message.author.id, message.channel.id)

            await message.reply(`passed channel owner to <@${user.id}>`)
        } else {
            return message.reply("u need to mark who u want to pass channel owner\n try using ***help*** command")
        }
    }
}

module.exports = auto_vc_commands_handler