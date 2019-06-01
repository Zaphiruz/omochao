let auth,settings;
try {
    let auth = require("../auth.json");
    let settings = require("../settings.json");
} catch {
    auth = auth || "";
    settings = settings || {};
}

const Bot = require('./bot.js');

global.bot = new Bot(auth.token, settings);