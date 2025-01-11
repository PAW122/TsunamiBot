const { SlashCommandBuilder, MessageFlags, EmbedBuilder, Collection, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const axios = require("axios");

let volumes = [];
let messageCache = new Collection();
let imageCache = new Collection();

const command = new SlashCommandBuilder()
    .setName("s-manga")
    .setDescription("Allows you to read senko manga")
    .addStringOption((option) => option
        .setName("volume")
        .setDescription("Choose volume to read")
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption((option) => option
        .setName("chapter")
        .setDescription("Choose chapter to read")
        .setAutocomplete(true)
        .setRequired(true)
    )

async function fetchVolumes() {
    const v = await axios.get('https://api.mangadex.org/manga/c26269c7-0f5d-4966-8cd5-b79acb86fb7a/aggregate?translatedLanguage[]=en');
    volumes = v.data.volumes;

    for (const volumeKey in volumes) {
        const chapters = volumes[volumeKey].chapters;
        const sortedChapterKeys = Object.keys(chapters)
            .map(key => parseFloat(key))
            .sort((a, b) => a - b)
            .map(num => num.toString());
        const sortedChapters = sortedChapterKeys.reduce((arr, key) => {
            arr.push(chapters[key]);
            return arr;
        }, []);

        volumes[volumeKey].chapters = sortedChapters;
    }
}

async function init(client) {
    await fetchVolumes();

    // Register button handler
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'manga_previous' && interaction.customId !== 'manga_next' && interaction.customId !== 'manga_next_chapter' && interaction.customId !== 'manga_prev_chapter') return;
        if (!messageCache.has(interaction.message.id)) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#f23f43')
                    .setTitle('Message not found')
                    .setDescription('Please use the command /s-manga again to start a new reader')
            ],
            flags: MessageFlags.Ephemeral
        });
        console.log(messageCache.toJSON());
        console.log(interaction.message.id);

        let data = messageCache.get(interaction.message.id);
        if (interaction.user.id !== data.author_id) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor('#f23f43')
                    .setTitle('You are not the author of this message!')
            ],
            flags: MessageFlags.Ephemeral
        });

        const volume = data.volume;
        let chapter = data.chapter;
        let page = data.page;

        if (interaction.customId === 'manga_next_chapter') {
            if (data.nextChapter === null) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#f23f43')
                        .setTitle('No more chapters')
                ],
                flags: MessageFlags.Ephemeral
            });

            page = 0;
            chapter = data.nextChapter;
            const chapterIndex = volumes[volume].chapters.findIndex((c) => c.chapter === chapter);
            const prevChapter = volumes[volume].chapters[chapterIndex - 1]?.chapter || null;
            const nextChapter = volumes[volume].chapters[chapterIndex + 1]?.chapter || null;
            data = {
                volume: volume,
                chapter: chapter,
                author_id: interaction.user.id,
                page: 0,
                nextChapter: nextChapter,
                prevChapter: prevChapter
            };
            messageCache.set(interaction.message.id, data);
        } else if (interaction.customId === 'manga_prev_chapter') {
            if (data.prevChapter === null) return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#f23f43')
                        .setTitle('No previous chapters')
                ],
                flags: MessageFlags.Ephemeral
            });

            chapter = data.prevChapter;
            const pageCount = imageCache.get(`${volume}-${data.prevChapter}`).length;
            page = pageCount - 1;
            const chapterIndex = volumes[volume].chapters.findIndex((c) => c.chapter === chapter);
            const prevChapter = volumes[volume].chapters[chapterIndex - 1]?.chapter || null;
            const nextChapter = volumes[volume].chapters[chapterIndex + 1]?.chapter || null;
            data = {
                volume: volume,
                chapter: chapter,
                author_id: interaction.user.id,
                page: pageCount - 1,
                nextChapter: nextChapter,
                prevChapter: prevChapter
            };
            messageCache.set(interaction.message.id, data);
        }

        let images = [];
        if (imageCache.has(`${volume}-${chapter}`)) {
            images = imageCache.get(`${volume}-${chapter}`);
        } else {
            try {
                const chapterData = volumes[volume].chapters.find((c) => c.chapter === chapter);
                const imageData = await axios.get(`https://api.mangadex.org/at-home/server/${chapterData.id}?forcePort443=false`);
                const img = imageData.data.chapter.data.map((i) => {
                    return `${imageData.data.baseUrl}/data/${imageData.data.chapter.hash}/${i}`;
                });
                imageCache.set(`${volume}-${chapter}`, img);
                images = img;
            } catch (err) {
                console.error(err);
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#f23f43')
                            .setTitle('Error !')
                            .setDescription('Failed to fetch images')
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }
        }

        if (interaction.customId === 'manga_previous') {
            if (page === 0) return;
            page--;
        } else if (interaction.customId === 'manga_next') {
            if (page === images.length - 1) return;
            page++;
        }

        messageCache.set(interaction.message.id, {
            volume: volume,
            chapter: chapter,
            author_id: interaction.user.id,
            page: page,
            nextChapter: data.nextChapter ? data.nextChapter : null,
            prevChapter: data.prevChapter ? data.prevChapter : null
        });

        const embed = new EmbedBuilder()
            .setColor("#fff19e")
            .setTitle(`${volume === "none" ? "No Volume" : "Volume " + volume} - Chapter ${chapter}`)
            .setImage(images[page]);

        await interaction.update({
            embeds: [embed],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(page === 0 ? 'manga_prev_chapter' : 'manga_previous')
                            .setLabel(page === 0 ? (data.prevChapter !== null ? '⬅️ Previous Chapter' : '←') : '←')
                            .setStyle(page === 0 ? (data.prevChapter !== null ? 'Success' : 'Secondary') : 'Secondary')
                            .setDisabled(page === 0 ? data.prevChapter === null : false),
                        new ButtonBuilder()
                            .setCustomId('manga_page')
                            .setLabel(`${page + 1} / ${images.length}`)
                            .setStyle('Success')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId(page === (images.length - 1) ? 'manga_next_chapter' : 'manga_next')
                            .setLabel(page === (images.length - 1) ? (data.nextChapter === null ? '→' : '➡️ Next Chapter') : '→')
                            .setStyle(page === (images.length - 1) ? (data.nextChapter === null ? 'Secondary' : 'Success') : 'Secondary')
                            .setDisabled(page === (images.length - 1) ? data.nextChapter === null : false)
                    )
            ]
        });
    });
}

