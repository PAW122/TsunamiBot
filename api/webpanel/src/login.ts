export class auth {
    token: { [name: string]: string | null, } = {
        token: null,
        token_type: null
    }

    constructor() {
        this.token = this.readURL()
        if (this.token.token === null) {
            console.debug("token not found in URL. Loading token from cache")
            this.token = this.load_cached()
        }
        this.save_cache()
        console.debug(`Final token: `, this.token)
    }

    readURL() {
        let urlParams = new URLSearchParams(window.location.hash);
        let token = urlParams.get("access_token");
        let token_type = urlParams.get("#token_type");
        console.debug("token in url: ", { token: token, token_type: token_type })
        if (token && token_type) {
            window.location.hash = ""
            return { token: token, token_type: token_type }
        }
        return { token: null, token_type: null }
    }

    load_cached({ token_path = "token", token_type_path = "token_type" } = {}) {
        let token = localStorage.getItem(token_path)
        let token_type = localStorage.getItem(token_type_path)
        console.debug("cache content: ", { token: token, token_type: token_type })
        if (token && token_type) {
            return { token: token, token_type: token_type }
        }
        return { token: null, token_type: null }
    }

    save_cache({ token_path = "token", token_type_path = "token_type" } = {}) {
        localStorage.setItem(token_path, this.token.token ? this.token.token : "")
        localStorage.setItem(token_type_path, this.token.token_type ? this.token.token_type : "")
    }

    dispose() {
        this.token = { token: null, token_type: null }
        this.save_cache()
    }
}