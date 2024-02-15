const { SlashCommandBuilder } = require("discord.js");
const path = require("path")
const fs = require("fs")

const command = new SlashCommandBuilder()
    .setName("s-cards")
    .setDescription("sends senko cards");

async function execute(interaction, client) {

    const assetDir = path.join(__dirname, "../../assets/senko/cards/");

    // Odczytaj wszystkie pliki z katalogu /cards/
    fs.readdir(assetDir, async (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            await interaction.reply("An error occurred while reading the directory.");
            return;
        }

        // Wybierz losowy plik z listy
        const randomIndex = Math.floor(Math.random() * files.length);
        const randomFile = files[randomIndex];

        // Utwórz pełną ścieżkę do losowego pliku
        const filePath = path.join(assetDir, randomFile);

        // Wyślij odpowiedź z wybranym plikiem
        await interaction.reply({
            files: [filePath]
        });
    });
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `sends random senko card`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
