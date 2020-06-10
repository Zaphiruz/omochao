const Command = require('../command.js');
const logger = require('../utils/logger.js');
const ytdl = require('ytdl-core-discord');

module.exports = class Player extends Command {
    constructor(bot, settings) {
        super('player', bot, settings);
        this.restrictedByRole = false;
        this.settings.volume = 1;

        this.currentChannel = undefined;
        this.currentConnection = undefined;
        this.currentStream = undefined;
        this.currentDispatcher = undefined;

        this.queue = [];
    }

    get volume() {
        return this.settings.volume;
    }

    set volume(val) {
        this.settings.volume = val / 100;

        if( this.currentDispatcher ) {
            this.currentDispatcher.volume = this.settings.volume;
        }

        return val;
    }

    // dont mod urls
    argsToLowerCase(args) {
        if( /(play|queue)/i.test(args[0]) ) {
            args[0] = args[0].toLowerCase();
            return args;
        }

        return super.argsToLowerCase(args);
    }

    action(e, args) {
        
        switch( args[0] ) {

            case 'volume':
                if( args[1] === undefined || isNaN(args[1]) ) {
                    e.channel.send('please provide a volume level between 0 and 100');
                    e.channel.send('the current volume is ' + this.volume * 100);
                    return;
                }    

                // parse int between 0 and 100
                var vol = this.volume = Math.clamp(parseInt(args[1]), 0, 100);
                e.channel.send('volume set to: ' + vol);
                break;
            
            
            case 'resume':
                this.resumeSong();
                break;

            case 'play':
                if( this.currentChannel ) {
                    if( args[1] ) {
                        this.queueSong(e, args[1]);
                    }
                    return;
                }   

                debugger;
                this.connectToChannel(e)
                    .then((connection) => {
                        if( connection.err ) {
                            throw connection.err;
                        }

                        e.channel.send(this.settings.playJams);

                        if( args[1] ) {
                            this.queueSong(e, args[1]);
                        }
                    })
                    .catch((err) => {
                        if(err) {
                            logger.error(err.message);
                        }
                    })
                break;

            
            case 'pause':
                this.pauseSong();
                break;

            case 'stop':
                this.disconnectFromChannel();
                break;

            case 'skip':
                this.startNextSong(e);
                break;

            case 'queue':
                if( args[1] === undefined ) {
                    e.channel.send('please provide a link to play from');
                    return;
                }  

                this.queueSong(e, args[1]);
                break;

            default:
                e.channel.send('please use with one of the following options: volume, play, stop, pause, resume, skip, queue')
        }

    }

    queueSong(e, url) {
        if( !ytdl.validateURL(url) ) {
            logger.info('song rejected: ' + url);
            e.channel.send("The provided url wasn't for youtube and I can't seem to find a way to play it.");
            return;
        }

        logger.info('queueing song ' + url);
        this.queue.push(url);

        if( this.queue.length == 1 && this.currentChannel && !this.currentStream ) {
            this.startNextSong(e);
        }
    }
    
    connectToChannel(e) {
        let voiceChannel = e.member.voice.channel;
        if( !this.currentChannel && !voiceChannel ) {
            e.channel.send("You need to be in a voice channel to play music.");
            return Promise.reject();
        } else if(!voiceChannel) {
            e.channel.send("You need to be in a voice channel to play music, but I'm currently busy anyways.");
            return Promise.reject();
        } else if( this.currentChannel && this.currentChannel == voiceChannel ) {
            return Promise.reject();
        } else if(this.currentChannel && this.currentChannel != voiceChannel) {
            e.channel.send("Sorry, I'm currently playing music in a different channel!");
            return Promise.reject();
        }

        // make sure bot has permissions
        let permissions = voiceChannel.permissionsFor(e.client.user);
        if (!permissions.has('CONNECT')) {
            e.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
            logger.error("Cannnot connect to channel");
            return Promise.reject();
        }
        if (!permissions.has('SPEAK')) {
            e.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
            logger.error("Cannnot connect to channel");
            return Promise.reject();
        }

        this.currentChannel = voiceChannel;
        return voiceChannel.join()
            .then((connection) => {
                this.currentConnection = connection;
                return connection;
            })
            .catch((err) => {
                this.currentChannel = undefined;
                e.channel.send("Something went wrong when I tried to join your channel, I'm sorry!!");
                logger.error(err.message);
                return {err};
            })
    }

    disconnectFromChannel() {
        if( this.currentChannel ) {
            this.destroyStream();

            this.currentChannel.leave();
            this.currentChannel = undefined;
            this.currentConnection = undefined;
        }
    }

    // clean up
    destroyStream() {
        if( this.currentStream ) {
            this.currentStream.destroy();
            this.currentStream = undefined;
        }

        if( this.currentDispatcher ) {
            this.currentDispatcher.end();
            this.currentDispatcher.destroy();
            this.currentDispatcher = undefined;
        }
    }

    async startNextSong(e) {
        this.destroyStream();
        console.log('starting next song')

        if( !this.queue.length ) {
            e.channel.send('there are no songs for me to play, please queue some up!');
            return;
        }

        let song = this.queue.shift();
        logger.info('starting song ' + song);
        console.log('song', song);

        this.currentStream = await ytdl(song, {filter: 'audioonly'});
        this.currentStream.on('error', (err) => {
            logger.error(err.message);
            e.channel.send('Something bad happened while trying to play your song...');
        })
        this.currentDispatcher = this.currentConnection.play(this.currentStream, { volume: this.volume, type: 'opus' });
        this.currentDispatcher.once('end', (reason) => {
            logger.info('song ended');
            console.log('song ended', reason);
            if( reason != 'user' ) {
                this.startNextSong(e);
            }
        });
        this.currentDispatcher.on('error', (err) => {
            logger.error(err);
            e.channel.send('Something bad happened while tring to play your song...');
            this.destroyStream();
        })
    }

    pauseSong() {
        if( this.currentDispatcher ) {
            this.currentDispatcher.pause();
        }
    }

    resumeSong() {
        if( this.currentDispatcher ) {
            this.currentDispatcher.resume();
        }
    }

    help(e, args) {
        e.channel.send('queues and plays songs from youtube');
    }
}
