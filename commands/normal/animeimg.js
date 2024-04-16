const sharp = require('sharp');
const { SlashCommandBuilder } = require("discord.js");
require('dotenv').config();
const token = process.env.WAIFU_TOKEN;

const command = new SlashCommandBuilder()
    .setName("animeimg")
    .setDescription("This is a ping command!")
    .addStringOption((option) => option
        .setName("image-category")
        .setDescription('chose image category')
        .setChoices(
            { name: "random", value: "random" },
            { name: "waifu", value: "waifu" },
            { name: "maid", value: "maid" },
            { name: "marin-kitagawa", value: "marin-kitagawa" },
            { name: "mori-calliope", value: "mori-calliope" },
            { name: "raiden-shogun", value: "raiden-shogun" },
            { name: "oppai", value: "oppai" },
            { name: "selfies", value: "selfies" },
            { name: "uniform", value: "uniform" },
            { name: "kamisato-ayaka", value: "kamisato-ayaka" },
            { name: "NSFW-ero", value: "ero" },
            { name: "NSFW-ass", value: "ass" },
            { name: "NSFW-hentai", value: "hentai" },
            { name: "NSFW-milf", value: "milf" },
            { name: "NSFW-oral", value: "oral" },
            { name: "NSFW-paizuri", value: "paizuri" },
            { name: "NSFW-ecchi", value: "ecchi" },
        )
        .setRequired(true)
    );

async function execute(interaction, client) {

    const NSFW = [
        "ass",
        "hentai",
        "milf",
        "oral",
        "paizuri",
        "ecchi",
        "ero"
    ]

    const categs = [
        "maid",
        "waifu",
        "marin-kitagawa",
        "mori-calliope",
        "raiden-shogun",
        "oppai",
        "selfies",
        "uniform",
        "kamisato-ayaka"
    ]
    if (!token) {
        return interaction.reply("Configuration error")
    }

    let category = interaction.options.getString('image-category');

    if(NSFW.includes(category)) {
        //NSFW image
        if(!interaction.channel.nsfw) {
            return interaction.reply("Only in NSFW channel")
        }
    }

    // Funkcja do zmniejszania rozmiaru obrazu
    async function resizeImage(imageUrl, maxWidth, maxHeight) {
        // Pobierz obraz z URL-a
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch image');
        }
        const imageBuffer = await response.arrayBuffer(); // Użyj arrayBuffer() zamiast buffer()

        // Zmniejsz rozmiar obrazu
        const resizedImageBuffer = await sharp(Buffer.from(imageBuffer))
            .resize({ width: maxWidth, height: maxHeight, fit: 'inside' })
            .toBuffer();

        return resizedImageBuffer;
    }


    if(category === "random") {
        const rng = categs[Math.floor(Math.random() * categs.length)]
        category = rng
    }

    // Pobierz obraz
    const img = await get_img(category);
    const imageUrl = img.images[0].url;

    // Zmniejsz rozmiar obrazu
    const resizedImage = await resizeImage(imageUrl, 800, 600);

    // Odpowiedz z zeskalowanym obrazem
    await interaction.reply({
        content: `**${category}:**`,
        files: [resizedImage]
    });

    async function get_img(tag) {
        const apiUrl = 'https://api.waifu.im/search';
        const params = {
            included_tags: tag,
            height: '>=200'
        };

        const queryParams = new URLSearchParams();

        for (const key in params) {
            if (Array.isArray(params[key])) {
                params[key].forEach(value => {
                    queryParams.append(key, value);
                });
            } else {
                queryParams.set(key, params[key]);
            }
        }
        const requestUrl = `${apiUrl}?${queryParams.toString()}`;

        return fetch(requestUrl) // Zwróć obiekt Promise zamiast używać then() i catch()
            .then(response => {
                if (!response.ok) {
                    throw new Error('Request failed with status code: ' + response.status);
                }
                return response.json(); // Zwróć dane jako JSON
            })
            .catch(error => {
                console.error('An error occurred:', error.message);
                throw error; // Rzuć błąd, aby go obsłużyć na zewnątrz funkcji
            });
    }

}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `Ping return "Pong!" message if bot is online`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
