/**
 * prevent users from pinging set amount of users on serwer
 * deafult is if server has > 20 memberrs
 * block > 50% users pings
 * 
 * check in command and dashboard
 * 
 * send message to AdminLogsChannel
 * 
 * @param {*} message 
 */
async function antiMasPing(message) {
    const get_mentions_limit = 0
    const user_permisions = null //check is mod/admin

    if(!message) return
    const mentions = message.memtions?.user?.size
    if(!mentions) return

    if(mentions >= get_mentions_limit) {
        message.delete()
        //send admin alert
        // if set on config mute/kick user
    }
}