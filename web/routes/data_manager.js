const { verify } = require("./veryfi_user")

/**
 * 
 * @param {string} db_name - nazwa pliku json w db/files
 * @param {string} path - ścieżka danych
 * @returns {bool} - potwierdzenie sukcesu zapisania danych
 */
function get_data(token, db_name, path) {
    if(!verify(token)) {
        return false;
    }

}

/**
 * 
 * @param {string} token 
 * @param {string} db_name 
 * @param {string} path 
 * @param {json} data 
 * @returns {bool}
 */
function save_data(token, db_name, path, data ) {
    if(!verify(token)) {
        return false;
    }
}