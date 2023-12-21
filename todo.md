v 0.1

# pomysły na next funkcji:
1. logi wiadomości
    - zrobić jsona servers_logs.js { "server_id": "channel_id": "message_id": "message_data"}

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