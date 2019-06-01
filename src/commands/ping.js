const Command = require('../command.js');

module.exports = class Ping extends Command {
    constructor(bot, settings) {
        super('ping', bot, settings);
    }

    action(e, args) {
        e.channel.send(['pong', ...args].join(' '));
    }
}