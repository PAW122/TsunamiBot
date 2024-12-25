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
        .setRequired(true)
    )
    .addStringOption(option => option
        .setName("description")
        .setDescription("ticket content")
        .setRequired(true)
    )

async function execute(interaction, client) {

    const title = interaction.options.getString("title");
    const description = interaction.options.getString("Description");

    const guild_id = interaction.guild.id;

    // check in db is ticket system is enabled
    const settings = database.read(`${guild_id}.ticket_settings`);
    const ticket_category_id = settings.tickets_category;
    if(!settings || !settings.status || !ticket_category_id) {
        return interaction.reply({
            content: `Ticket system is disabled`,
            ephemeral: true
        });
    }

    // create ticket channel in tickets category
    const ticket_channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.id}`,
        type: 0, // text channel
        parent: ticket_category_id,
        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: ['ViewChannel'], // Deny view access to everyone
            },
            {
                id: interaction.user.id,
                allow: ['ViewChannel'], // Allow view access to the ticket creator
            },
        ],
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
            color: 15844367,
            timestamp: new Date(),
            footer: {
                text: "use /ticket_close to close ticket"
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