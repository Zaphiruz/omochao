const discord = require("discord.js");
const logger = require('./utils/logger.js');

const Ping = require('./commands/ping.js');
const Greeter = require('./commands/greet.js');
const Trivia = require('./commands/trivia.js');
const Spy = require('./commands/spy.js');
const Player = require('./commands/player.js');
const Joke = require('./commands/jokes.js');

module.exports = class Bot {

    static get EVENT_TYPES() {
        return {
            MESSAGE: "message",
            GUILD_MEMBER_ADD: "guildMemberAdd",
            GUILD_MEMBER_REMOVE: "guildMemberRemove",
            SPY: "spy"
        }
    }

    constructor(token, settings) {
        this._ = {}; // privates
        this.settings = settings;

        this._.bot = new discord.Client();

        this._.bot.on('ready', this.onready.bind(this));
        this._.bot.on(Bot.EVENT_TYPES.MESSAGE, this.onevent.bind(this, Bot.EVENT_TYPES.MESSAGE));
        this._.bot.on(Bot.EVENT_TYPES.GUILD_MEMBER_ADD, this.onevent.bind(this, Bot.EVENT_TYPES.GUILD_MEMBER_ADD));
        this._.bot.on(Bot.EVENT_TYPES.GUILD_MEMBER_REMOVE, this.onevent.bind(this, Bot.EVENT_TYPES.GUILD_MEMBER_REMOVE));

        let ping = new Ping(this._.bot, this.settings);
        let greet= new Greeter(this._.bot, this.settings);
        let trivia= new Trivia(this._.bot, this.settings);
        let player = new Player(this._.bot, this.settings);
        let spy = new Spy(this._.bot, this.settings);
        let joke = new Joke(this._.bot, this.settings);

        this._.commands = {
            [Bot.EVENT_TYPES.MESSAGE]: {
                ping,
                trivia,
                spy,
                player,
                joke
            },
            [Bot.EVENT_TYPES.GUILD_MEMBER_ADD]: {
                greet
            },
            [Bot.EVENT_TYPES.GUILD_MEMBER_REMOVE]: {
                greet
            },
            [Bot.EVENT_TYPES.SPY]: {
                spy
            }
        }

        this._.bot.login(process.env.TOKEN || token);
    }

    onevent(type, e) {
        switch(type) {

            case Bot.EVENT_TYPES.GUILD_MEMBER_ADD:
            case Bot.EVENT_TYPES.GUILD_MEMBER_REMOVE:
                this.callAction(e, 'greet', [type], type);
                break;
                
            case Bot.EVENT_TYPES.MESSAGE:
                if( e.author.bot ) {
                    return
                }

                this.callSpy(e);

                if( !e.content.startsWith(this.settings.commandToken) ) {
                    return;
                }

                let args = e.content.substring(this.settings.commandToken.length).split(' ').filter( s => !!s );
                let cmd = args.shift().toLowerCase();

                this.callAction(e, cmd, args, Bot.EVENT_TYPES.MESSAGE)
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
            this._.commands[type][cmd].triggerAction(e, args);
        }
    }

    callSpy(e) {
        for( let spy in this._.commands[Bot.EVENT_TYPES.SPY] ) {
            logger.info('Running spy: ' + spy);
            this._.commands[Bot.EVENT_TYPES.SPY][spy].spy(e);
        }
    }
}
