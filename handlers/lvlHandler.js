const Database = require("../db/database")
const db = new Database(__dirname + "/../db/files/servers.json")
db.init()

const calculate_lvl = require("./calculateLvl")
const config = require("../config.json")
var min_xp = config.lvling.min_xp
var max_xp = config.lvling.max_xp

function get_random_xp(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max- min + 1)) + min;
}

/**
 * @param {*} message
 * @returns 
 */
async function lvl_system(message) {
    if(!message.inGuild() || message.author.bot) return;
    const guild = message.guild.id
    const user = message.author.id
    const xpToGive = get_random_xp(min_xp, max_xp)
    
    const user_xp = await db.read(`${guild}.users_lvls.${user}.xp`)
    if(user_xp === null) {
        //save new user data
        const data = {
            xp: xpToGive,
            messages: 1
        }
        db.write(`${guild}.users_lvls.${user}`, data)
    } else {
        //user have their data
        const total_xp = xpToGive + user_xp
        const user_messages = await db.read(`${guild}.users_lvls.${user}.messages`) + 1

        const data = {
            xp: total_xp,
            messages: user_messages
        }
        db.write(`${guild}.users_lvls.${user}`, data)
    }
}

module.exports = {lvl_system}