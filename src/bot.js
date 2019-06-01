const discord = require("discord.js");
const logger = require('./logger.js');

const Ping = require('./commands/ping.js');

module.exports = class Bot {
    constructor(token, settings) {
        this._ = {}; // privates
        this.settings = settings;

        this._.bot = new discord.Client();

        this._.bot.on('ready', this.onready.bind(this));
        this._.bot.on('message', this.onmessage.bind(this));

        let ping = new Ping(this._.bot);
        this._.commands = {
            ping
        }

        this._.bot.login(token);
    }

    onready(e) {
        logger.info('Connected');
        logger.info('Logged in as: ' + this._.bot.user.username + ' - (' + this._.bot.user.id + ')');
    }

    onmessage(e) {
        if( e.content.startsWith(this.settings.commandToken) ) {
            let args = e.content.substring(this.settings.commandToken.length).split(' ').map( s  => s.toLowerCase());
            let cmd = args.shift();

            if( cmd in this._.commands ) {
                logger.info('Running command: ' + cmd);
                this._.commands[cmd].action(e, args);
            }
        }
    } 
}
