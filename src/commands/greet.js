const Command = require('../command.js');
const TemplaterHelper = require('../utils/TemplaterHelper.js');

module.exports = class Greet extends Command {
    constructor(bot, settings) {
        super('greeter', bot, settings);
    }

    action(e, args) {
        e.guild.channels.get('channelID').send(this.welcome(this.settings.greeting, e.user));
    }

    welcome(string, obj) {
        return TemplaterHelper.mapToObject(string, obj);
    }
}