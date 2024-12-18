/*
    bot będzie z automatu tworzył rolę ticket - review ktora uprawnia do zarzadzania
    ticketami, albo jako opcjonalny argument można będzie podać 
    ticket-review-role i ta rola bedzie uprawniala do akcji z ticketami.

    *ratings
        > true po zamknięciu ticketu tworzona jest ala ankieta satysfakcji
        > false po zamknięciu przechodzi do delete_on_close
        
    *delete_on_close
        > true -> jeżęli rating = true to po zostawieniu opini / 24h kanał jest usuwany
        > false -> kanał jest przenoszony do innej kategori np closed_tickets

    /ticket_settings ratings <bool> delete_on_close <bool>
*/