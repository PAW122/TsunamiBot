
const Database = require("../../db/database")
const database = new Database(__dirname + "/../../db/files/users.json");

const {DataStore} = require("../../handlers/audio/api")
const datastore = DataStore.getInstance()

const { SlashCommandBuilder } = require("discord.js");
const {get_songs, AudioDataStore} = require("../../handlers/audio/cache")
const audioCache = AudioDataStore.getInstance()

const command = new SlashCommandBuilder()
    .setName("addsong")
    .setDescription("add new song to your playlist")
    .addStringOption((option) => option
        .setName("song_name")
        .setDescription("chose song name")
        .setRequired(true)
    )
    .addStringOption((option) => option 
        .setName("link")
        .setDescription("right click message with song in mp3 file us message attachment, copy link to message, paste it here")
        .setRequired(true)
    )

async function execute(interaction, client) {
    const song_name = interaction.options.getString("song_name")
    const link = interaction.options.getString("link")
    const user_id = interaction.user.id
    const username = interaction.user.name
    const timestamp = Date.now() / 1000 | 0 //date in seconds

    if(!song_name || !link) {
        await interaction.reply("invalid song name or link")
        return
    }

    if(song_name.length < 3) {
        await interaction.reply("song name must be longer then 3 characters")
        return
    }

    if(song_name.length > 24) {
        await interaction.reply("song name must be shorter then 24 characters")
        return
    }

    // dodać sprawdzanie czy nie nadpisujemy jakiejś innej wczesniej dodanej nuty

    const data = {
        song_name: song_name,
        link: link,
        username: username,
        added_timestamp: timestamp,
        check_count: 5  //if count = 0 -> link is no longer valid, delete record from db
    }
    database.write(`${user_id}.songs.${song_name}`, data)
    
    await interaction.reply(`**${song_name}** added to playlist`)

    //add songs to list
    const db_data = database.read(`${user_id}`)
    const songs_list = get_songs(db_data)

    audioCache.remove(`${username}`)
    audioCache.add(username, {user_id: user_id, files: songs_list})
}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `add song to your playlist. song_name: type name of your song`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
