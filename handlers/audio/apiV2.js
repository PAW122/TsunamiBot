const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const config = require("../../config.json")
let port_ = config[config.using].audio_port
let audio_station_banned_names = config[config.using].audio_station_banned_names
const aduio_file_path = config[config.using].aduio_file_path
const port = process.env.PORT || port_;
/*
v2 tego api
zrobić to tak aby działało na więcej urządzeń
// https://tsunami-server.tail3898e.ts.net
*/


class DataStoreV2 {
    constructor() {
        if (!DataStoreV2.instance) {
            this.data = {};
            this.cache = {};
            DataStoreV2.instance = this;
        }

        return DataStoreV2.instance
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new DataStoreV2();
        }
        return this.instance;
    }

    add(key, value) {
        const existingKey = Object.keys(this.data).find(k => this.data[k].name === value.name);
        if (existingKey) {
            console.log(`Element z nazwą "${value.name}" już istnieje. Nie można dodać nowego elementu.`);
            return false;
        }
        this.data[key] = value;
        return true;
    }

    remove(key) {
        if (this.data.hasOwnProperty(key)) {
            delete this.data[key];
            return true; // Usunięto pomyślnie
        } else {
            return false; // Klucz nie istnieje
        }
    }

    exists(key) {
        return this.data.hasOwnProperty(key);
    }

    get_by_key(key) {
        return this.data[key];
    }


    get_by_name(name) {
        const result = {};
        for (const key in this.data) {
            if (this.data.hasOwnProperty(key) && this.data[key].name === name) {
                result[key] = this.data[key];
            }
        }
        return result;
    }

    get() {
        return this.data;
    }

    get_json() {
        return Object.values(this.data).map(item => ({ name: item.name, files: item.files }));
    }
}

const DataStore = DataStoreV2.getInstance()

async function AudioApiV2() {

    const io = require('socket.io')(3001);

    function send(name) {
        const user = DataStore.get_by_name(name)
        const sock = user.socket
        sock.emit("Res", "My message")
    }

    io.on('connection', (socket) => {
        console.log('New connection socket.io.');


        socket.on('wiadomosc', (data) => {
            //get user message
            const client_name = data.name

            DataStore.add(client_name, {socket: socket})
        });

        // send res
        socket.emit('gello', 'Witaj, klient Go!');
    });

}

module.exports = { AudioApiV2, DataStoreV2 }