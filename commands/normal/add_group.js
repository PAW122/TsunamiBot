const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/servers.json")

const command = new SlashCommandBuilder()
    .setName("add_group")
    .setDescription("add new group")
    .addStringOption((option) => option
        .setName("name")
        .setDescription("ste group name")
        .setRequired(true)
    )

async function execute(interaction, client) {
    const name = interaction.options.getString("name")
    db.init()

    if (!name || name.length > 64) {
        return await interaction.reply("Invalid group name")
    }
    /*
    jeżeli istnieje już kategoria "groups" to stwórz w niej kanał
    jak ne to stwórz kategorię

    TODO:
    dodać limit x grup / usera
    */

    const server_id = interaction.guild.id;
    const user_id = interaction.user.id

    const data = db.read(`${server_id}.groups`)

    const groups_settings = data.settings
    if (!groups_settings || !groups_settings.status || groups_settings.status != true) {
        return interaction.reply({ content: 'Groups are disabled on this server.', ephemeral: true });
    }

    const category_id = data.settings.category_id
    if (!category_id) {
        return await interaction.reply("this function is disbaled on this server")
    }

    const category = interaction.guild.channels.cache.get(category_id);

    if (category && category.type === 4) { // Sprawdzenie, czy kanał istnieje i czy jest kategorią

        // Sprawdzenie, czy w kategorii istnieje kanał o podanej nazwie
        const existingChannel = interaction.guild.channels.cache.find(
            channel => channel.name === name && channel.parentId === category_id
        );

        if (existingChannel) {
            return await interaction.reply("channel with this name arleady exist")
        } else {

            // Tworzenie kanału
            const newChannel = await interaction.guild.channels.create({
                name: name,
                type: 0, // Typ 0 to kanał tekstowy
                parent: category.id, // Umieszczenie kanału w kategorii
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // ID serwera (wszyscy użytkownicy)
                        deny: ['ViewChannel'], // Odrzucenie dostępu dla wszystkich
                    },
                    {
                        id: interaction.guild.roles.everyone.id, // Rola @everyone
                        deny: ['ViewChannel'], // Odrzucenie dostępu dla użytkowników bez ról
                    }
                ]
            });
        

            let role_name = name;

            // Sprawdzenie, czy rola o takiej nazwie już istnieje
            let role = interaction.guild.roles.cache.find(role => role.name === role_name);
            let counter = 1;

            // Jeśli rola już istnieje, dodaj licznik do nazwy
            while (role) {
                role_name = `${name}-${counter}`;
                role = interaction.guild.roles.cache.find(role => role.name === role_name);
                counter++;
            }

            // Tworzenie roli
            role = await interaction.guild.roles.create({
                name: role_name
            });

            await newChannel.permissionOverwrites.create(role, {
                ViewChannel: true, // Pozwól roli widzieć kanał
            });

            // Zapisanie zmiennych
            const channel_id = newChannel.id;
            const role_id = role.id;

            // zapisz do db
            db.write(`${server_id}.groups.channels.${channel_id}`, {
                data: {
                    channel_id: channel_id,
                    chanenl_name: name,
                    role_name: role_name,
                    role_id: role_id,
                    created_by: user_id,
                }
            });

            return await interaction.reply(`Grupa ${name} pomyślnie stworzona. użyj **/join-group** aby dołączyć do grupy`)
        }
    } else {
        return await interaction.reply("groups category dosn't exist")
    }

    //czy istnieje kanał o takiej nazwie


}

//return message if user use /help/ping
async function help_message(interaction, client) {
    interaction.reply({
        content: `create new group\nonly if groups are enabled on the server by administration`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message };
