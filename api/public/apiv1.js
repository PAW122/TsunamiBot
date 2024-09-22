const express = require('express');
const router = express.Router();

const {AuthV2} = require("../handlers/auth")
const auth = AuthV2.getInstance();

router.get("/v1", async (req, res) => {
    res.status(200).json({ok: 200})
})

router.post("/v1/add_custom_command", async (req, res) => {
    const token = req.body.token
})

router.post("/v1/token_cache_refresh", async(req, res) => {
    const token = req.body.token
})

router.get("/v1/help", async (req, res) => {
    const api_v1_help = {
        endpoints: {
            main: "/api/<version>/",
            ping: "GET: /api/v1",
            add_custom_command: {
                url: "POST: /api/v1/add_custom_command",
                body: {
                    token: "auth-token",
                    guild_id: "<string guild_id>",
                    command_type: "text",
                    command_slot: "<number 1-10>",
                    command_trigger: "<user input triger>",
                    command_response: "<string>",
                    command_status: "bool"
                }
            }
        }
    }
    res.status(200).json(api_v1_help)
})

module.exports = router