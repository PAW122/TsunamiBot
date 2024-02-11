class GuildConsoleLogger {
    constructor() {
        // Sprawdź, czy istnieje już instancja klasy
        if (!GuildConsoleLogger.instance) {
            // Mapa przechowująca logi dla każdego serwera
            this.logs = new Map();
            // Jeśli nie istnieje, utwórz nową instancję
            GuildConsoleLogger.instance = this;
        }

        // Zwróć istniejącą instancję
        return GuildConsoleLogger.instance;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new GuildConsoleLogger();
        }

        return this.instance;
    }

    // Metoda do zapisywania logu dla określonego serwera
    log(guildId, message) {
        if(!guildId || !message) {
            console.error("guild console logs.log -> missing argument")
            return
        }
        // Sprawdź, czy istnieje już tablica logów dla tego serwera
        if (!this.logs.has(guildId)) {
            // Jeśli nie istnieje, utwórz nową tablicę
            this.logs.set(guildId, []);
        }

        // Pobierz tablicę logów dla danego serwera
        const guildLogs = this.logs.get(guildId);
        // Dodaj nowy log do tablicy
        guildLogs.push(message);
    }

    // Metoda do odczytywania logów dla określonego serwera
    getLogs(guildId, amount) {
        console.log(guildId, amount)
        if(!guildId || !amount) {
            console.error("guild console logs. getLogs -> missing argument")
            return
        }
        // Sprawdź, czy istnieją logi dla tego serwera
        if (!this.logs.has(guildId)) {
            return [];
        }

        // Pobierz tablicę logów dla danego serwera
        const guildLogs = this.logs.get(guildId);

        // Jeśli podana ilość logów jest większa niż dostępna, zwróć wszystkie logi
        if (amount >= guildLogs.length) {
            return guildLogs;
        }

        // Jeśli ilość logów jest mniejsza niż dostępna, zwróć tylko ostatnie logi
        const startIndex = guildLogs.length - amount;
        return guildLogs.slice(startIndex);
    }
}

module.exports = GuildConsoleLogger;
