import * as config from "./config.js"
import { auth } from "./login.js"

const url = window.location.href;

// server_id z linku do zmiennej
const parts = url.split('/');
const index = parts.indexOf('modlogs') + 1;
const serverId = parts[index];
const loginManager = new auth()


async function Load() {

    if(!lastLogsNumberButtonId || !lastLogsTypeButtonId) {
        return console.log("Invalid value: " + lastLogsNumberButtonId + "  " + lastLogsTypeButtonId)
    }

    console.log(`${config.MainURL}/modlogs/${loginManager.token.token_type}/${loginManager.token.token}/${serverId}/${lastLogsTypeButtonId}/${lastLogsNumberButtonId}`);

    const link: any = await fetch(`${config.MainURL}/modlogs/${loginManager.token.token_type}/${loginManager.token.token}/${serverId}/${lastLogsTypeButtonId}/${lastLogsNumberButtonId}`)
    const data = await link.json()

    load_json(data)
}

async function load_json(data: any) {
    try {
        // Znajdź kontener, do którego będziemy dodawać wiadomości
        const container = document.getElementById('container');
        if (container) {
            // Wyczyść zawartość kontenera przed dodaniem nowych wiadomości
            container.innerHTML = '';

            // Iteruj po wszystkich wiadomościach w danych JSON
            data.forEach((message: any) => {
                // Utwórz kontener dla każdej wiadomości z ramką
                const messageContainer = document.createElement('div');
                messageContainer.classList.add('message-container');
                
                // Utwórz ramkę dla kontenera wiadomości
                const frame = document.createElement('div');
                frame.classList.add('frame');
                
                // Utwórz element div, który będzie reprezentować wiadomość
                const messageElement = document.createElement('div');
                messageElement.classList.add('message');

                // Iteruj po wszystkich kluczach i wartościach w danej wiadomości
                for (const [key, value] of Object.entries(message)) {
                    const p = document.createElement('p');
                    // Ustaw tekst w elemencie p w odpowiednim formacie
                    if (key === 'author' || key === 'deleted_by') {
                        if (typeof value === 'object' && value !== null) {
                            const userObject: any = value;
                            const username = userObject.username || 'Unknown';
                            const discriminator = userObject.discriminator || '0000';
                            p.textContent = `${key}: ${username}#${discriminator}`;
                        } else {
                            p.textContent = `${key}: Unknown`;
                        }
                    } else if (key === 'timesamp') {
                        const timestamp = new Date((value as number) * 1000); // Konwersja z sekund na milisekundy
                        const formattedDate = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}:${timestamp.getSeconds().toString().padStart(2, '0')} ${timestamp.getDate().toString().padStart(2, '0')}.${(timestamp.getMonth() + 1).toString().padStart(2, '0')}.${timestamp.getFullYear()}`;
                        p.textContent = `${key}: ${formattedDate}`;
                    } else if (key === 'attachments') {
                        // Ignorujemy załączniki dla prostoty
                        continue;
                    } else {
                        // Zamień [Object object] na czytelny tekst
                        const textValue = value instanceof Object ? JSON.stringify(value) : value;
                        p.textContent = `${key}: ${textValue || ''}`;
                    }
                    // Dodaj element p do wiadomości
                    messageElement.appendChild(p);
                }

                // Dodaj wiadomość do kontenera wiadomości
                frame.appendChild(messageElement);
                messageContainer.appendChild(frame);
                container.appendChild(messageContainer);
            });
        } else {
            console.error('Nie można znaleźć elementu o identyfikatorze "container"');
        }
    } catch (err) {
        console.error(err);
    }
}







// Zmienne przechowujące ostatnio kliknięte przyciski, def
let lastLogsNumberButtonId: string | "25";//todo chyba wartość nie jest nadpisywana
let lastLogsTypeButtonId: string | "all";

// Funkcja do obsługi kliknięcia przycisku
function handleButtonClick(buttonId: string) {
    // Pobierz wszystkie przyciski
    const buttons = document.querySelectorAll('.card-body button');

    const selected_button = document.getElementById(buttonId) as HTMLElement;
    console.log(selected_button)
    
    if(selected_button.dataset.category === "logs-number") {
        lastLogsNumberButtonId = buttonId;
    } else if(selected_button.dataset.category === "logs-type") {
        lastLogsTypeButtonId = buttonId
    }

    console.log(lastLogsNumberButtonId)
    console.log(lastLogsTypeButtonId)
    console.log(".")
    

    // Iteruj po wszystkich przyciskach
    buttons.forEach(button => {
        // Rzutuj obiekt na HTMLElement, aby uzyskać dostęp do właściwości dataset
        const buttonElement = button as HTMLElement;

        // Usuń klasę btn-success ze wszystkich przycisków w tej samej kategorii
        if (buttonElement.dataset.category === document.getElementById(buttonId)?.dataset.category) {
            button.classList.remove('btn-success');
            button.classList.add('btn-secondary');
        }
    });

    // Pobierz kliknięty przycisk
    const clickedButton = document.getElementById(buttonId);
    if (clickedButton) {
        // Usuń klasę btn-secondary z klikniętego przycisku
        clickedButton.classList.remove('btn-secondary');
        // Dodaj klasę btn-success do klikniętego przycisku
        clickedButton.classList.add('btn-success');
    }
}

// Dodaj nasłuchiwanie kliknięcia dla każdego przycisku
document.querySelectorAll('.card-body button').forEach(button => {
    button.addEventListener('click', () => {
        handleButtonClick(button.id);
    });
});

const loadLogsButton = document.getElementById('load-logs-button');

loadLogsButton?.addEventListener('click', () => {
    //api req - load data
    /*
    ustawić w api max 100 elementów load,
    weryfikacja (AuthV2)
    dla All wczytwać z każdego rodzaju logów ostatnie 25 i po timesampach dodać do listy ostatnie logi (tak aby ich ilość nie była większa niż <liczba>
        elementów które chce user (dodawać coraz starsze aż lista będzie max czyli np 100 elementów))


        + TODO
        opcja wybrania daty od kiedy mają być sprawdzane logi np logi sprzed tygodnia. (data zamieniana na timesamp...)
        max w stecz to 1mieś, podczas wczytywania logów usówać te które są starsze niż 1 miesiąc,
        dodać funkcję do panelu admina która przeleci po db i wyczyści stare logi
        
        + dodać do panelu admina podgląd wagi plików w db
    */
    Load()
    console.log('Przycisk "Load" został kliknięty!' + " parametry: " +lastLogsNumberButtonId + "  " +  lastLogsTypeButtonId);
});