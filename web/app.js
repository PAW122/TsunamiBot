const express = require("express");
const fileupload = require("express-fileupload");
const app = express();
const rateLimit = require('express-rate-limit');
const fs = require("fs")
const path = require('path');
const favicon = require('serve-favicon');
const { is_owner } = require("./routes/is_bot_owner")
const { verify } = require("./routes/veryfi_user")

const ConsoleLogger = require("../handlers/console")
const logger = ConsoleLogger.getInstance();

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

app.get("/console/load/:token/:tokenType", (req, res) => {
    const token = req.params.token;
    const tokenType = req.params.tokenType;

    verify(token, tokenType)
        .then(ver => {
            if (!ver) return res.status(10).json({ error: 'Błąd weryfikacji' });
            if (!is_owner(ver)) return res.status(11).json({ error: 'Nie jesteś właścicielem' });

            // Pobierz dane z loggera
            const consoleLogger = require("..//handlers/console");
            const loggerInstance = consoleLogger.getInstance();
            const data = loggerInstance.getLogList();

            // Zwróć dane w formie obiektu JSON
            res.json(data);
        })
        .catch(error => {
            logger.extra('Błąd podczas weryfikacji użytkownika: ' + error);
            res.status(500).json({ error: 'Błąd weryfikacji' });
        });
});


//user musi przekazywać token z zalogowania za pomocą dc, potem sprawdzane jest czy ten user jest adminem na serwerze(aby odczytać ustawienia serwera)
app.get("/server/settings/load", (req, res) => {

})
//tak samo jak w /loadm ale w body musi być przekazywany json z danymi do zmiany
app.post("/server/settings/save", (req, res) => {

})

// Middleware obsługujący nieistniejące ścieżki
app.use((req, res) => {
    res.status(404).send('this page is unavailable (404).');
    return;
});

module.exports = app;