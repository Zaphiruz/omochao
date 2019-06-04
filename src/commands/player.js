const Command = require('../command.js');

module.exports = class Player extends Command {
    constructor(bot, settings) {
        super('player', bot, settings);
    }

    action(e, args) {
        if( !e.member.voiceChannel ) {
            e.channel.send("You need to be in a voice channel to play music.");
        }

        // make sure bot pas permissions
        let permissions = voiceChannel.permissionsFor(e.client.user);
        if (!permissions.has('CONNECT')) {
			return msg.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
        }
        

    }

    help(e, args) {
        e.channel.send('queues and plays songs from youtube');
    }
}