async function execute(interaction, client) {
    if (volumes.length === 0) {
        await fetchVolumes();
    }

    const volume = interaction.options.getString('volume');
    const chapter = interaction.options.getString('chapter');

    if (!volume || !chapter || !volumes[volume] || !volumes[volume].chapters.find((c) => c.chapter === chapter)) {
        await interaction.reply({
            content: 'Invalid volume or chapter',
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    let images = [];
    if (imageCache.has(`${volume}-${chapter}`)) {
        images = imageCache.get(`${volume}-${chapter}`);
    } else {
        try {
            const chapterData = volumes[volume].chapters.find((c) => c.chapter === chapter);
            const imageData = await axios.get(`https://api.mangadex.org/at-home/server/${chapterData.id}?forcePort443=false`);
            const img = imageData.data.chapter.data.map((i) => {
                return `${imageData.data.baseUrl}/data/${imageData.data.chapter.hash}/${i}`;
            });
            imageCache.set(`${volume}-${chapter}`, img);
            images = img;
        } catch (err) {
            console.error(err);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#f23f43')
                        .setTitle('Error !')
                        .setDescription('Failed to fetch images')
                ],
                flags: MessageFlags.Ephemeral
            });
            return;
        }
    }

    const embed = new EmbedBuilder()
        .setColor("#fff19e")
        .setTitle(`${volume === "none" ? "No Volume" : "Volume " + volume} - Chapter ${chapter}`)
        .setImage(images[0]);

    await interaction.reply({
        embeds: [embed],
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('manga_previous')
                        .setLabel('←')
                        .setStyle('Secondary')
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('manga_page')
                        .setLabel(`1 / ${images.length}`)
                        .setStyle('Success')
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('manga_next')
                        .setLabel('→')
                        .setStyle('Secondary')
                )
        ]
    });
    const message = await interaction.fetchReply();
    const chapterIndex = volumes[volume].chapters.findIndex((c) => c.chapter === chapter);
    const nextChapter = volumes[volume].chapters[chapterIndex + 1].chapter || null;
    messageCache.set(message.id, {
        volume: volume,
        chapter: chapter,
        author_id: interaction.user.id,
        nextChapter: nextChapter,
        prevChapter: null,
        page: 0,
    });
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `Allows you to read senko manga`,
        flags: MessageFlags.Ephemeral
    })
}

async function autocomplete(interaction) {
    if (volumes.length === 0) {
        await fetchVolumes();
    }

    const options = interaction.options._hoistedOptions;

    let focusedOptionName = null;
    let focusedOptionValue = null;
    for (const option of options) {
        if (option.focused) {
            focusedOptionName = option.name;
            focusedOptionValue = option.value;
            break;
        }
    }
    if (!focusedOptionName) {
        console.error("No focused option found.");
        return;
    }

    if (focusedOptionName === "volume") {
        let res = [];
        for (const [key, value] of Object.entries(volumes)) {
            res.push({
                name: value.volume === 'none' ? 'No Volume' : `Volume ${value.volume}`,
                value: value.volume
            });
        }
        res = res.filter(item => item.name.toLowerCase().includes(focusedOptionValue.toLowerCase()));
        try {
            await interaction.respond(res);
        } catch (err) { }
    } else if (focusedOptionName === "chapter") {
        const selectedVolume = interaction.options.getString('volume');
        let res = [];
        if (volumes[selectedVolume]) {
            volumes[selectedVolume].chapters.map((chapter) => {
                res.push({
                    name: `Chapter ${chapter.chapter}`,
                    value: chapter.chapter
                });
            });
            res = res.filter(item => item.name.toLowerCase().includes(focusedOptionValue.toLowerCase()));
            try {
                await interaction.respond(res);
            } catch (err) {
                console.error(err);
            }
        }
    }
}


module.exports = { command, execute, help_message, autocomplete, init };
