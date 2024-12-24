/*
    bot będzie z automatu tworzył rolę ticket - review ktora uprawnia do zarzadzania
    ticketami, albo jako opcjonalny argument można będzie podać 
    ticket-review-role i ta rola bedzie uprawniala do akcji z ticketami.

    *ratings
        > true po zamknięciu ticketu tworzona jest ala ankieta satysfakcji
        > false po zamknięciu przechodzi do delete_on_close
        
    *delete_on_close
        > true -> jeżęli rating = true to po zostawieniu opini / 24h kanał jest usuwany
        > false -> kanał jest przenoszony do innej kategori np closed_tickets
        > kategoria do tych kanałów closed_tickets ma być wyciszona z powiadomień

    /ticket_settings ratings <bool> delete_on_close <bool>
*/

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const Database = require("../../db/database");
const database = new Database(__dirname + "/../../db/files/servers.json");

const BotLogs = require("../../handlers/bot_logs_handler");
const BotLogsHandler = BotLogs.getInstance()

const command = new SlashCommandBuilder()
    .setName("ticket_settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Set ticket system settings")
    .addBooleanOption(option => option
        .setName("collect_ratings")
        .setDescription("ask user for opinion after closing a ticket")
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName("delete_on_close")
        .setDescription("delete ticket whe closed, false = move ticket channel to closed_tickets category")
        .setRequired(true)
    )
    .addBooleanOption(option => option
        .setName("status")
        .setDescription("turn function on/off")
    )

    // TODO: add option to set role for ticket review channels
async function execute(interaction, client) {

    const collect_ratings = interaction.options.getBoolean("collect_ratings") || false;
    const delete_on_close = interaction.options.getBoolean("delete_on_close") || false;
    const status = interaction.options.getBoolean("status") || true;

    const guild_id = interaction.guild.id;

    let data = {
        tickets_category: null,
        closed_tickets_category_id: null,
        collect_ratings: collect_ratings,
        delete_on_close: delete_on_close,
        status: status
    }

    // search for category names "tickets"
    const ticket_category_id = interaction.guild.channels.cache.find(
        c => c.name === "tickets" && c.type === 4
    )?.id;
    
    if (!ticket_category_id) {

        try {
            // Tworzenie kategorii, jeśli nie istnieje
            const category = await interaction.guild.channels.create({
                name: "tickets",
                type: 4, // Typ 4 = GUILD_CATEGORY
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // ID serwera (domyślna rola @everyone)
                        deny: ['ViewChannel'], // Zablokuj widoczność kanału dla wszystkich
                    },
                    {
                        id: interaction.client.user.id, // ID bota
                        allow: ['ViewChannel', 'SendMessages', 'ManageChannels'], // Daj botowi pełny dostęp
                    },
                    {
                        id: interaction.guild.roles.everyone.id, // Alternatywnie ustawienie dla domyślnej roli @everyone
                        deny: ['ViewChannel'], // Zablokuj dostęp
                    },
                ],
            });
            
            data.tickets_category = category.id;
            
    
            if (category) {
                console.log("Category created:");
    
                // Aktualizacja danych z ID nowej kategorii
                data.tickets_category = category.id;
            }
        } catch (err) {
            console.error("Error while creating category:", err);
    
            return await interaction.reply({
                content: `I can't create a category for tickets.`,
                ephemeral: true
            });
        }
    } else {
        // Jeśli kategoria istnieje, ustaw dane na jej ID
        data.tickets_category = ticket_category_id;
    }
    

    // search for category names "closed_tickets"
    const closed_tickets_category_id = interaction.guild.channels.cache.find
    (c => c.name === "closed_tickets" && c.type === 4)?.id;

    if (!closed_tickets_category_id) {
        try {
            const category = await interaction.guild.channels.create({
                name: "closed_tickets",
                type: 4, // 4 = GUILD_CATEGORY
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // ID serwera (domyślna rola @everyone)
                        deny: ['ViewChannel'], // Zablokuj widoczność kanału dla wszystkich
                    },
                    {
                        id: interaction.client.user.id, // ID bota
                        allow: ['ViewChannel', 'SendMessages', 'ManageChannels'], // Daj botowi pełny dostęp
                    },
                    {
                        id: interaction.guild.roles.everyone.id, // Alternatywnie ustawienie dla domyślnej roli @everyone
                        deny: ['ViewChannel'], // Zablokuj dostęp
                    },
                ],
            });
            if (category) {
                data.closed_tickets_category_id = category.id
            }
        } catch (err) {
            return await interaction.reply({
                content: `I can't create category for closed tickets`,
                ephemeral: true
            });
        }
    } else {
        data.closed_tickets_category_id = closed_tickets_category_id
    }

    if (!data.tickets_category) {
        return await interaction.channel.send({
            content: `I can't find category for tickets`,
            ephemeral: true
        });
    }

    if (!delete_on_close && !data.closed_tickets_category_id) {
        return await interaction.channel.send({
            content: `I can't find category for closed tickets`,
            ephemeral: true
        });
    }

    database.init()
    database.write(`${guild_id}.ticket_settings`, data)
    BotLogsHandler.SendLog(guild_id, `Ticket settings has been updated by ${interaction.user.username}`)

    await interaction.reply({
        content: `Ticket settings has been updated`,
        ephemeral: true
    });
}

async function help_message(interaction, client) {
    interaction.reply({
        content: `**Ticket settings**\n\n`,
        ephemeral: true,
    });
}

module.exports = { command, execute, help_message };