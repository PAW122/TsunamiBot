/*
    user używa /ticket title: <>,  message: <>

    bot tworzy kanał z ticketem,
    po zakonczeniu admin wpisuje komende /close_ticket i kanal jestusuwany

    tworzony kanał do ticketu bedzie zapisywany:
    servers.json -> <server_id>.tickets.<channel_id> = 
    {
        ticket_author_id
        ticket_open_time
        ticket_close_time
        ticket_opinion
    }

    
*/
const { SlashCommandBuilder } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");

const command = new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Sent ticket to administration")
    .addStringOption(option => option
        .setName("title")
        .setDescription("set title for the ticket")
    )
    .addStringOption(option => option
        .setName("Description")
        .setDescription("ticket content")
    )

function execute(interaction, client) {

    const title = interaction.options.getString("title");
    const description = interaction.options.getString("Description");

    if (!title || !description) {
        return interaction.reply({
            content: `You need to provide all options`,
            ephemeral: true
        });
    }

    const guild_id = interaction.guild.id;

    // check in db is ticket system is enabled
    const settings = database.get(`${guild_id}.tickets_settings`);
    const ticket_category_id = settings.tickets_category;
    if(!settings || !settings.status || !ticket_category_id) {
        return interaction.reply({
            content: `Ticket system is disabled`,
            ephemeral: true
        });
    }

    // create ticket channel in tickets category
    const ticket_channel = interaction.guild.channels.create(title, {
        type: "GUILD_TEXT",
        parent: ticket_category_id
    });
    // check is the channel was created
    if (!ticket_channel) {
        return interaction.reply({
            content: `Error while creating ticket channel`,
            ephemeral: true
        });
    }

    // send message to ticket channel
    // send embed message with ticket content & author
    ticket_channel.send({
        content: `Ticket from ${interaction.user.tag}`,
        embeds: [{
            title: title,
            description: description,
            color: "BLUE",
            timestamp: new Date(),
            footer: {
                text: interaction.user.id
            }
        }]
    });

    // response to user with link to ticket channel
    interaction.reply({
        content: `Ticket created: ${ticket_channel}`,
        ephemeral: true
    });
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `-`,
        ephemeral: true
    })
}

module.exports = {command, execute, help_message}