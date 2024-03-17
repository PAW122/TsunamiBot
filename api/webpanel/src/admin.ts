// this file is a template, which will be replaced
import { drawServers } from "./ServerList.js"
import * as config from "./config.js"
import { navbarStyle } from "./helpers.js"
import { auth } from "./login.js"
import { genSettings, setting, genTextBox, addTooltip, genCheckBox } from "./settings.js"

window.onload = initial
const loginManager = new auth()

// main.ts
function initial() {
    navbarStyle();
    if (String(config.MainURL) === "http://localhost:3000") {
        document.getElementById("test-banner")?.classList.remove("d-none")
    }
    let login_button = document.getElementById("login-button") as HTMLLinkElement
    login_button.href = config.AuthURL

    const loginButton = document.getElementById("login-button");
    if (loginManager.token.token && loginButton) {
        document.querySelectorAll(".profile-login").forEach(function (el) {
            el.classList.remove("d-none");
        })
        // Ukryj przycisk login
        loginButton.classList.add("d-none");
        login();
        // doFetch(`${config.MainURL}/load/server-list/${loginManager.token.token_type}/${loginManager.token.token}`, login)
    } else {
        // Ukryj przycisk logout
        const logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
            logoutButton.classList.add("d-none");
            // Ukryj okienko z "username"
            const usernameWindow = document.getElementById("username-text");
            if (usernameWindow) {
                usernameWindow.classList.add("d-none");
            }
        }
    }
    window["lm"] = loginManager
}

async function login() {
    let response = await fetch(`${config.MainURL}/admin/content/${loginManager.token.token_type}/${loginManager.token.token}`);
    let json = await response.json();
    if (json?.error && json.error === "invalid_token") {
        loginManager.dispose();
        window.location.reload();
    }

    const serverCountSpan = document.getElementById('server-count')
    if (serverCountSpan !== null) {
        serverCountSpan.innerText = json.servers_count.toString()
    }

    document.querySelector("#logout-button")?.addEventListener("click", function () {
        fetch(`${config.MainURL}/actions/logout/${loginManager.token.token_type}/${loginManager.token.token}`)
        loginManager.dispose();
        window.location.reload();
    });
}

async function load_ideas_json() {
    try {
        let response = await fetch(`${config.MainURL}/admin/load/ideas/${loginManager.token.token_type}/${loginManager.token.token}`)
        let json = await response.json();
        const data = json
        // Znajdź kontener, do którego będziemy dodawać informacje o serwerach
        const settingsContainer = document.getElementById('settings_container');
        if (settingsContainer) {
            // Wyczyść zawartość settingsContainer przed wyświetleniem nowych danych
            settingsContainer.innerHTML = '';

            // Konwertuj obiekt na tekst w formacie JSON
            const jsonString = JSON.stringify(data, null, 2);

            // Utwórz element <textarea> i ustaw jego zawartość na tekst JSON
            const textarea = document.createElement('textarea');
            textarea.value = jsonString;

            // Dodaj stylowanie dla textarea
            textarea.style.width = '100%';
            textarea.style.height = '300px';
            textarea.style.resize = 'vertical'; // Umożliwia tylko pionowe przewijanie

            // Dodaj element <textarea> do settingsContainer
            settingsContainer.appendChild(textarea);
        } else {
            console.error('Nie można znaleźć elementu o identyfikatorze "settings_container"');
        }
    } catch (err) {
        console.log(err)
    }
}

async function save_ideas_json() {
    const settingsContainer = document.getElementById('settings_container');
    if (settingsContainer) {
        const textarea = settingsContainer.querySelector('textarea');
        if (textarea instanceof HTMLTextAreaElement) {
            const dataToSave = textarea.value; // Tutaj uzyskujemy zawartość textarea

            // Tworzymy obiekt z opcjami żądania
            const requestOptions = {
                method: 'POST', // Ustawiamy metodę na POST
                headers: {
                    'Content-Type': 'application/json' // Określamy typ zawartości jako JSON
                },
                body: JSON.stringify({ data: dataToSave }) // Przypisujemy dane do pola body jako JSON
            };

            // Wykonujemy żądanie POST
            try {
                const response = await fetch(`${config.MainURL}/admin/save/ideas/${loginManager.token.token_type}/${loginManager.token.token}`, requestOptions);
                if (response.ok) {
                    console.log('Pomyślnie zapisano dane');
                } else {
                    console.error('Błąd podczas zapisywania danych:', response.statusText);
                }
            } catch (error) {
                console.error('Błąd podczas wykonywania żądania POST:', error);
            }
        } else {
            console.error('Nie można znaleźć elementu textarea wewnątrz settings_container');
        }
    } else {
        console.error('Nie można znaleźć elementu o identyfikatorze "settings_container"');
    }
}

