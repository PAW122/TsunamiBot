const Database = require("../db/database")
const db = new Database(process.cwd() + "/db/files/servers.json")

/*
    po włączeniu bota będzie wczytywał listę kanałów ticketów które
    mają być usunięte w ciągu następnych 24h lub miej z db i usunie je
    w odpowiednim czasie

    *TODO
    dodac tez na stronie bota to.
    + przydało by się wkońcu naprawić statusy on/off bo nie działają
*/

// let ticket_channels_collection
// { channel_id, delete_time }
let ticket_channels_collection = new Map();

/**
 * @param {*} channel_id
 */
function add_new_pengind_channel(channel_id, close_time) {
    if (close_time) {
        ticket_channels_collection.set(channel_id, close_time);
    } else {
        console.log(`close_time is undefined for channel_id: ${channel_id}`);
    }
}

/**
 * load_pending_ticket_channels_from_db
 * execute on main
 */
async function load_tickets_db() {
    db.init();
    const all_guilds = db.getAllKeys();
    // console.log("===LOADING TICKETS DB===");
    all_guilds.forEach(async guild_id => {
        // console.log(`=== guild_id: ${guild_id} ===`);
        const pending_tickets = await db.read(`${guild_id}.pending_tickets`);
        if (!pending_tickets) return;
        Object.keys(pending_tickets).forEach(channel_id => {
            // console.log(`Processing channel_id: ${channel_id}`);
            const ticket_data = pending_tickets[channel_id];
            if (!ticket_data) {
                return;
            }
            const message_id = Object.keys(ticket_data)[0];
            const ticket = ticket_data[message_id];
            if (ticket.status === false) {
                return;
            } // ignore closed tickets
            // console.log(ticket);
            const close_time = ticket.ticket_close_time;
            add_new_pengind_channel(channel_id, close_time);
        });
    });
}

/**
 * delete pending channel from  ticket_channels_collection after closing
 * @param {*} channel_id 
 */
async function delete_pending_channel(channel_id) {
    // remove from ticket_channels_collection
    ticket_channels_collection.delete(channel_id);
}

/**
 * close ticket
 * @param {*} channel_id 
 */
async function close_ticket(channel_id) {
    const { client } = require("../main.js")

    const channel = client.channels.cache.get(channel_id);
    // console.log(channel)
    if (!channel) return;

    const settings = db.read(`${channel.guild.id}.ticket_settings`);
    // check is the ticket is in tickets_category or closed_tickets_category
    const channel_category_id = channel.parentId;
    const delete_on_close = settings.delete_on_close;

    // ticket is in tickets_category
    if (settings.tickets_category === channel_category_id) {
        if (delete_on_close) {
            // delete channel
            channel.delete();
        } else {
            // move channel to closed_tickets_category
            const closed_tickets_category =  client.channels.cache.get(settings.closed_tickets_category_id);
            if (!closed_tickets_category) return;
            channel.setParent(closed_tickets_category);
            return;
        }

        delete_pending_channel(channel_id)

    // ticket is in closed_tickets_category
    } else if (settings.closed_tickets_category_id === channel_category_id) {
        delete_pending_channel(channel_id)
        return;
    }
}

// rekursywna funkcja w pentli działająca co 5 min (do sprawdzania czy kanal
// z listy jest juz do usuniecia)
async function tickets_loop() {
    // get current time
    const current_time = Date.now();
    // for each channel in ticket_channels_collection
    ticket_channels_collection.forEach((close_time, channel_id) => {

        // if current_time >= close_time
        if (current_time >= close_time) {
            // delete_pending_channel(channel_id)
            close_ticket(channel_id);
        }
    });
}

// Run the tickets_loop function every 5 minutes (300000 milliseconds)
setInterval(tickets_loop, 300000);

module.exports = {
    add_new_pengind_channel,
    tickets_loop,
    load_tickets_db,
}