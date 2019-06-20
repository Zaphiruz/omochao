const Command = require('../command.js');
const TemplaterHelper = require('../utils/TemplaterHelper.js');

module.exports = class Greet extends Command {
    constructor(bot, settings) {
        super('greeter', bot, settings);
    }

    action(e, args) {
        let message = this.settings.greeting;
        if( args[0] == 'guildmemberremove' ) {
            message = this.settings.goodbye;
        }

        e.guild.channels
            .find(channel => channel.name === "welcome-goodbye")
            .send(this.tempate(message, e));
    }

    tempate(string, obj) {
        return TemplaterHelper.mapToObject(string, obj);
    }
}