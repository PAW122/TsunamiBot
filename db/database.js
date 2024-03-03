const fs = require('fs');
const ConsoleLogger = require("../handlers/console")
const logger = ConsoleLogger.getInstance();
const path = require('path');

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
 * add
 * Dodaje lub aktualizuje wpis w bazie danych
 * @param {string} path - Ścieżka do elementu w bazie danych (np. "table1.users.userid.example_user_id")
 * @param {object} data - Nowe dane do dodania lub aktualizacji
 */
    push(path, data) {
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

        // Aktualizuje istniejące pola
        current[pathSegments[pathSegments.length - 1]] = {
            ...current[pathSegments[pathSegments.length - 1]],
            ...data
        };

        // Zapisuje zmienioną bazę danych z powrotem do pliku JSON
        fs.writeFileSync(this.file_path, JSON.stringify(database, null, 2), 'utf-8');
        //console.log(`Dane w ${path} zostały zaktualizowane.`);
    }

    /**
      * addToList
      * Dodaje nowy element do listy w bazie danych
      * @param {string} path - Ścieżka do listy w bazie danych (np. "guildMemberUpdate")
      * @param {object} data - Nowe dane do dodania do listy
      */
    addToList(path, data) {
        const database = JSON.parse(fs.readFileSync(this.file_path, 'utf-8'));
        const pathSegments = path.split('.');
        let current = database;
    
        // Przechodzi po ścieżce, tworząc brakujące elementy w bazie danych
        for (let i = 0; i < pathSegments.length; i++) {
            if (!current[pathSegments[i]]) {
                // Jeśli to ostatni segment ścieżki, utwórz pustą listę
                if (i === pathSegments.length - 1) {
                    current[pathSegments[i]] = [];
                } else {
                    current[pathSegments[i]] = {};
                }
            }
            current = current[pathSegments[i]];
        }
    
        // Dodaje nowy element do listy
        current.push(data);
    
        // Zapisuje zmienioną bazę danych z powrotem do pliku JSON
        fs.writeFileSync(this.file_path, JSON.stringify(database, null, 2), 'utf-8');
        //console.log(`Nowy element został dodany do listy w ${path}.`);
    }
    
    

    /**
      * readList
      * Odczytuje określoną ilość elementów z listy
      * @param {string} path - Ścieżka do listy w bazie danych (np. "guildMemberUpdate")
      * @param {object} amount - ilość elementów do odczytania
      */
    readList(path, amount = null) {
        const database = JSON.parse(fs.readFileSync(this.file_path, 'utf-8'));
        const pathSegments = path.split('.');
        let current = database;
    
        // Przechodzi po ścieżce do odpowiedniego miejsca w bazie danych
        for (let i = 0; i < pathSegments.length; i++) {
            current = current[pathSegments[i]];
            if (!current) {
                console.error(`Path ${path} does not exist in the database.`);
                return null;
            }
        }
    
        // Sprawdza czy ścieżka prowadzi do tablicy
        if (!Array.isArray(current)) {
            console.error(`Path ${path} does not lead to an array.`);
            return null;
        }
    
        // Zwraca pełną listę, jeśli amount jest null
        if (amount === null) return current;
    
        // Jeżeli amount jest większe niż długość listy, zwraca całą listę
        if (amount >= current.length) return current;
    
        // Zwraca ostatnie 'amount' elementów z listy
        return current.slice(-amount);
    }
    

    /**
     * read
     * Odczytuje dane z bazy danych
     * @param {string} path - Ścieżka do elementu w bazie danych (np. "table1.users.userid.example_user_id")
     * @returns {object|null} - Dane z bazy danych lub null, jeśli ścieżka nie istnieje
     */
    read(path) {
        try {
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
        } catch (error) {
            logger.error('Błąd odczytu bazy danych:', error);
            return null;
        }
    }


    /**
     * add
     * Dodaje nowy wpis do bazy danych w sposób opisany przez użytkownika
     * @param {string} path - Ścieżka do elementu w bazie danych (np. "testuser")
     * @param {object} data - Dane do dodania np: [interaction_id]: content
     */
    add(path, data) {
        const database = JSON.parse(fs.readFileSync(this.file_path, 'utf-8'));
        const pathSegments = path.split('.');
        const user_id = pathSegments[0];

        // Sprawdza, czy użytkownik już istnieje w bazie danych
        if (!database[user_id]) {
            database[user_id] = {};
        }

        // Dla każdej właściwości w danych, dodaj ją do obecnej wartości (jeśli istnieje)
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                // Jeżeli istnieje już wartość dla danego klucza, dodaj nową wartość do istniejącej
                if (database[user_id][key]) {
                    if (Array.isArray(database[user_id][key])) {
                        // Jeżeli już jest tablica, dodaj nowy element do niej
                        database[user_id][key].push(data[key]);
                    } else {
                        // Jeżeli nie jest tablicą, zamień to w tablicę i dodaj nowy element
                        database[user_id][key] = [database[user_id][key], data[key]];
                    }
                } else {
                    // Jeżeli nie istnieje jeszcze wartość dla danego klucza, po prostu przypisz ją
                    database[user_id][key] = data[key];
                }
            }
        }

        // Zapisuje zmienioną bazę danych z powrotem do pliku JSON
        fs.writeFileSync(this.file_path, JSON.stringify(database, null, 2), 'utf-8');
        //console.log(`Nowy wpis został dodany do ${path}.`);
    }

    getCurrentFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        } catch (error) {
            console.error('Error getting current file size:', error);
            return null;
        }
    }

    backup(backup_path) {
        return logger.error("backup is disabled")
        // Pobierz rozmiar pliku przed wykonaniem backupu
        const currentSizeBeforeBackup = this.getCurrentFileSize(this.file_path);

        // Wygeneruj nazwę pliku backupu z timestampem
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup_${timestamp}.json`;

        // Ustal pełną ścieżkę do pliku backupu
        const backupFilePath = path.join(backup_path, backupFileName);

        try {
            // Wykonaj backup
            fs.copyFileSync(this.file_path, backupFilePath);

            // Pobierz rozmiar pliku po wykonaniu backupu
            const currentSizeAfterBackup = this.getCurrentFileSize(this.file_path);

            // Porównaj rozmiar pliku przed i po backupie
            if (currentSizeBeforeBackup !== null && currentSizeAfterBackup !== null &&
                currentSizeBeforeBackup >= currentSizeAfterBackup) {
                logger.log(`Backup created successfully at: ${backupFilePath}`);
            } else {
                logger.error('Error creating backup: New backup size is not smaller than the current size.');
            }
        } catch (error) {
            logger.error('Error creating backup:', error);
        }
    }


}

module.exports = Database;