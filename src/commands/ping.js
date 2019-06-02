const Command = require('../command.js');

module.exports = class Ping extends Command {
    constructor(bot, settings) {
        super('ping', bot, settings);
    }

    action(e, args) {
        e.channel.send(['pong', ...args].join(' '));
    }

    help(e, args) {
        e.channel.send('replys with "pong" and any arguments. Really just for testing');
    }
}