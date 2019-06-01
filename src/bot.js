const discord = require("discord.js");
const logger = require('./utils/logger.js');

const Ping = require('./commands/ping.js');
const Greeter = require('./commands/greet.js');
const Pun = require('./commands/pun.js');

module.exports = class Bot {

    static get EVENT_TYPES() {
        return {
            MESSAGE: "message",
            GUILD_MEMBER_ADD: "guildMemberAdd"
        }
    }

    constructor(token, settings) {
        this._ = {}; // privates
        this.settings = settings;

        this._.bot = new discord.Client();

        this._.bot.on('ready', this.onready.bind(this));
        this._.bot.on(Bot.EVENT_TYPES.MESSAGE, this.onevent.bind(this, Bot.EVENT_TYPES.MESSAGE));
        this._.bot.on(Bot.EVENT_TYPES.GUILD_MEMBER_ADD, this.onevent.bind(this, Bot.EVENT_TYPES.GUILD_MEMBER_ADD));

        let ping = new Ping(this._.bot, this.settings);
        let greet= new Greeter(this._.bot, this.settings);
        let pun = new Pun(this._.bot, this.settings);

        this._.commands = {
            [Bot.EVENT_TYPES.MESSAGE]: {
                ping,
                pun
            },
            [Bot.EVENT_TYPES.GUILD_MEMBER_ADD]: {
                greet
            }
        }

        this._.bot.login(token);
    }

    onevent(type, e) {
        switch(type) {

            case Bot.EVENT_TYPES.GUILD_MEMBER_ADD:
                this.callAction('greet', [], type);
                break;
                
            case Bot.EVENT_TYPES.MESSAGE:
                if( e.content.startsWith(this.settings.commandToken) ) {
                    let args = e.content.substring(this.settings.commandToken.length).split(' ').map( s  => s.toLowerCase());
                    let cmd = args.shift();
        
                    this.callAction(e, cmd, args, Bot.EVENT_TYPES.MESSAGE);
                }
                break;
        }
    }

    onready(e) {
        logger.info('Connected');
        logger.info('Logged in as: ' + this._.bot.user.username + ' - (' + this._.bot.user.id + ')');
    }

    callAction(e, cmd, args, type) {
        if( cmd in this._.commands[type] ) {
            logger.info('Running command: ' + cmd);
            this._.commands[type][cmd].action(e, args);
        }
    }
}
