const express = require('express');
const router = express.Router();

const {AuthV2} = require("../handlers/auth")
const auth = AuthV2.getInstance();

// /actions/
router.get("/logout/:tokenType/:token", async (req, res) => {
    const tokenType = req.params.tokenType
    const token = req.params.token

    auth.logout(tokenType, token)
    res.status(200).json({ok: 200})
})

module.exports = router