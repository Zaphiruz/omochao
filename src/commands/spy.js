const Command = require('../command.js');

module.exports = class Spy extends Command {
    constructor(bot, settings) {
        super('spy', bot, settings);
        this.isOn = true;
    }

    action(e, args) {
        switch(args[0]) {
            case "off":
                this.isOn = false;
                break;

            case "on":
                this.isOn = true;
                break;

            default:
                e.channel.send('please use with "on" or "off" commands');
        }
    }

    spy(e) {
        if( this.isOn && /omochao/i.test(e.content) ) {
            e.channel.send('***sneezes***');
        }
    }

    help(e, args) {
        e.channel.send('spy interjects when "omochao" is said. this interface allows it to be turned off or on');
    }
}