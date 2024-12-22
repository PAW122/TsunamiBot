/*
    req permisions -> ManageMessages + ticket - reviwe role

    jeżeli komenda zostanie użyta na 
*/

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");


const command = new SlashCommandBuilder()
    .setName("ticket_close")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDescription("Close ticket")

async function execute(interaction, client) { 
    const guild_id = interaction.guild.id;
    const channel_id = interaction.channel.id;

    const settings = database.get(`${guild_id}.tickets_settings`);
    if (!settings || !settings.status) {
        return interaction.reply({
            content: `Ticket system is disabled`,
            ephemeral: true
        });
    }

    if(settings.collect_ratings) {
        // send embed with emoji's
        // handler will check for reactions
    }

    // save ticket_close_time in db & in tickets_handler.js add_new_pengind_channel()


    
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `-`,
        ephemeral: true
    })
}

module.exports = {command, execute, help_message}