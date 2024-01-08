const ConsoleLogger = require("./console")
const logger = ConsoleLogger.getInstance();

function status_handler(client) {
    function updateStatus() {
        const serverCount = client.guilds.cache.size;
        const statusText = `Watching ${serverCount} servers`;

        client.user.setActivity(statusText)
        logger.extra(`odświerzono user.setActivity(${statusText})`)
    }

    // Pierwsze ustawienie statusu po uruchomieniu
    updateStatus();

    // Odświeżanie statusu co 10 minut
    setInterval(updateStatus, 10 * 60 * 1000);
}

module.exports = status_handler;
