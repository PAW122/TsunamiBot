const Database = require("../db/database");
const database = new Database(__dirname + "/../db/files/servers.json");
const Canvas = require("canvas");
const { AttachmentBuilder } = require("discord.js");

async function welcome_messages(member, client) {
    database.init();
    const guild = member.guild.id;
    const data = await database.read(`${guild}`);

    if(!data || !data.welcome_channel) {
        return;
    }

    const welcome_channel = data.welcome_channel || false;
    const server_name = data.name || "Server";
    var channel = client.channels.cache.get(welcome_channel);
    const welcome_message_text = data.welcome_message || "";
    const welcome_status = data.welcome_status;
    const welcome_dm_message = data.welcome_dm_message || false;
    let username = member.user.username;

    if(member.user.bot) return;

    console.log(welcome_status)
    if (welcome_status == false) return;

    if(welcome_dm_message != false) {
        member.send(welcome_dm_message
            .replace("{server_name}", server_name)
            .replace("{user}", username)
            );
    }

    // Replace "{server_name}" with the actual server name
    let formattedWelcomeMessage = welcome_message_text
    .replace("{server_name}", server_name)
    .replace("{user}", username)


    if (welcome_channel) {
        // send welcome message

        const dim = {
            height: 675,
            width: 1200,
            margin: 50,
        };

        const av = {
            size: 256,
            x: 480,
            y: 170,
        };

        // draw everything:
        let discrim = member.user.discriminator;
        let avatarURL = member.user.displayAvatarURL({ format: "jpg", dynamic: false, size: av.size });
        avatarURL = avatarURL.replace(".webp", ".jpg");

        const canvas = Canvas.createCanvas(dim.width, dim.height);
        const ctx = canvas.getContext("2d");

        try {
            // load the background image
            const backimg = await Canvas.loadImage("https://i.imgur.com/zvWTUVu.jpg", { imageOrientation: 'none' });
            ctx.drawImage(backimg, 0, 0);

            // draw black tinted box
            ctx.fillStyle = "rgba(0,0,0,0.8)";
            ctx.fillRect(dim.margin, dim.margin, dim.width - 2 * dim.margin, dim.height - 2 * dim.margin);

            const avimg = await Canvas.loadImage(avatarURL);
            ctx.save();

            ctx.beginPath();
            ctx.arc(av.x + av.size / 2, av.y + av.size / 2, av.size / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(avimg, av.x, av.y);
            ctx.restore();

            // write in text
            ctx.fillStyle = "white";
            ctx.textAlign = "center";

            // draw "Welcome" text
            ctx.font = "bold 50px serif";
            ctx.fillText("Welcome", dim.width / 2, dim.margin + 70);

            // draw username text
            ctx.font = "bold 60px serif";
            ctx.fillText(username, dim.width / 2, dim.height - dim.margin - 125);

            // draw "to the server" text
            ctx.font = "bold 40px serif";
            ctx.fillText("to the server", dim.width / 2, dim.height - dim.margin - 50);

            // send the image
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "welcome.png" });
            channel.send({ content: `${formattedWelcomeMessage}`, files: [attachment] });
        } catch (error) {
            console.error("Error:", error);
            // Handle the error, e.g., send a message to the user or log it
            // You might want to add more specific error handling based on the error type
        }
    }
}

module.exports = welcome_messages;