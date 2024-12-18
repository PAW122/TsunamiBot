/*
    user używa /ticket title: <>,  message: <>

    bot tworzy kanał z ticketem,
    po zakonczeniu admin wpisuje komende /close_ticket i kanal jestusuwany

    tworzony kanał do ticketu bedzie zapisywany:
    servers.json -> <server_id>.tickets.<channel_id> = 
    {
        ticket_author_id
        ticket_open_time
        ticket_close_time
        ticket_opinion
    }

    
*/