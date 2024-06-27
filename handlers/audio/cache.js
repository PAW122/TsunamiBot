const Database = require("../../db/database")
const db = new Database(__dirname + "/../../db/files/users.json")
/**
 * return ready to use formated json with songs list
 * @param {json} data all user data from db 
 */
async function get_songs(data) {
    //lista z nazwami piosenek
    let songs_list = []
    const songs = data?.songs
    if (!data || !songs) {
        return false
    }
    Object.keys(songs).forEach(key => {
        const song = songs[key];
        songs_list.push(song.song_name);
    });
    return songs_list
}

class AudioDataStore {
    constructor() {
        if (!AudioDataStore.instance) {
            this.data = {};
            this.users = new Set();
            AudioDataStore.instance = this;
        }

        return AudioDataStore.instance
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new AudioDataStore();
        }
        return this.instance;
    }

    add(username, song) {
        if (!this.data[username]) {
            this.data[username] = { songs: [] };
        }
        this.data[username].songs.push(song);
    }

    async load_songs(client) {
        const data = db.getAllKeys()

        data.forEach(async (key) => {
            const songs = db.read(`${key}.songs`)
            if (!songs) return;
            let username = null

            try {
                const user = await client.users.cache.get(key);

                if(!user) return false

                username = user.username
                if (!username) {
                    return false
                }

                //objekt nie 
                this.users.add(username)

            } catch (err) {
                return false
            }
            const dataArray = Object.values(songs);

            dataArray.forEach(song => {
                if (!song) return
                if(song.check_count <= 0) return
                this.add(username, {
                    song_name: song.song_name,
                    link: song.link,
                    added_timestamp: song.added_timestamp,
                    check_count: song.check_count
                });
            })
        })
    }

    remove(key) {
        if (this.data.hasOwnProperty(key)) {
            delete this.data[key];
            return true; // Usunięto pomyślnie
        } else {
            return false; // Klucz nie istnieje
        }
    }

    remove_song(username, song_name) {
        console.log(this.data)
        if (this.data[username]) {
            const songs = this.data[username].songs;
            const index = songs.findIndex(song => song.song_name === song_name);
            
            if (index !== -1) {
                songs.splice(index, 1); // Usuwa jeden element z tablicy na danym indeksie
                return true; // Pomyślnie usunięto
            } else {
                return false; // Piosenka o podanej nazwie nie istnieje
            }
        } else {
            return false; // Użytkownik nie istnieje
        }
    }

    is_key(key) {
        return this.data.hasOwnProperty(key);
    }

    get_by_key(key) {
        return this.data[key];
    }


    get_by_value(value) {
        const result = {};
        for (const key in this.data) {
            if (this.data.hasOwnProperty(key) && this.data[key].value === value) {
                result[key] = this.data[key];
            }
        }
        return result;
    }

    get(key) {
        return this.data[key];
    }

    get_users() {
        return this.users
    }

    get_json() {
        return Object.values(this.data).map(item => ({ name: item.name, files: item.files }));
    }
}

module.exports = { get_songs, AudioDataStore }