const http = require("http");
const app = require("./app");
const port = process.env.PORT || 3000;

const server = http.createServer(app);

// const ConsoleLogger = require("../handlers/console")
// const logger = ConsoleLogger.getInstance();

function run() {
    server.listen(port);
    console.log(`new serwer online localhost:${port}`)
}

module.exports = run