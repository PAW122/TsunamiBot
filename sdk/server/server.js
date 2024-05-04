
const express = require("express")
require('dotenv').config();
const fetch = require("fetch")
const config = require("../../config.json")
const run = config[config.using].sdk.run

const app = express();
const port = 3003;

// Allow express to parse JSON bodies
app.use(express.json());

app.get("/" ,async (req, res) => {
  res.sendFile(process.cwd() + "/sdk/client/index.html")
})

app.post("/api/token", async (req, res) => {
  console.log("SDK TOKEN")

  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.VITE_DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token to our client as { access_token: "..."}
  res.send({ access_token });
});

function run_sdk() {
  if(!run) {
    console.log("SDK server disabled")
    return
  };
  app.listen(port, () => {
    console.log(`SDK server runing on http://localhost:${port}`);
  });
}

module.exports = run_sdk