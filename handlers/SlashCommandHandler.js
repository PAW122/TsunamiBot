const fs = require('fs');

async function register_slash_commands(client) {
    const commandsDir = fs.readdirSync(__dirname + `\\..\\commands`);

    // Iterate through each guild the bot is a member of
    client.guilds.cache.forEach(async (guild) => {
        for (const folder of commandsDir) {
            const commandsFile = fs.readdirSync(__dirname + `\\..\\commands\\${folder}`).filter(file => file.endsWith(".js"));

            for (const file of commandsFile) {
                const filePath = __dirname + `\\..\\commands\\${folder}\\${file}`;
                delete require.cache[require.resolve(filePath)]; // Clear the cache
                const { command, _ } = require(filePath);

                try {
                    // Register command on the specific guild
                    await guild.commands.create(command);
                    //console.log(`Command registered on guild ${guild.id}: ${command.name}`);
                } catch (error) {
                    console.log(command)
                    console.error(`Error registering command ${command.name} on guild ${guild.id}:`, error);
                }
            }
        }
    });

    console.log("All commands registered successfully on all guilds.");
}


async function unregisterAllCommands(client) {
    try {
        const commands = await client.application.commands.fetch();

        for (const command of commands.values()) {
            await client.application.commands.delete(command.id);
        }

        console.log('All commands unregistered successfully.');
    } catch (error) {
        console.error('Error while unregistering commands:', error);
    }

    //po usunięciu komend dodaj je na nowo tak aby usunięte komendy zostały nadpisane przez nowe
    register_slash_commands(client)
}

module.exports = {unregisterAllCommands, register_slash_commands}