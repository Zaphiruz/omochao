const logger = require('./logger.js');

module.exports = class ChannelResolver {
    static resolveNameToId(name, settings, e) {
        if (/^#/.test(name)) {
            name = name.slice(1);
        }

        let guildId = e.guild.id;
        if (guildId && !(guildId in settings.channelIdMapping)) {
            logger.warn(`Missing guild id ${guildId} in `, settings.channelIdMapping);
            return undefined;
        }

        let guildChannelList = settings.channelIdMapping[guildId];
        if (guildChannelList && !(name in guildChannelList)) {
            logger.warn(`Missing channel name ${name} in `, guildChannelList);
            return undefined;
        }

        return guildChannelList[name];
    }
}