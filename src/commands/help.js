const Command = require('../command.js');

module.exports = class Help extends Command {
    constructor(bot, settings, commands) {
        super('help', bot, settings);
        this.commands = commands;
    }

    action(e, args) {
        e.channel.send(['pong', ...args].join(' '));
    }
}