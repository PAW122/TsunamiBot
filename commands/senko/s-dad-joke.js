const { SlashCommandBuilder } = require("discord.js");

const command = new SlashCommandBuilder()
    .setName("s-dad-joke")
    .setDescription("sends dad joke");

async function execute(interaction, client) {

    const dad_responses =
        ["Why was the stadium so cool? Because it was filled with fans!",
            "Why can't you hear a pterodactyl using the bathroom? Because the 'P' was silent!",
            "My dad was chopping onions. Onions was a good dog.",
            "What do you call a fish with no eyes? A fsh!",
            "What happened to the Italian chef? He pasta way!",
            "They ask me, why don't I tell egg jokes? Because they always get cracked up!",
            "Why was the mathbook always depressed? Because his parents were divorced and his grades were falling due to the stress and neither of his parents cared about him so he spiraled into a never-ending self-pity party, in which he could never return from. Just kidding! Because it's filled with problems!",
            "Someone asked to call their parents on my phone, but now it's broken. They really didn't need to stand on it to make the call!",
            "Did you hear about the guy who invented the knock-knock joke? He won the 'no-bell' prize!",
            "A family of elephants walk into a bar. What do they take? A lot of space!",
            "If a child refuses to sleep during nap time, are they guilty of resisting a rest?",
            "What sound does a plane make when it crashes? Boeing!",
            "I got into a fight with a guy who hit me with a bat. I didn't know these animals hurt that much!",
        ]

        const randomIndex = Math.floor(Math.random() * dad_responses.length);

        await interaction.reply({
            content: `${dad_responses[randomIndex]}`,
        })
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `sends dad joke`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
