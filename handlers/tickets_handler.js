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
async function add_new_pengind_channel(channel_id) {
    // 1. save channel_id to ticket_channels_collection
    ticket_channels_collection.set(channel_id, Date.now() + 24 * 60 * 60 * 1000);
}

/**
 * load_pending_ticket_channels_from_db
 * TODO
 */
async function load_tickets_db() {

}

/**
 * delete pending channel from  ticket_channels_collection after closing
 * @param {*} channel_id 
 */
async function delete_pending_channel(channel_id) {
    
    // if there is reactions on ticket search for
    // db.guild_id.tickets.<channel_id>.ticket_opinion = {message_id, user_id}
    // check for emoji reactions under message

    // 1. move channel to closed_tickets_category_id
    // 2. disable non-admins from seeing this channel
    // 3. send rating message(stats) on the channel
}


// rekursywna funkcja w pentli działająca co 5 min (do sprawdzania czy kanal
// z listy jest juz do usuniecia)
async function tickets_loop() {

    
}
