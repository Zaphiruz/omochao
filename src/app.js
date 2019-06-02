let auth, settings;
try {
    auth = require("../auth.json");
    settings = require("../settings.json");
} catch(e) {
    auth = auth || {token: ""};
    settings = settings || {};
}

const Bot = require('./bot.js');

global.bot = new Bot(auth.token, settings);