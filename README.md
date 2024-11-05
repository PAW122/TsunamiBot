# TsunamiBot
![Lines of Code](https://img.shields.io/badge/lines%20of%20code-9168-blue)

## building
- update `config.json` to use specific config
    public is config to use TOKEN and public port
    local_dev isconfig to user TOKEN2 and local port
- add .env file and add bot token
    ```
    TOKEN=
    TOKEN2=
    ```

- build front-end:
    ```
    npm run build
    ``` 
    
- run:
    ```
    node .
    ```

---
---

## APIS setup

- Web Api:
    Public Port - 80
    Test Port - 3000

- Audio Api:
    Public Port - 3001
    Test Port - 3001

- Web Api Hosting
[https://pagekite.net] pagekite
Public http "senko.pagekite.me" Trafic -> 127.0.0.1:80 

- Audio Api Hosting
[https://login.tailscale.com] tailscale
Public Trafic -> 127.0.0.1:3001

## Data
memory usage -  +/- 55MB
wifi connection usage - 0.2MB/s - Audio stream for 1 user

## Dirs
- /api:
    + /assets - web assets<br>
    + /endpoints - http web user endpoints
        - ./actions - user actions (logout - disable auth token)
        - ./admin - only admin accounts endpoint
        - ./full_load - load all user data on 1 req to avoid ratelimit from Auth sys
        - ./full_mod_logs_load - load all moderator logs for specific server
        - ./load - all load endpoints
        - ./mod_logs - all moderators logs actions (loading logs)
        - ./save - all endpoints to save user changes in settings on webside
    + /handlers - backend universal functions
        - ./auth - user authorization and cache sys
        - ./checkServerExists - check for valid server id
    + /webpanel - frontend
        - ./config - builds configs
        - ./dir - convert ts to js for frontend
    + /api.js, app.js - run frontend and backend
    + /config - api only config

- /assets - assets for commands

- /commands
    + /moderation - commands for discord server moderation
        - ./autorole - setup autorole settings for server
        - ./clear - delete manu messages with 1 command
        - ./reload - reload all commands for one server
        - ./welocme - setup welcome messages settings
    + /normal - commands for all discord users
        - ./8ball - random res
        - ./avatar - sends marked user avatar
        - ./dashboard - link to bot webside
        - ./help - get datials about commands
        - ./idea - send your idea to developers
        - ./link - bot invite link
        - ./lvl - get your on someone lvl
        - ./ping - check is bot online
        - ./play - play audio from [https://github.com/PAW122/tsunami-client] tsunami-clients
    + /senko - commands for sending reaction images

- /db - Bot database (db without sensitive data)
    - ./backup - backup db
    - ./data - minimages db
    - ./files - all db's dir
    - .database - custom json-based db sys

- /handlers - Bot modules
    + /audio - audio sys handlers and API
        - ./api - tsunami-client api
        - ./apiV2 - new api (in development)
    + ./_save_basics_data - get basics informations about server and save to db (name...)
    + ./autorole - handler autorole when user join discord server
    + ./botStatus - auto refrest bot status
    + ./calculateLvl - calculate user lvl from xp
    + ./commandsMap - Map with all commands
    + ./console - logs sys
    + ./cooldown - cooldown handler for commands
    + ./dad_handler - dad bot handler
    + ./guildConsoleLogs - Class with logs for discord server administration
    + ./lvlhandler - mamage xp and lvl's
    + ./mod_logs_handler - save all logs for discord moderators
    + ./SlashCommandHandler - manage loading all slash commands on discord
    + ./stats_handler - TODO stats channel's manager
    + ./welcome - welcome messages manager

- /test - only test commands
    - /commands - text commands e.g: $ping
    - /handlers - test commands handlers
    - /slash - slash commands e.g: /ping

- /(main dir)
    + .config - universal bot config, contains 2 modes (local_dev - for testing and public - to run on server)
    + .main - main file -> runs everythink
    + .tsconfig - web build config



## =========================TODO=LIST==========================================
# TODO!!! Audio
!!! zmiejszyć deafultową głośność o 50%!
audip api V2:

wrzucanie piosenek na stronie internetowen, /play_user <username> <song name>

+ dodać sprawdzanie miejsca na dysku - jżeli na dysku jest mniej niż
100GB to jeżeli user posiada więcej niż 25 piosenek to  wyświetlać informację, że na serweże kończy sie miejsce i nie można ich zapisaywać

+ + opcja 2
zrobić coś ala db w go:
exe odpalany jako subproces - będzie .db z zapisem user_ID SONG_NAME FILE_NAME

i sys folderów
/users/id/files (name: user_id+file_name+ .mp3)

+ maxymalna wielkość pliku to 25mb.

! na localhost nic się nie zacina.
ogarnąć uprawnienia albo postawić wszystko na linuksie czy coś,
dodać uprawnienia do firewalla

może dodać opcję streamowania audio live (client w go) przesyłał by audio do api a api do użytkownika w czasie rzeczywistym

4. dodać opcję tworzenia playlist /playlists
playlist_name.json {queue: ["sona_name"...]}
/play-playlist station <playlist_name>
# TODO
- dodać możliwosc wybrania tła dla wecome messages
# hosting
{
    system płatności: user_id {wybrana oferta (np 1mieś)}
    logowanie: discord(+opcja podpięcia chasła do maila podłączonego do konta discord, wymaga opcji resetu chasła(system mailowy)) / google
    
    user data
    {
        każdy użytkownik ma takie samo id jka na discordzie,
        dla logowania googlem oddzielna sekcja w db

        bot data
        {
            name:
            description
            avatar
            custom commands []
            custom slash commands []
            config {

            }
            disabled messages []
            logs []
        }
    }
}
opcja wykupiuenia hostingu, podajesz token bota i dostajesz hostowaną kopię
TsunamiBota + swój panel admina (bez dostępu do db)

+ z mapy komend wczytuje wszystko, jeżeli jakaś komenda jest "włączona" to po wczytaniu jest odrazu usówana przez rejestracją,

+ opcja start, stop, restart
+ konsola gdzie pójdą wsystkie dane z loggera

+ custom commands
    - message (if user send "content" response "content")
    - slash command (prepare json)
        + dana odp dla danej opcji jeżeli jest
        + dana odp dla danego wprowadzonego stringa...

v 0.1
# teraz
zorbić taką console dal serwerów (dodano userowi role, wysłano wiadomość powitalną, user x użył komendy x )

błędnie wczytywany jest początkowy stan switcha na dashboard serwer do welcome messages

funkcja save_basics nadpisuje zmienną owner w jsonie.

naprawić backupy dla sersers.json 42-linijki i takiego samego backupu
wykrywa jako za duży backup

w klasie logger dodać zapisywanie logów .error do pliku,

napisać do np 20 małych streamerów z propozycjami zrobienia im bota.

zrobić dla database config, opcja production_database: <bool> -> jeżeli == false to tworzy kopie bazy danych, po zmienieniu spowrotem an true usuwa ją

zrobic na stronie bota logi akcji z db (message.celete itd)
na podobnej klasie co logger

napisać kod który spowoduje, że seen wyjdzie z serwerów mających > niż 10 osób
i podłączyć seena pod tsu bota

folder komend *test*
komendy są rejestrowane tylko na priv.
albo dodatek do ustawień komendy (dev_only: true)

> dodać system uzupełniania danych db. po tym jak ktoś pierwszy raz użyje bota to nie wszystkie komendy uzupełniają wszyzstkie dane (server nami itd)

# web
0. opcja wyświetlania wszyzstkich logów w konsoli na stronie (logger.extra)
    + opcja wyświetlania logów specyficznie dla danego serwera (wiadomości, eventy, itd) kiedyś
1. opcja wyłączenia komendy dla serwera (komendy typu ping)
po wyłączeniu komendy bot po załadowaniu wszyzstkich komend usówa ją z komend danego serwera
jeżeli ktoś da rade użyć tej komendy to ma dostać odpowiedź ta komenda nie jest wyłączona przez administracje

2. opcja interakcji z botem przez użytkownika nie będącym właścicielem bota.
    + jakieś interakcje z ekonomią (dzienne nagrody, sklep itd)
    + jakiś system reaction roli na stronie bota
    + ocenianie serwera (gwiazdki 1-5), lista top serwerów.
    + podgląd statystyk userów serwera (ile dany user wysłał wiadomości, siedział na vc itd) !!

3. koemnda /disable_web_settings ->
po włączeniu nie da się zmieniać ustawień serwera z poziomu strony internetowej

4. więcej ustawień welcome messages (wiadomość powitalna)

    - te opcje mają się pokazać po tym jak user kliknie w zębatkę
    wtedy pojawia się jakby takie okno wewnątrz przeglądarki które pokazuje więcej opcji

    + (automatyczne wczytywanie) wszystkich danych po załadowaniu strony

    + opcja klioknięcia znaku ? który pokaże jak użyć nicku usera w wiadomości
    + wiadomość pv
    + wiadomość na kanale
    + konfiguracja tła

5. bot client panel
    + wybieranie serwera po nazwie lub id
    + sprawdzanie userów
    + ról
    + kanałów
    + ustawień kanałów
    + wiadomości na kanałach
    + wszystkie akcje jak wysyłanie wiadomości itd

6. podgląd bazy danych na stronie
7. ustawianie nicku bota na stronie
8. dodać jakieś staty
    + ilość użytych komend 24h
    + ilość serwerów
    + ilość userów
    + 
9. podgląd statystyk userów serwera (ile dany user wysłał wiadomości, siedział na vc itd)

# ekonomia
zrobić ekonomie na podstawie jakiś kart z postaciami anime
dropienie, walki itd
+ DZIAŁANIE / zasady
    1. bot tworzy kategorie z kanałami
        + drops
        + arena
        + pvp
        + tutorials

    2. bot ma działać globalnie lub serwerowo:
        - deafultowo działa serwerowo, ale admin może zmienić na globalnie

+ dropy:
    1. user może dropić co 30min komendą
    2. zależnie od wielkości serwera (userów) co x czasu będą dropy na #drops
    3. zależnie od aktuwności będą dropy na #drops (zależnie od ilości wysłanych wiadoości)

    - czas na odebranie dropu (bot sprawdza danie emoji pod wiadomością) przez 30s

+ pvp
    - globalnie
        matchmacing zależnie od rankingu

    - serwerowo
        granie z ludźmi z czatu

+ akcje z kartami
    + pvp -> wygrany bierze karte przeciwnika (walka wystawiając 3 karty)
        - 

+ dropienie kard:
    - jakość od 1 do 5
        > zależnie od jakości będzie inna ramka karty

+ statystyki
    - zapisywanie danych (dropy ile danych kard)

# lużne rzeczy do zrobienia.
.sprawdzić czy po usunięciu wszystkich plików z /files z db wszystkie bazy danych się poprawnie zainicjują i bot zadziała bez wywalania żadnych błędów

# pomysły na proste komendy
1. propozycje filmów
    każda propozycja jest do zweryfikowania, po zweryfyfiukonwaiu jak user użyhe
    /get propozycja filmu to dostaje jakąś losowa propozycje, to samo dla anime
2. propozycję anime
3. 

# pomysły na next funkcji:
1. na stronie internetowej w /console zrobić opcję wykonywania poleceń
    - np zarządzanie plikami bazy danych (edytowanie)
    - opcja używania komend w konsoli
        + reload(srv_id)
        + reload("global")

- pomysł: config
    - robić wszystkie komendy w 1 bocie, w configu dodać nazwy folderów które są pomijane np dla tsu pomijane bedą Albion, a dla albiona Tsu
    > dont_user_folders_name_list.forEach(name => {
        if(folder_name == name) return;
    })

2. tickety
    - system reportów błędów na /support <message>
    - zapisuje wiadomość od użytkownika w tickets.js "user_id": { user_name, server id on what command was used, time (date), report(text message)}
    - tejcety jednego usera mają być listą []
    - opcja user_ban.
        > po włączeniu bota z tickets.js: "bans": [] zostaje wczytywana lista id które mają bana na tworzenie ticketów np jak ktoś by spamował, jeżeli ticketa stworzy user z zbanowanym id to jego ticket nie zostaje przyjęty, może otrzymywać wiadomość, że nadużył systemu support i ma bana na używanie tej komendy

# db functions
1. cache
    - jeżeli bot wczytuje coś z jsona, ta zmienna nie będzie się zmieniała np lista zbanowanych osób to można tworzyć jakąś listę rzeczy które można odczytać z pamięci
    - .cache(path, data_name) data_name -> nazwa do której można się odwołać jeżeli chcemy odczytać dane
    - .read(data_name) odczytuje dane zapisane pod daną nazwą
    - .refresh(data_name) odświerza dane (wczytuje zmiany z pliku .js) -> wykonywane np po tym jak dodamy nowego usera do takiej listy np za pomocą .write()

2. wave_reac: --db-config oszczędzanie użycia odczytu dysku
    - wszystkie pliki json są zapisywane w pamięci ram i znie uzyskiwane są dane .read() itp
    - jeżeli zostanie zapisane coś w danym pliku to wtedy dane w pamięci ram zostają odświerzone

3. boards: tablice danych
    - system zapisywania danych "jednego pliku" w wielu plikach.
    - zasada działania > powstaje główny plik np logs.js tylko z parametrami key np zawierający tylko id gildi + nazwę / lokalizację pliku zawierającego dane dla tego elementu.
    > w ten sposób można skalować bazę danych dla czystych plików json.

# komendy do zrobienia
+ /reaction ?wybierz nazwę reakcji?
    > komenda ma wywyłać emotk które tsu używa np w filmikach na yt itd

+ /automatycznie powiadomia na kanał po wrzuceniu filmu na yt
+ /automatycznie powiadomia na priv po wrzuceniu filmu na yt
+ /automatycznie powiadomia na kanał po rozpoczęciu live ttv
+ /automatycznie powiadomia na pv po rozpoczęciu live ttv

+ /autorole
+ /reload
    > przeładowuje / commands

+ /ruletka <dodajesz od 1 do 5 osób do ruletki i zawsze 1 osoba odpada>
+ /random <min liczba> <max liczba>
+ ekonomia
    - moenty za:
        + lvl
        + x wiadomości na kanałach
        + ogólną aktywność
        + dzienne nagrody
        + ruletka o monety
        + urodziny
    - sklep:
        + zmiana koloru rangi
        + jakieś boosty
        + rangi vip
        + kupno własnego kanału na x czasu
    - eventy
        + kalendarz adwentowy
        + inne givaey na święta np: wielkanoc, nowy rok itd

+ server setup
    - opcja stworzenia serwera od zera z np jakiegoś szablonu

# wydajność



# strona internetowa
- Dashboard:
    + logowanie z dc
    + wylogowanie
    + ilsta serwerów na których jesteś
        - przycisk do dodania bota na serwer
        - przzycisk do ustawień serwera
            + kanały z statami
            + powiadomienia z yt, TTV
            + ustawiani nicku bota na serweże
            + opcja customowej komendy(max5)
            + zarządzanie komendami
                - wyłączanie
                - włączanie
                - wyszukiwanie komendy po nazwie
                - blacklist channels
                    > na danym kanale user nie może użyć tej komendy
    + powitania
        - ustawianie textu
        - baneru(tła)
        - kanału
    + logi wszystkiego
    + autorole
    + reactionrole (max10/serwer)
    + system lvlowania
    + możliwosć napisania i wysłania embeda z strony bota


    + ilsta komend z opisami
    + lista updatów bota
    + dokumentacja
        - opisy, screany itd wszystkich komend
    + sprawdzanie czy konto nie jest altem
        - podejmowanie odpowedniego działania np:
            > dodanie specjalnej roli
            > zbanowanie
            > kick
            > przerwa na x godzin
    + logowanie chistorii wiadomości z serwera
        - opcja przywrócenia kanału z chistorią do 100 wiadomości wstecz
    + statystyki serwera (wykresy)
        - ilość osób dołączających w określinym czasie
        - bany
        - kicki
        - wiadomości / wiadomości na danym kanale
        - aktywność (ile osób było online średnio cały czas)
    + birthday
        - dodajesz kiedy masz urodziny.
        - jeżeli admin skonfiguruje to na odpowiednim kanale wyświetli się informacje jakie osoby mają dzisiaj urodziny.
        - datę można edytować 1 raz, edycja odnawia się 90 dni

    + opcja podłączenia konta twitch, jeżeli ktoś ma suba u mie lub u tsu to odblokowuje funkcje premium:
        - śledzenia presonalnych statystyk
        - bycie na liście sponsorów
        - opcja wcześniejszego testowania funkcji
            + dodać folder testowy
                > każda komenda w tym foldeże jest dostępna tylko dla osób z subem
                > komendy testowe będą na prefix
    + usówanie linków do serwerów dc
