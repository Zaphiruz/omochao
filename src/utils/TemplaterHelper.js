const ChannelResolver = require('../utils/ChannelIdResolver.js');

const openTemplate = /(\{\{)/;
const closeTemplate = /(\}\})/;
const matchProp = /(?<=\{\{)(.*?)(?=\}\})/;

module.exports = class TemplaterHelper {
    static async mapToObject(string, object, bot, settings) {
        while( openTemplate.test(string) && closeTemplate.test(string) ) {
            let value = 'undefined';
            let prop = string.match(matchProp)[1];

            // filter channels by name
            if( prop[0] == '#' ) {
                let channelName = prop.slice(1);
                let channelId = ChannelResolver.resolveNameToId(channelName, settings);
                let channel = await bot.channels.fetch(channelId);
                value = channel;
            } 
            // non-channel props
            else {
                let props = prop.toLowerCase().split('.');
                value = getValue(object, props)
            }
            

            string = string.replace(`{{${prop}}}`, value && value.toString());
        }

        return string;
    }
}

function getValue(obj, [prop, ...props]) {
    if( !(prop in obj) ) {
        return undefined;
    }

    if( props.length == 0 ) {
        return obj[prop];
    }

    return getValue(obj[prop], props);
}