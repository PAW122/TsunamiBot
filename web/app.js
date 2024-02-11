const express = require("express");
const fileupload = require("express-fileupload");
const app = express();
const rateLimit = require('express-rate-limit');
const fs = require("fs")
const path = require('path');
const favicon = require('serve-favicon');
const { is_owner } = require("./routes/is_bot_owner")
const { verify } = require("./routes/veryfi_user")
const { save_server_settings, load_server_settings, save_bot_username } = require("./routes/server_settings")
const { DiscordAPIError } = require('discord.js');

const ConsoleLogger = require("../handlers/console")
const logger = ConsoleLogger.getInstance();

const GuildConsoleLogger = require("../handlers/guildConsoleLogs")
const loggerInstance = GuildConsoleLogger.getInstance();

const limiter = rateLimit({
    windowMs: 60 * 1000, // Okno czasowe (1 minuta)
    max: 60, // Maksymalna liczba żądań w oknie czasowym
    message: 'Request limit exceeded. Please try again later.',
});

app.set('trust proxy', 1);
app.use(limiter);

//strona interntowa:
app.set('view engine', 'ejs');
app.set('views', `${__dirname}\\views`);
const publicFolderPath = path.join(__dirname, 'public');
app.use(express.static(publicFolderPath));

// przesyłanie plików
app.use(fileupload());
//app.use(express.raw({ type: '*/*' }));
app.use(express.json({ limit: '10mb' }));

//web ico
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.get('/', (request, response) => {
    return response.sendFile('\\web\\views\\index.html', { root: '.' });
});

app.get('/auth/discord', (request, response) => {
    return response.sendFile('\\web\\views\\dashboard.html', { root: '.' });
});

//dodać wszystkie opcje zarządzania na stronie
app.get('/server', (req, res) => {
    return res.sendFile('\\web\\views\\server.html', { root: '.' });
})

app.get("/guildconsole/:token/:tokenType/:serverId", (req, res) => {
    return res.sendFile('\\web\\views\\guild_console.html', {root: '.'});
})

