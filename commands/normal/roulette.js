const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("roulette")
    .setDescription("Play roulette with friends")
    .addUserOption((option) =>
        option
            .setName("tag_person2")
            .setDescription("add person to game")
            .setRequired(false)
    )
    .addUserOption((option) =>
        option
            .setName("tag_person3")
            .setDescription("add person to game")
            .setRequired(false)
    )
    .addUserOption((option) =>
        option
            .setName("tag_person4")
            .setDescription("add person to game")
            .setRequired(false)
    )
    .addUserOption((option) =>
        option
            .setName("tag_person5")
            .setDescription("add person to game")
            .setRequired(false)
    )

async function execute(interaction) {
    const user1 = interaction.user;
    const user2 = interaction.options.getUser('tag_person2') ?? false
    const user3 = interaction.options.getUser('tag_person3') ?? false
    const user4 = interaction.options.getUser('tag_person4') ?? false
    const user5 = interaction.options.getUser('tag_person5') ?? false
    let users = [user1, user2, user3, user4, user5]
    
    let players = []
    
    users.forEach(user => {
        if(user) {
            players.push(user)
        }
    })

    //jeżeli user gra sam
    if(players.length === 1) {
        // 50% na wina
        if(Math.floor(Math.random() * 2) == 1) {
            await interaction.reply(`Survivor: ${players[0]}`);
        } else {
            await interaction.reply(`Die: ${players[0]}`);
        }

    } else {
        //gra więcej osób
        //odpada 1 osoba (ginie)
        let looser = players[Math.floor(Math.random() * players.length)]
        await interaction.reply(`Die: ${looser}`);
    }
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Play roulette up to 5 people. you don't have to add all 5 people. The game will be played between you and as many people as you add`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
