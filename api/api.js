const http = require("http");
const app = require("./app");
const config = require("../config.json")
let port_ = 80
if (config.tests) {
    port_ = config.test_port
} else {
    port_ = config.port
}
const port = process.env.PORT || port_;

const server = http.createServer(app);

// const ConsoleLogger = require("../handlers/console")
// const logger = ConsoleLogger.getInstance();

function run() {
    server.listen(port);
    console.log(`API online localhost:${port}`)
}

module.exports = run