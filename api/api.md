# todo
+ /load/server-list-not-admin
    - zmienić tak aby dawało też listę serwerów gdzie user ma admina/owner ale bota tam nie ma,
    taki server będzie podświetlany w jakiś sopsób,
    po kliknięciu otworzy się zapka bota na serwer

+ /save i /load i handler
    > do powiadomień o tym że bot jest online

+ /load/user_lvl
    > wczytywanie lvl i ilości wysłanych wiadomości

+ endpoint do zmieniania tła w Welcome
+ endpoint do edytowania ewlcome message, pv
+ coś w stylu credits
+ coś na wzór bloga ze zmianami w bocie - powiadomienia o nowych komendach itp

+ dodać przycisk do zapraszania bota na serwer

+ dodać admin panel
    - oczytywanie /ideas

+ serwerowa konsola

+ kanały statystyki
    > kanał głosowy na który nikt nie może wbić wyświtlający dane np online users itp

# commands todo
+ /report -> zgłaszanie błędów + admin panel do odczytywania
+ /flags -> przepisać komendę z SEEN-

# web
 # admin page
 + wyświetlać ilość wejść na stronę i użyć komend z ostatnich 24h
 + configi do wyłączania pojedyńczych komend lub całych funkcji (np mod_logs)
 + opcja przeładowania komend dla konkretnego serwera lub globalnie
 + odczytywanie logów z /handlers/console.js
 + powiadomienia o błędach (jakaś ikonka dzwonka powiadomień w rogu)
 + odczytywanie i odpowiadanie na /idea i /report

 - (może) coś ala bot client do przeglądania serwerów.

 # user page
 + /idea -> coś ala redit z up i down votami dla pomysłów na komendy bota
 + ustawienia bota dla serwera
 + logi z /handlers/guildConsoleLogs
 + opcja włączenia "public server"
    > gdzieś z boku strony albo na podstronie będzie po wejściu wyświetlane randomowe 10 serwerów na które user może dołączyć
 + przycisk invite który odpala zapkę bota w nowej karcie
 + przycisk docs z opisami wszsytkich komend bota (+ przy każdek komendzie ikonka zielona lub czerwona kropka oznaczająca czy jakaś z komend jest wyłączona w configu bota)

 # no admin user page (pomysł do omówienia)
 > jeżeli user wejdzie na stronę może zobaczyć jakieś dane o serweże na którym jest bota ale sam user nie ma uprawnień administratora.
 
 > np staty o ilości godz na kanałach, ilość wiadomości z tyg, toplistę kto ma największy lvl, kto jest adminem serwera