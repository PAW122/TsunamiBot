# api tree
 + localhost:3000/
    + /config.js
    + load/
        + server-settings/welcome_status/:tokenType/:token/:server_id
        + server-settings/welcome_channel/:tokenType/:token/:server_id
        + server-channels-list/:tokenType/:token/:server_id
        + server-settings/autorole/:tokenType/:token/:server_id
        + server-settings/get_autorole_role/:tokenType/:token/:server_id
        + server-roles-list/:tokenType/:token/:server_id
        + server-list/:token_type/:token
        + welcome_messages_content/:tokenType/:token/:server_id/
    + save/
        + auto_role_status/:tokenType/:token/:server_id/:status
        + auto_role_id/:tokenType/:token/:server_id/:role_id
        + welcome_messages_status/:tokenType/:token/:server_id/:status
        + welcome_messages_channel/:tokenType/:token/:server_id/:channel_id
        + bot_name/:tokenType/:token/:server_id/:bot_name
        + welcome_messages_content/:tokenType/:token/:server_id/:message
    + modlogs/
        + :tokenType/:token/:server_id/:filter/:elements


# todo
+ poprzenosić w main.ts syf do oddzielnych plików
+ dodać na stronie baner
+ auth
    + wygasanie tokenów po 24h
    + po wciśnięciu logout niech da req do api aby usunąć token z cache!!!
        > endpoint: /logout/tokenType/token
        > dodać do kalsy remove_token()
        > wywołać temovve_token() i wysłać req do discorda o usunięcie tokena
    + może:
        - zapisywać requesty, jeżeli wywali 429 to wczytywać ostatni req i zwracać odp jeszcze raz

+ api -> system powiadomień
    - powiadoemiania globalne
        > timesamp + data
    - powiadomienia prywatne
        > timesamp + data

    + user otrzymuje swoje ostatnie 10 powiadomień + 3 ostatnie globalne,
    powiadomienia są sortowane po timesampach

+ /load/user_lvl
    > wczytywanie lvl i ilości wysłanych wiadomości

+ endpoint do zmieniania tła w Welcome
    > ikonka zembatki na kafelku do edycji welcome, po kliknięciu przycieminić całą stronę i wyswietlić na tym nową większą kafelkę z polem do wpisywania textu dla wiadomości, dla pv, wybieranie jednego z kilku grafik na tło wiadomości
+ endpoint do edytowania welcome message, pv
+ coś w stylu credits
+ coś na wzór bloga ze zmianami w bocie - powiadomienia o nowych komendach itp

+ dodać przycisk do zapraszania bota na serwer

+ dodać admin panel
    - odczytywanie /ideas

+ serwerowa konsola

+ kanały statystyki
    > kanał głosowy na który nikt nie może wbić wyświtlający dane np online users itp

+ dodać jakąś grafikę / logo / avatar bota który będzie wyświetlany na dc po wysłaniu linku
+ dodać .ico do strony

# commands todo
+ /report -> zgłaszanie błędów + admin panel do odczytywania
+ /flags -> przepisać komendę z SEEN-

# web
 # todo
 + jeżeli user nie będzie miał żadnego serwera wspólnego z botem to w miejscu listy serwerów wyświetlić: No server's found. Invite bot on your server:  <button Invait link>
 + jakąś maxymalną długość nazwy serwera i jeżeli nazwa serwera jest dłuższa to uciąć i dodać "..." (tak aby może trochę zmiejszyć pasek z listą serwerów)
 + dodać kolejną sekcję w "/" z listą opcji (tak samo jak wybór serwerów to):
    > Dashboard (ta główna strona)
    > logs
    > Ideas (podstrona do pisania pomysłów na nowe komendy)

 # admin page
 + wyświetlać ilość wejść na stronę i użyć komend z ostatnich 24h
 + configi do wyłączania pojedyńczych komend lub całych funkcji (np mod_logs)
 + opcja przeładowania komend dla konkretnego serwera lub globalnie
 + odczytywanie logów z /handlers/console.js
 + powiadomienia o błędach (jakaś ikonka dzwonka powiadomień w rogu)
 + odczytywanie i odpowiadanie na /idea i /report
 + ustawianie statusu aktywności bota,
 + ustawianie opisu i globalnego nicku

 - (może) coś ala bot client do przeglądania serwerów.

 # user page
 + /idea -> coś ala redit z up i down votami dla pomysłów na komendy bota
 + ustawienia bota dla serwera
 + logi z /handlers/guildConsoleLogs
 + opcja włączenia "public server"
    > gdzieś z boku strony albo na podstronie będzie po wejściu wyświetlane randomowe 10 serwerów na które user może dołączyć
 + przycisk invite który odpala zapkę bota w nowej karcie
 + przycisk docs z opisami wszsytkich komend bota (+ przy każdek komendzie ikonka zielona lub czerwona kropka oznaczająca czy jakaś z komend jest wyłączona w configu bota)