const config = require("../../config.json")
const using = config.using
const is_test = config[using].is_test
const prefix = config[using].prefix
const server_whitelist = config[using].test_commands_server_list

function test_msg_handler(client, message) {

    if (!is_test) return;
    if (message.guild.id != server_whitelist) return;

    if (message.content.startsWith(prefix) && !message.author.bot) {//sprawdza prefix, && znaczy and

        const args = message.content.slice(prefix.length).trim().split(/ +/);//oddziela słowa w komendzie spacją i usówa prefix 
        const commandName = args.shift().toLowerCase();//zwraca tylko 1 argument i zmienia na same małe liter
        if (!client.command.has(commandName)) return;//sprawdza czy taka komenda istnieje
    
        const {command_data, execute, help} = client.command.get(commandName);//pobieramy komende

        try {//wywołujemy komende
            execute(message, args, client);
        } catch (error) {
            console.error(error);
            message.reply("Wystąpił błąd");
        }
    }

}

module.exports = test_msg_handler