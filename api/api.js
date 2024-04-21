const http = require("http");
const app = require("./app");
const config = require("../config.json")
let port_ = config[config.using].port
const port = process.env.PORT || port_;
const max_listeners = config[config.using].api_max_listeners

const server = http.createServer(app);

// const ConsoleLogger = require("../handlers/console")
// const logger = ConsoleLogger.getInstance();

function run() {
    server.listen(port);
    server.setMaxListeners(max_listeners)
    console.log(`API online localhost:${port}`)
}

module.exports = run