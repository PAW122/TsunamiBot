const fs = require('fs');
class Database {
    constructor(file_path) {
        this.file_path = file_path
    }

    /**
     * init
     * sprawdza czy istnieje dany plik, jeżeli nie to go tworzy
     */
    init() {
        // Sprawdź czy plik istnieje
        if (!fs.existsSync(this.file_path)) {
            // Jeżeli plik nie istnieje, utwórz go
            fs.writeFileSync(this.file_path, JSON.stringify({}), 'utf-8');
            //console.log(`Plik ${this.file_path} został utworzony.`);
        } else {
            //console.log(`Plik ${this.file_path} już istnieje.`);
            // console.log("db is working")
        }
    }

    /**
     * write
     * Dodaje nowy wpis do bazy danych
     * @param {string} path - Ścieżka do elementu w bazie danych (np. "table1.users.userid.example_user_id")
     * @param {object} data - Dane do zapisania
     */
    write(path, data) {
        const database = JSON.parse(fs.readFileSync(this.file_path, 'utf-8'));
        const pathSegments = path.split('.');
        let current = database;

        // Przechodzi po ścieżce do odpowiedniego miejsca w bazie danych
        for (let i = 0; i < pathSegments.length - 1; i++) {
            if (!current[pathSegments[i]]) {
                current[pathSegments[i]] = {};
            }
            current = current[pathSegments[i]];
        }

        // Dodaje nowy wpis
        current[pathSegments[pathSegments.length - 1]] = data;

        // Zapisuje zmienioną bazę danych z powrotem do pliku JSON
        fs.writeFileSync(this.file_path, JSON.stringify(database, null, 2), 'utf-8');
        //console.log(`Nowy wpis został dodany do ${path}.`);
    }

    /**
     * read
     * Odczytuje dane z bazy danych
     * @param {string} path - Ścieżka do elementu w bazie danych (np. "table1.users.userid.example_user_id")
     * @returns {object|null} - Dane z bazy danych lub null, jeśli ścieżka nie istnieje
     */
    read(path) {
        const database = JSON.parse(fs.readFileSync(this.file_path, 'utf-8'));
        const pathSegments = path.split('.');
        let current = database;

        // Przechodzi po ścieżce do odpowiedniego miejsca w bazie danych
        for (let i = 0; i < pathSegments.length; i++) {
            if (!current[pathSegments[i]]) {
                return null; // Jeśli którakolwiek część ścieżki nie istnieje, zwróć null
            }
            current = current[pathSegments[i]];
        }

        return current;
    }


}

module.exports = Database;