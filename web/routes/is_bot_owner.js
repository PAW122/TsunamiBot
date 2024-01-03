const config = require("../../config.json")
const owner_id = config.owner_id

/**
 * 
 * @param {*} user_id 
 * @returns 
 */
function is_owner(user_id) {
    if(!owner_id) return false;
    if(user_id === owner_id) {
        return true
    }
}

module.exports = { is_owner }