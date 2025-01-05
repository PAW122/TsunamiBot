class Lobby {

    /*
    example User:
    {
        user_id: <string>
        username: <string>
    }
    */
    constructor() {
        this.Users = {}; // lista userow w lobby
        this.Games = {}; // lista rozgrywanych gier
    }

    /** 
     * @param {obj} client_id
     * @return {bool} succes
     */
    onJoin(client_id) {
        if (!client_id) {
            return false
        }
    }

    onLeave(client_id) {
        if (!client_id) {
            return false
        }
    }

    /**
     * kazda gra musi miec swoje id (id: new Game())
     */
    createNewGame() {

    }
}