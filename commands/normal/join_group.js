const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/servers.json")

const command = new SlashCommandBuilder()
    .setName("join_group")
    .setDescription("join new group")
    .addStringOption((option) => option
        .setName("channel_name")
        .setDescription("group name")
        .setAutocomplete(true)
        .setRequired(true)
    )

    async function execute(interaction, client) {
        db.init();
        const channelName = interaction.options.getString('channel_name'); // Użyj wybranego kanału
        const server_id = interaction.guild.id;
        const user_id = interaction.user.id;
    
        const channels = db.read(`${server_id}.groups.channels`);
        if (!channels) {
            return interaction.reply({ content: 'Brak dostępnych kanałów.', ephemeral: true });
        }
    
        // Znalezienie kanału na podstawie nazwy
        const channelData = Object.values(channels).find(channel => {
            return channel.data.chanenl_name === channelName; // Użyj poprawnego klucza
        });
    
        if (!channelData) {
            return interaction.reply({ content: 'Nie znaleziono kanału.', ephemeral: true });
        }
    
        const roleId = channelData.data.role_id; // ID roli, którą chcemy dodać
    
        // Dodanie roli użytkownikowi
        const member = interaction.guild.members.cache.get(user_id);
        if (!member) {
            return interaction.reply({ content: 'Nie znaleziono użytkownika.', ephemeral: true });
        }
    
        try {
            await member.roles.add(roleId);
            return interaction.reply({ content: `Dodano Ci rolę, abyś mógł widzieć kanał: ${channelName}`, ephemeral: true });
        } catch (error) {
            console.error('Błąd podczas dodawania roli:', error);
            return interaction.reply({ content: 'Wystąpił błąd podczas dodawania roli.', ephemeral: true });
        }
    }
    

async function autocomplete(interaction) {
    db.init();
    const server_id = interaction.guild.id;

    const channels = db.read(`${server_id}.groups.channels`);
    if (!channels) {
        return;
    }

    // Pobranie tekstu podanego przez użytkownika
    const focusedValue = interaction.options.getString('channel_name');

    // Filtrowanie kanałów na podstawie podanego tekstu
    const filteredChannels = Object.values(channels).filter(channel => {
        const channelName = channel.data.chanenl_name; // Użyj poprawnego klucza
        return channelName && channelName.toLowerCase().includes(focusedValue.toLowerCase());
    });

    // Przygotowanie odpowiedzi do autouzupełniania
    const choices = filteredChannels.map(channel => ({
        name: channel.data.chanenl_name, // Nazwa do wyświetlenia
        value: channel.data.chanenl_name // Wartość do zwrócenia
    }));

    // Sprawdzenie, czy są jakieś wybory
    if (choices.length === 0) {
        return await interaction.respond([{ name: 'Brak wyników', value: 'brak' }]);
    }

    // Odpowiedź na interakcję autouzupełniania
    await interaction.respond(choices);
}


async function help_message(interaction, client) {
    interaction.reply({
        content: `view your level information`,
        ephemeral: true
    })
}

module.exports = { command, execute, help_message, autocomplete };
