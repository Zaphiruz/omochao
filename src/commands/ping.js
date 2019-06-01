const Command = require('../command.js');

module.exports = class Ping extends Command {
    constructor(bot) {
        super('ping', bot);
    }

    action(e, args) {
        e.channel.send(['pong', ...args].join(' '));
    }
}