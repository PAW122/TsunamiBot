const http = require("http");
const express = require("express");
const axios = require("axios")
const fs = require("fs")

const config = require("../../config.json")
let port_ = config[config.using].audio_port
const aduio_file_path = config[config.using].aduio_file_path
const port = process.env.PORT || port_;
const app = express();


class DataStore {
    constructor() {
        if (!DataStore.instance) {
            this.data = {};
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

let data = DataStore.getInstance()
app.get("/ping", (req, res) => {
    return res.json({ ok: 200 })
})

app.get("/connect/:station_name", async (req, res) => {
    let ipAddress = req.ip;
    const station_name = req.params.station_name
    //test req
    if (ipAddress === "::1") {
        ipAddress = "127.0.0.1"
    }

    ipAddress = ipAddress.includes('::ffff:') ? ipAddress.slice(7) : ipAddress;


    res.json({ ok: 200 })

    //send test req
    const options = {
        hostname: ipAddress,
        port: 3002,
        path: '/endpoint',
        method: 'GET'
    };

    const _req = http.request(options, (res) => {
        console.log(`Status code: ${res.statusCode}`);

        let rawData = ''; // Zainicjuj zmienną do przechowywania danych

        res.on('data', (chunk) => {
            console.log(`Odpowiedź: ${chunk}`);
            rawData += chunk.toString(); // Dodaj chunk do całkowitych danych jako ciąg znaków
        });

        res.on('end', () => {
            try {
                const dataArray = JSON.parse(rawData); // Parsuj całkowite dane JSON do tablicy
                console.log(dataArray); // Wyświetl przetworzone dane

                // Jeśli dataArray jest już tablicą, możesz ją dodać do listy
                if (Array.isArray(dataArray)) {

                    //client odpowiedział, dodaj go do listy
                    data.add(ipAddress, { name: station_name, files: dataArray });
                    console.log(data.get());

                    console.log("wszystkie dane")
                    console.log(data.get())

                    let station = data.get_by_key(ipAddress)
                    console.log("stacja")
                    console.log(station.name)



                    //get_song(ipAddress + ":3002", station.name, "opening.mp3")

                } else {
                    console.error('Otrzymane dane nie są tablicą JSON.');
                }
            } catch (error) {
                console.error(`Błąd parsowania JSON: ${error.message}`);
            }


        });
    });

    _req.on('error', (error) => {
        console.error(`Błąd żądania: ${error}`);
    });

    _req.end();
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

    */
})

/**
 * 
 * @param {*} ip 
 * @param {*} station_name 
 * @param {*} fileName 
 * @returns file path
 */
async function get_song(ip, station_name, fileName) {
    console.log(`http://${ip}/get_song/${fileName}`)
    try {
        const response = await axios.get(`http://${ip}/get_song/${fileName}`, {
            responseType: 'arraybuffer' // Określamy, że chcemy otrzymać plik jako arraybuffer
        });

        if (response.status === 200) {
            // Zapisujemy otrzymane dane jako plik na dysku
            fs.writeFileSync(process.cwd() + aduio_file_path +station_name + "_" + fileName, Buffer.from(response.data));
            console.log(`Pobrano plik: ${fileName}`);
        }
    } catch (error) {
        console.error('Wystąpił błąd:', error.message);
    }

    return `${process.cwd() + aduio_file_path +station_name + "_" + fileName}`
}


const server = http.createServer(app);

function audio_api_run() {
    server.listen(port);
    console.log(`Audio API online localhost:${port}`)
}
module.exports = { audio_api_run, DataStore, get_song }