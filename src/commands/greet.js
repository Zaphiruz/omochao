const Command = require('../command.js');
const TemplaterHelper = require('../utils/TemplaterHelper.js');
const ChannelResolver = require('../utils/ChannelIdResolver.js');
const logger = require('../utils/logger.js');

const channelName = 'welcome-goodbye';

module.exports = class Greet extends Command {
    constructor(bot, settings) {
        super('greeter', bot, settings);
    }

    async action(e, args) {
        let message = this.settings.greeting;
        if( args[0] == 'guildmemberremove' ) {
            message = this.settings.goodbye;
        }

        let channelId = ChannelResolver.resolveNameToId(channelName, this.settings);

        try {
            let channel = await this.bot.channels.fetch(channelId)
            message = await this.tempate(message, e);

            channel.send(message);
        } catch (err) {
            logger.error(err.message);
        }
    }

    async tempate(string, obj) {
        return await TemplaterHelper.mapToObject(string, obj, this.bot, this.settings);
    }
}