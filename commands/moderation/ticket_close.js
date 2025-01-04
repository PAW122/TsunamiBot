/*
    req permisions -> ManageMessages + ticket - reviwe role

    jeżeli komenda zostanie użyta na 
*/

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");
const {add_new_pengind_channel} = require("../../handlers/tickets_handler")

const command = new SlashCommandBuilder()
    .setName("ticket_close")
    .setDescription("Close ticket")

async function execute(interaction, client) {
    const guild_id = interaction.guild.id;
    const channel_id = interaction.channel.id;

    database.init()
    const settings = database.read(`${guild_id}.ticket_settings`);
    if (!settings || !settings.status) {
        return interaction.reply({
            content: `Ticket system is disabled`,
            ephemeral: true
        });
    }

    // check if ticket is pending
    const pending_tickets = await database.read(`${guild_id}.pending_tickets.${channel_id}`);
    if (pending_tickets) {
        return interaction.reply({
            content: `Ticket is already closed`,
            ephemeral: true
        });
    }

    if (settings.collect_ratings) {
        // send embed with emoji's
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ticket Closed')
            .setDescription('Thank you for using our ticket system. \nPlease rate your experience on a scale of 1 to 5.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        const msg = await interaction.fetchReply();
        // console.log(msg);
        await msg.react('1️⃣');
        await msg.react('2️⃣');
        await msg.react('3️⃣');
        await msg.react('4️⃣');
        await msg.react('5️⃣');

        const message_id = msg.id;

        /*
            dopuki Date.now() nie będzie >= niż ticket_close_time
            to wtedy ticket nie zostanie zamknięty
            else usuń wpis z db
        */
       const ticket_close_time = 24; // 24h

    //    const test_close_time = Date.now() + 1 * 60 * 1000 // 1 minute in milliseconds

        const data = { // todo: add option to customize ticket_close_time
            ticket_close_time: Date.now() + ticket_close_time * 60 * 60 * 1000,
            ticket_opinion: {
                user_id: interaction.user.id, // closed by
                emoji_list: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'],
            },
            status: true // false = ticket closed
        }

        // save reactions for emoji handler
        database.write(`${guild_id}.pending_tickets.${channel_id}.${message_id}`, data)
        add_new_pengind_channel(channel_id, data.ticket_close_time)
        return await interaction.channel.send(`Ticket will be closed in 24h`);
    }

    // save ticket_close_timte in db & in tickets_handler.js add_new_pengind_channel()
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `Close ticket`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message }