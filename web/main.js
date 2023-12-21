const http = require("http");
const app = require("./app");
const port = process.env.PORT || 3000;

const server = http.createServer(app);

function run() {
    server.listen(port);
    console.log("serwer online\n localhost:3000")
}

module.exports = run