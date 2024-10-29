const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mariadb = require('mariadb');
const base64url = require('base64url');
const cors = require('cors')
//const csurf = require("csurf");
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const hook = new Webhook("https://discord.com/api/webhooks/1149030562674258032/oCKkXWPL63tB33ydXxEoST6uQaAEpJirV0t_MVstITGTCJ2lfGPgTsICAqcshB4BrJNA");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
//app.use(csurf());
app.disable('x-powered-by');

// Database configuration
const pool = mariadb.createPool({
    host: '122.154.34.170',
    user: 'dynastyx_zxvxzv',
    password: process.env.DATABASE_PASSWORD,,
    database: 'dynastyx_api',
    connectionLimit: 10
});

// Route to handle POST requests
// Inside your POST route handler
app.post('/auth-key-rov', async (req, res) => {
    try {
	//res.json({ valid: false, message: "⚠️ ปิดปรับปรุง" });
        const encodedKey = req.body.key; // Get the base64-encoded key from the request
        const deviceId = req.body.device_id; // Get the device ID from the request

        // Decode the key as before
        const decodedKeyBase64_1 = Buffer.from(encodedKey, 'base64').toString('utf8');
        const decodedKeyBase64_2 = Buffer.from(decodedKeyBase64_1, 'base64').toString('utf8');
        const decodedKeyBase64_final = Buffer.from(decodedKeyBase64_2, 'base64').toString('utf8');

        connection = await pool.getConnection();

        // Fetch the key from the database
        const keyQuery = await connection.query("SELECT id, expiry_date, access FROM user_keys WHERE key_hire = ?", [decodedKeyBase64_final]);

        if (keyQuery.length === 0) {
            // Key not found in the database
            const failMessageQuery = await connection.query("SELECT Fail FROM Server WHERE id = 1"); // Assuming you want to fetch from the Server table with id 1
            const failMessage = failMessageQuery[0].Fail;
            res.json({ valid: false, message: failMessage });
            // Log for login cheat (failed)
            const embed = new MessageBuilder()
                .setTitle('<:emoji_3:1149094551655546951> ZXVXZV-LOGIN')
                .addField("<:emoji_3:1149094551655546951> คีย์ของผู้ล็อคอิน", "```\n" + decodedKeyBase64_final + "\n```")
                .addField("<:emoji_3:1149094551655546951> Device Id ของผู้ล็อคอิน", `<:emoji_3:1149094551655546951> ${deviceId}`)
                .addField("<:emoji_3:1149094551655546951> สถานะการล็อคอิน", "```\n" + failMessage + "\n```")
                .setColor('#000000')
                .setDescription('<:emoji_3:1149094551655546951> Log For Login Mod Cheat')
                .setFooter('ล็อคอินเมื่อ')
                .setTimestamp();
            hook.send(embed);
        } else {
            const keyId = keyQuery[0].id;
            const access = keyQuery[0].access;

            // Check if key has been accessed before
			if (access === 0) {
			    // Key has not been accessed before, update access to 1
			    await connection.query("UPDATE user_keys SET access = 1, device_id = ? WHERE id = ?", [deviceId, keyId]);
			}


            // Continue with the normal check
            const expiryDate = new Date(keyQuery[0].expiry_date);
            const currentDate = new Date();

            if (currentDate > expiryDate) {
                // Key has expired
                const expiredMessageQuery = await connection.query("SELECT Fail_exp FROM Server WHERE id = 1"); // Assuming you want to fetch from the Server table with id 1
                const expiredMessage = expiredMessageQuery[0].Fail_exp;
                res.json({ valid: false, message: expiredMessage });
                // Log for login cheat (expired)
                const embed = new MessageBuilder()
                    .setTitle('<:emoji_3:1149094551655546951> ZXVXZV-LOGIN')
                    .addField("<:emoji_3:1149094551655546951> คีย์ของผู้ล็อคอิน", "```\n" + decodedKeyBase64_final + "\n```")
                    .addField("<:emoji_3:1149094551655546951> Device Id ของผู้ล็อคอิน", `<:emoji_3:1149094551655546951> ${deviceId}`)
                    .addField("<:emoji_3:1149094551655546951> สถานะการล็อคอิน", "```\n" + expiredMessage + "\n```")
                    .setColor('#000000')
                    .setDescription('<:emoji_3:1149094551655546951> Log For Login Mod Cheat')
                    .setFooter('ล็อคอินเมื่อ')
                    .setTimestamp();
                hook.send(embed);
            } else {
                // Check if deviceId matches the key in the database
                const keyDeviceQuery = await connection.query("SELECT device_id FROM user_keys WHERE id = ?", [keyId]);

                if (keyDeviceQuery.length === 0 || keyDeviceQuery[0].device_id !== deviceId) {
                    // Device id does not match the key in the database
                    const failDeviceMessageQuery = await connection.query("SELECT Fail_device FROM Server WHERE id = 1"); // Assuming you want to fetch from the Server table with id 1
                    const failDeviceMessage = failDeviceMessageQuery[0].Fail_device;
                    res.json({ valid: false, message: failDeviceMessage });
                    // Log for login cheat (device mismatch)
                    const embed = new MessageBuilder()
                        .setTitle('<:emoji_3:1149094551655546951> ZXVXZV-LOGIN')
                        .addField("<:emoji_3:1149094551655546951> คีย์ของผู้ล็อคอิน", "```\n" + decodedKeyBase64_final + "\n```")
                        .addField("<:emoji_3:1149094551655546951> Device Id ของผู้ล็อคอิน", `<:emoji_3:1149094551655546951> ${deviceId}`)
                        .addField("<:emoji_3:1149094551655546951> สถานะการล็อคอิน", "```\n" + failDeviceMessage + "\n```")
                        .setColor('#000000')
                        .setDescription('<:emoji_3:1149094551655546951> Log For Login Mod Cheat')
                        .setFooter('ล็อคอินเมื่อ')
                        .setTimestamp();
                    hook.send(embed);
                } else {
                    // Key is valid
                    const successQuery = await connection.query("SELECT Success FROM Server WHERE id = 1"); // Assuming you want to fetch from the Server table with id 1
                    const successMessage = successQuery[0].Success;
                    res.json({ valid: true, message: successMessage });
                    const embed = new MessageBuilder()
						.setTitle('<:emoji_3:1149094551655546951> ZXVXZV-LOGIN')
						.addField("<:emoji_3:1149094551655546951> คีย์ของผู้ล็อคอิน", "```\n" + decodedKeyBase64_final + "\n```")
						.addField("<:emoji_3:1149094551655546951> Device Id ของผู้ล็อคอิน", `<:emoji_3:1149094551655546951> ${deviceId}`)
						.addField("<:emoji_3:1149094551655546951> สถานะการล็อคอิน", "```\n" + successMessage + "\n```")
						.setColor('#000000')
						.setDescription('<:emoji_3:1149094551655546951> Log For Login Mod Cheat')
						.setFooter('ล็อคอินเมื่อ')
						.setTimestamp();
					hook.send(embed);
                }
            }   
        }
    } catch (err) {
        // Handle errors
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});
 


// Set up secure headers
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
