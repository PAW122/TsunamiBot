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

const settings = {
    dev_only: true
}

const command = new SlashCommandBuilder()
    .setName("find-teammate")
    .setDescription("find someone to play with")
    .addStringOption(option =>
		option.setName('games')
			.setDescription('Find your game')
			.setAutocomplete(true));

async function execute(interaction, client) {
    
    //console.log(client)
    await interaction.reply("Pong!");
}

//tak samo autocomplete jak to z helpa do wyboróv

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Ping return "Pong!" message if bot is online`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message, settings };
