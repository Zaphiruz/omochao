module.exports = class ChannelResolver {
    static resolveNameToId(name, settings) {
        if (/^#/.test(name)) {
            name = name.slice(1);
        }

        if (!(name in settings.channelIdMapping)) {
            return undefined;
        }

        return settings.channelIdMapping[name];
    }
}