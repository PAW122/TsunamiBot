class Game {
    constructor(max_players, players) {
        this.max_players = max_players;
        // players = {id, ...}
        this.Players = players;
        this.Game_data = {
            // this.board = list of 9 t-t-t boards
            board: null,
            // this.score = forEach player player_id: {points, ...}
            score: null
        };
        // lista graczy
        this.moves = []
        // ikonki (dla lobby np 3 graczy przypisac)
        // user_1 = kolko | user_2 = krzyzk | user_3 = trojkad czy cos 
        this.icons_list = ["circle", "cross", "triangle"]
        this.icons = {}
    }

    init() {

        // jezeli jest wiecej graczy niz mozliwych ikonm
        // nie mozna ich poprawnie rzypisac do userow
        if (this.max_players > this.icons_list.length) {
            return false
        }

        // create empty boards
        const single_board = [
            // null - puste | string - user_id -> zajete
            { taken_by: null },
            { taken_by: null },
            { taken_by: null },
            { taken_by: null },
            { taken_by: null },
            { taken_by: null },
            { taken_by: null },
            { taken_by: null },
            { taken_by: null }
        ]
        const full_board = [
            single_board,
            single_board,
            single_board,
            single_board,
            single_board,
            single_board,
            single_board,
            single_board,
            single_board
        ]

        this.Game_data.board = full_board

        // set all scores to 0
        this.Players.forEach(player => {
            this.Game_data.score[player.id] = 0
        });
    }

    /**
     * @param user_id
     * @param move // {board_id 1-9, square_id 1-9}
     */
    move(user_id, move) {

    }

    /**
     * sprawdza czy user moze wykonac ten ruch
     * @return {bool}
     */
    validate_move() {

    }

    /**
     * zmienia ture gracza na nastepnego:
     * this.moves - zwieksz index o 1,
     * jezeli jest poza lista to przechodz do pierwszego gracza
     */
    next_turn() {

    }

    get Board() {
        return this.Game_data.board
    }

    get Scores() {
        return this.Game_data.score
    }

    get Game_data() {
        return this.Game_data
    }
}