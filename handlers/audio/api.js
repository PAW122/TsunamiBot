const http = require("http");
const express = require("express");
const axios = require("axios")
const fs = require("fs")
const bodyParser = require('body-parser');

const config = require("../../config.json")
let port_ = config[config.using].audio_port
let audio_station_banned_names = config[config.using].audio_station_banned_names
const aduio_file_path = config[config.using].aduio_file_path
const port = process.env.PORT || port_;
const app = express();
app.use(bodyParser.json());


class DataStore {
    constructor() {
        if (!DataStore.instance) {
            this.data = {};
            this.cache = {};
            DataStore.instance = this;
        }

        return DataStore.instance
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new DataStore();
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

    is_key(key) {
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

class SongManager {
    constructor() {
        if (!SongManager.instance) {
            this.cache = {};
            SongManager.instance = this;
        }

        return SongManager.instance;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new SongManager();
        }
        return this.instance;
    }

    playing(fileName, filePath) {
        //działa
        console.log("Playing: " + fileName)
        if (!this.cache[fileName]) {
            this.cache[fileName] = {
                filePath: filePath,
                playCount: 1
            };
        } else {
            this.cache[fileName].playCount++;
        }
    }

    notPlaying(fileName) {
        console.log("Not playing: " + fileName)
        if (this.cache[fileName]) {
            if (this.cache[fileName].playCount > 0) {
                this.cache[fileName].playCount--;
            }

            if (this.cache[fileName].playCount === 0) {
                delete this.cache[fileName];
            }
        }
    }
}

let data = DataStore.getInstance()
app.get("/ping", (req, res) => {
    return res.json({ ok: 200 })
})

app.post("/connect/:station_name", async (req, res) => {
    let ipAddress = req.ip;
    const station_name = req.params.station_name
    
    // console.log(req)
    
    //test req
    if (ipAddress === "::1") {
        ipAddress = "127.0.0.1"
    }

    // if(!station_name) {
    //     return req.status(401).json({error: "station name undefined"})
    // } else if (audio_station_banned_names.has(station_name)) {
    //     console.log(`IP: ${ipAddress} try to use banned station name: ${station_name}`)
    //     return req.status(401).json({error: "station name is not available"})
    // }

    ipAddress = ipAddress.includes('::ffff:') ? ipAddress.slice(7) : ipAddress;

   //lista piosenek przyjdzie w body

    const songs_list = req.body

    //client odpowiedział, dodaj go do listy
    data.add(ipAddress, { name: station_name, files: songs_list });
    
    return res.status(200).json({ok: 200})
})

const songManager = SongManager.getInstance()
/**
 * 
 * @param {*} ip 
 * @param {*} station_name 
 * @param {*} fileName 
 * @returns file path
 */
async function get_song(ip, station_name, fileName) {
    const filePath = `${process.cwd() + aduio_file_path + station_name + "_" + fileName}`;
    songManager.playing(fileName, filePath)
    try {
        const response = await axios.post(`http://${ip}/${fileName}`, {
            // Możesz przekazać dane w ciele żądania, jeśli to konieczne
        }, {
            responseType: 'stream' // Ustawienie responseType na 'stream' dla strumienia
        });

        // Pipe strumień odpowiedzi do pliku
        response.data.pipe(fs.createWriteStream(filePath));

        // Zwróć ścieżkę do pobranego pliku
        return filePath;
    } catch (error) {
        console.error('Wystąpił błąd:', error);
        throw error; // Rzuć błąd, jeśli wystąpił
    }
}



const server = http.createServer(app);

function audio_api_run() {
    server.listen(port);
    console.log(`Audio API online localhost:${port}`)
}
module.exports = { audio_api_run, DataStore, get_song, SongManager}

 /*
        zapisywać plik w danym miejscu,
        zapisywać do klasy gdzie się znajduje,
        odtworzyć na kanale i usunąć
        
        dodać zmienną name w go (podawaną podczas uruchomienia.exe)
        dodać odtwarzanie na komendzie /play <name> <song>
        i name i song mają być na autocomplete

        dodać pod .gitignore folder z kodem tsuclienta,
        przesyłac również informację o wersji clienta i sprawdzać
        czy nie jest przestarzałam jeżeli tak to w konsoli ma się wyświetlić
        informacja z linkiem do pobrania najnowszej wersji.
        (link go gituba)

        +hartbeat (jeżeli serwer nie odpowie jest usówany z klasy data)


        =============

        można sprubować przesyłać dane audio na żywo.
    */