class Auth{

}

/*
    1. podobnie jak web auth wszsytko może być w cache
    jeżeli coś nie jest w cache to sprawdź w db i zapisz informację
    doczytyuj do cache dane z db w momencie kiedy jakiś nowy użytkownik wygeneruje token lub na endpoincie refresh


    # /api/v1/token_cache_refresh
    załużmy że user jest na 5 serwerach, po wykonaniu np addcustomcommand <server_id> jego dane lądują w cache na x minut
    jeżeli przed odświerzeniem / usunięciem w cache użytkownik dołączy na nowy serwer to nie będzie mógł użyć komend związanych z tym serwerem.
    dlatego w takim momencie musi użyć token_cache_refresh aby wczytać informację że dołączył na nowy serwer

*/