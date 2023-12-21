const express = require("express");
const fileupload = require("express-fileupload");
const app = express();
const rateLimit = require('express-rate-limit');
const fs = require("fs")
const path = require('path');

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

// Middleware obsługujący nieistniejące ścieżki
app.use((req, res) => {
    res.status(404).send('this page is unavailable (404).');
    return;
});

module.exports = app;