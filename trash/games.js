/*
autocomplete options
/playing <gamename>
-- ustawia status w jaką grę aktualnie grasz do której szukasz temmatów


/find_temmate <game name>
zwraca listę kilku randomowych nazw userów którzy:
w takiej kolejności:
są online
są na tym srv
grają w te gre teraz
*/

const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("find-teammate")
    .setDescription("find someone to play with");

async function execute(interaction, client) {
    //console.log(client)
    await interaction.reply("Pong!");
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Ping return "Pong!" message if bot is online`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
