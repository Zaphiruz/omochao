const Command = require('../command.js');
const TemplateHelper = require('../utils/TemplaterHelper.js');

module.exports = class Greet extends Command {
    constructor(bot, settings) {
        super('greeter', bot, settings);
    }

    action(e, args) {
        debugger;
        e.guild.channels.get('channelID').send(TemplateHelper.mapToObject(this.settings.greeting, e.user));
    }
}