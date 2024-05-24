class Flags_handler {
    constructor() {
        if (!Flags_handler.instance) {

            this.cache = []
            Flags_handler.instance = this
        }
        return Flags_handler.instance
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new Flags_handler()
        }

        return this.instance
    }

    set(user_id, correctAnswers) {
        this.cache[user_id] = correctAnswers
        console.log(user_id)
        console.log(correctAnswers)
    }

    check_answer(user_id, answer) {
        if (this.cache[user_id] && this.cache[user_id] === answer) {
            return {correctAnswers: this.cache[user_id], result: true}
        } else {
            return {correctAnswers: this.cache[user_id], result: false}
        }
    }

    clear(user_id) {
        delete this.cache[user_id]
    }

}

module.exports = Flags_handler