app.get("/info/:guildId", async (req, res) => {
    const { client } = require("../main");
    const guildId = req.params.guildId;

    try {
        const guild = await client.guilds.fetch(guildId);

        if (!guild) {
            // Gildia nie została znaleziona
            return res.sendStatus(404);
        }

        // Gildia została znaleziona, zwróć informacje o gildii
        return res.send(guild);
    } catch (error) {
        // Obsługa błędu, np. błąd "Unknown Guild"
        logger.error("Błąd podczas pozyskiwania informacji o gildii:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
});

//TODO do info, channels i roles dodać jakąś weryfikacje aby nikt nieporządany nie sprawdzał danych z api
app.get("/info/channels/:guildId", async (req, res) => {
    const { client } = require("../main");
    const guildId = req.params.guildId;

    try {
        const guild = await client.guilds.fetch(guildId);

        if (!guild) {
            return res.sendStatus(404);
        }

        const channels_ids = guild.channels;
        const channels = guild.channels.cache.map(channel => channel.name);

        return res.send([channels, channels_ids]);
    } catch (error) {
        if (error instanceof DiscordAPIError && error.code === 10004) {
            // Obsługa błędu "Unknown Guild"
            console.error("Gildia nieznaleziona:", error);
            return res.sendStatus(404);
        }

        // Obsługa innych błędów
        console.error("Błąd podczas pozyskiwania informacji o gildii:", error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
});


app.get("/info/roles/:guildId", async (req, res) => {
    const { client } = require("../main")
    const guildId = req.params.guildId
    try{
        const guild = await client.guilds.fetch(guildId);
        if(!guild) {
            return res.sendStatus(404);
        }

        const roles_ids = guild.roles
        const roles = guild.roles.cache.map(role => role.name)
        if (!guild) return res.sendStatus(404);
        return res.send([roles, roles_ids]);
    } catch(err) {
        logger.error("Błąd podczas pozyskiwania informacji o gildii:", err);
        return res.status(500).send({ error: "Internal Server Error" });
    }

})

//strona z pomysłami komend.
//od góry wyświetlane to co mają najwięcej up votów
//opcja dodania max 1 propozycji na godz
//czaty (dyskusje) na temat danych proopzycji
app.get('/ideas/:token/:token_type', (req, res) => {

})

//strona gdzie można zgłaszać błędy i problemy z botem
app.get("/report/:token/:token_type", (req, res) => {

})

//bot owner webside
app.get("/console/:token/:token_type", (req, res) => {
    return res.sendFile(`\\web\\views\\console.html`, { root: '.' });
})

app.get("/favicon.ico", (req, res) => {
    return res.sendFile(`\\web\\public\\favicon.ico`)
})

app.get("/console/load/:token/:tokenType", (req, res) => {
    const token = req.params.token;
    const tokenType = req.params.tokenType;
    const option = req.query.option;
    if(!token || !tokenType) {
        return res.sendStatus(500).send({ error: "Invalid params" });
    }

    verify(token, tokenType)
        .then(ver => {
            if (!ver) return res.status(10).json({ error: 'Błąd weryfikacji' });
            if (!is_owner(ver)) return res.status(11).json({ error: 'Nie jesteś właścicielem' });

            // Pobierz dane z loggera
            const consoleLogger = require("..//handlers/console");
            const loggerInstance = consoleLogger.getInstance();
            const data = loggerInstance.getLogList(option);

            // Zwróć dane w formie obiektu JSON
            res.json(data);
        })
        .catch(error => {
            logger.extra('Błąd podczas weryfikacji użytkownika: ' + error);
            res.status(500).json({ error: 'Błąd weryfikacji' });
        });
});

app.get("/load/guildconsole/:token/:tokenType/:guildId", (req, res) => {
    const token = req.params.token;
    const tokenType = req.params.tokenType;
    const guildId =  req.params.guildId;

    if(!token || !tokenType) {
        return res.sendStatus(500).send({ error: "Invalid params" });
    }
    verify(token, tokenType)
        .then(ver => {
            if (!ver) return res.status(10).json({ error: 'Błąd weryfikacji' });

            //sprawdż czy dany user jest właścicielem serwera(aby mógł zobaczyć jego logi)
            console.error("app.js 138. Sprawdż czy user ma uprawnienia do podglądu konsoli serwera. (admin/owner)");

            const data = loggerInstance.getLogs(guildId, 100);

            // Zwróć dane w formie obiektu JSON
            res.json(data);
        })
        .catch(error => {
            logger.log('Błąd podczas weryfikacji użytkownika: ' + error);
            res.status(500).json({ error: 'Błąd weryfikacji' });
        });
})

//rework
app.get("/bot/is_on_server", (req, res) => {
    const servers = req.headers.servers;
    const token = req.headers.token;
    const tokenType = req.headers.tokentype;

    //return is bot on server:
    logger.log(servers)
})

//user musi przekazywać token z zalogowania za pomocą dc, potem sprawdzane jest czy ten user jest adminem na serwerze(aby odczytać ustawienia serwera)
app.get("/server/settings/load", (req, res) => {
    const server_id = req.headers.server_id;
    const type = req.headers.type;
    const token = req.headers.token;
    const tokenType = req.headers.tokentype;

    //weryfikacja zalogowania
    verify(token, tokenType)
        .then(ver => {
            if (!ver) return res.status(10).json({ error: 'Błąd weryfikacji' });
        })
        .catch(error => {
            logger.extra('Błąd podczas weryfikacji użytkownika: ' + error);
            //res.status(500).json({ error: 'Błąd weryfikacji' });
        });
    return res.send({ data: String(load_server_settings(type, server_id)) })
})

app.get("/server/settings/bot_username", (req, res) => {
    const name = req.headers.name;
    const token = req.headers.token;
    const tokenType = req.headers.tokentype;
    const server_id = req.headers.server_id

    verify(token, tokenType)
        .then(ver => {
            if (!ver) return res.status(10).json({ error: 'Błąd weryfikacji' });
        })
        .catch(error => {
            logger.extra('Błąd podczas weryfikacji użytkownika: ' + error);
            // res.status(500).json({ error: 'Błąd weryfikacji' });
        });

    //pomyślnie zwerfikowano użytkownika

    //zapisz odpowiednie dane
    save_bot_username(name,server_id)

    // Możesz również zwrócić odpowiedź HTTP z odpowiednim statusem
    res.status(200).send("Received and updated the data successfully.");
})

//tak samo jak w /loadm ale w body musi być przekazywany json z danymi do zmiany
app.get("/server/settings/save", (req, res) => {
    // Odczytaj dane z nagłówków zapytania
    const type = req.headers.type;
    const value = req.headers.value;
    const token = req.headers.token;
    const tokenType = req.headers.tokentype;
    const server_id = req.headers.server_id

    //TODO:
    //sprawdzić czy ten zalogowany user ma właścicela w serweże o id <server_id>

    //weryfikacja zalogowania
    verify(token, tokenType)
        .then(ver => {
            if (!ver) return res.status(10).json({ error: 'Błąd weryfikacji' });
        })
        .catch(error => {
            logger.extra('Błąd podczas weryfikacji użytkownika: ' + error);
            // res.status(500).json({ error: 'Błąd weryfikacji' });
        });

    //pomyślnie zwerfikowano użytkownika

    //zapisz odpowiednie dane
    save_server_settings(type, value, server_id)

    // Możesz również zwrócić odpowiedź HTTP z odpowiednim statusem
    res.status(200).send("Received and logged the data successfully.");
})

// Middleware obsługujący nieistniejące ścieżki
app.use((req, res) => {
    res.status(404).send('this page is unavailable (404).');
    return;
});

module.exports = app;