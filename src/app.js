const auth = require("../auth.json");
const settings = require("../settings.json");
const Bot = require('./bot.js');

global.bot = new Bot(auth.token, settings);