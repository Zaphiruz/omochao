require('./utils/Math.js');

let auth, settings;
try {
    auth = require("../auth.json");
} catch(e) {
    auth = { token: process.env.DISCORD_TOKEN || '' };
}

try {
    settings = require("../settings.json");
} catch(e) {
    settings = {};
}

const Bot = require('./bot.js');

global.bot = new Bot(auth.token, settings);