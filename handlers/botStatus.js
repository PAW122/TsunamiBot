const ConsoleLogger = require("./console")
const logger = ConsoleLogger.getInstance();

function status_handler(client, config) {
    // console.log(config)
    creationDateArray = config.creationDate
    var updateBirthdayStatus = true
    if (!creationDateArray || creationDateArray.length < 2) {
        updateBirthdayStatus = false;
        console.log("invalid creationDate value in config file")
    }

    function updateStatus(creationDateArray) {
        console.log(creationDateArray)
        // const today = new Date();
        // const isDecember21 = today.getDate() === 21 && (today.getMonth() + 1) === 12;
        // const creationDate = new Date(creationDateArray[0] || 2023, creationDateArray[1] - 1 || 11, creationDateArray[2] || 21);
        // let age = today.getFullYear() - creationDate.getFullYear();

        // const isBeforeAnniversary =
        //     today.getMonth() < creationDate.getMonth() ||
        //     (today.getMonth() === creationDate.getMonth() && today.getDate() < creationDate.getDate());

        // if (isBeforeAnniversary) {
        //     age--;
        // }

        const serverCount = client.guilds.cache.size;
        const statusText = `Watching ${serverCount} servers\n`;

        // if (isDecember21 && updateBirthdayStatus) {
        //     statusText = `${statusText}Celebrating ${age} birthday 🎂`
        // }

        client.user.setActivity(statusText)
        logger.extra(`odświerzono user.setActivity(${statusText})`)
    }

    // Pierwsze ustawienie statusu po uruchomieniu
    updateStatus(creationDateArray);

    // Odświeżanie statusu co 10 minut
    setInterval(updateStatus, 10 * 60 * 1000);
}

module.exports = status_handler;