async function load_partners_json() {
    // Wczytanie danych z pliku partners.json
    try {
        let response = await fetch(`${config.MainURL}/admin/load/partners.json/${loginManager.token.token_type}/${loginManager.token.token}`)
        let json = await response.json();
        const partners = json.partners
        // Znajdź kontener, do którego będziemy dodawać informacje o serwerach
        const settingsContainer = document.getElementById('settings_container');
        if (settingsContainer) {
            // Wyczyść zawartość settingsContainer przed wyświetleniem nowych danych
            settingsContainer.innerHTML = '';

            // Konwertuj obiekt na tekst w formacie JSON
            const jsonString = JSON.stringify(partners, null, 2);

            // Utwórz element <textarea> i ustaw jego zawartość na tekst JSON
            const textarea = document.createElement('textarea');
            textarea.value = jsonString;

            // Dodaj stylowanie dla textarea
            textarea.style.width = '100%';
            textarea.style.height = '300px';
            textarea.style.resize = 'vertical'; // Umożliwia tylko pionowe przewijanie

            // Dodaj element <textarea> do settingsContainer
            settingsContainer.appendChild(textarea);
        } else {
            console.error('Nie można znaleźć elementu o identyfikatorze "settings_container"');
        }
    } catch (err) {
        console.log(err)
    }
}

// Funkcja wywoływana podczas kliknięcia przycisku Save
async function save_partners_json() {
    // Pobierz zawartość textarea z elementu settings_container
    const settingsContainer = document.getElementById('settings_container');
    if (settingsContainer) {
        const textarea = settingsContainer.querySelector('textarea');
        if (textarea instanceof HTMLTextAreaElement) {
            const dataToSave = textarea.value; // Tutaj uzyskujemy zawartość textarea

            // Tworzymy obiekt z opcjami żądania
            const requestOptions = {
                method: 'POST', // Ustawiamy metodę na POST
                headers: {
                    'Content-Type': 'application/json' // Określamy typ zawartości jako JSON
                },
                body: JSON.stringify({ data: dataToSave }) // Przypisujemy dane do pola body jako JSON
            };

            // Wykonujemy żądanie POST
            try {
                const response = await fetch(`${config.MainURL}/admin/save/partners.json/${loginManager.token.token_type}/${loginManager.token.token}`, requestOptions);
                if (response.ok) {
                    console.log('Pomyślnie zapisano dane');
                } else {
                    console.error('Błąd podczas zapisywania danych:', response.statusText);
                }
            } catch (error) {
                console.error('Błąd podczas wykonywania żądania POST:', error);
            }
        } else {
            console.error('Nie można znaleźć elementu textarea wewnątrz settings_container');
        }
    } else {
        console.error('Nie można znaleźć elementu o identyfikatorze "settings_container"');
    }
}

async function bot_restart() {
    await fetch(`${config.MainURL}/admin/restart/${loginManager.token.token_type}/${loginManager.token.token}`);
}

async function bot_on() {
    await fetch(`${config.MainURL}/admin/on/${loginManager.token.token_type}/${loginManager.token.token}`);
}

async function bot_off() {
    await fetch(`${config.MainURL}/admin/off/${loginManager.token.token_type}/${loginManager.token.token}`);
}

// Partners
document.getElementById('load-button')?.addEventListener('click', () => {
    load_partners_json();
});

document.getElementById('save-button')?.addEventListener('click', () => {
    save_partners_json();
});

// Ideas
document.getElementById("ideas-load-button")?.addEventListener('click' ,() => {
    load_ideas_json();
})

document.getElementById('ideas-save-button')?.addEventListener('click' ,() => {
    save_ideas_json();
})

// Restart
document.getElementById('restart-button')?.addEventListener('click', () => {
    bot_restart();
})

document.getElementById('on-button')?.addEventListener('click', () => {
    bot_on();
})

document.getElementById('off-button')?.addEventListener('click', () => {
    bot_off();
})