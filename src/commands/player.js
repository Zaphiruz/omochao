const Command = require('../command.js');
const logger = require('../utils/logger.js');
const ytdl = require('ytdl-core');

module.exports = class Player extends Command {
    constructor(bot, settings) {
        super('player', bot, settings);
        this.restrictedByRole = true;
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

                this.connectToChannel(e)
                    .then((connection) => {
                        if( connection.err ) {
                            throw connection.err;
                        }

                        e.channel.send('Getting ready to play your jams!');

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
                this.pauseSong();
                this.disconnectFromChannel();
                break;

            case 'skip':
                this.pauseSong();
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
        if( !/(?<=https:\/\/www\.youtube\.com\/watch\?v=)(.*)$/i.test(url) ) {
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
        let voiceChannel = e.member.voiceChannel;
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

        // make sure bot pas permissions
        let permissions = voiceChannel.permissionsFor(e.client.user);
        if (!permissions.has('CONNECT')) {
            e.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
            return Promise.reject();
        }
        if (!permissions.has('SPEAK')) {
            e.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');
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
            this.currentChannel.leave();
            this.currentChannel = undefined;
            this.currentConnection = undefined;

            this.destroyStream();
        }
    }

    destroyStream() {
        if( this.currentStream ) {
            console.log('destrosy stream')
            this.currentStream.destroy();
            this.currentStream = undefined;
            this.currentDispatcher.destroy();
            this.currentDispatcher = undefined;
        }
    }

    startNextSong(e) {
        this.destroyStream();
        console.log('starting next song')

        if( !this.queue.length ) {
            e.channel.send('there are no songs for me to play, please queue some up!');
            return;
        }

        let song = this.queue.shift();
        logger.info('starting song ' + song);
        console.log('song', song);

        this.currentStream = ytdl(song, {filter: 'audioonly'});
        this.currentDispatcher = this.currentConnection.playStream(this.currentStream, {volume: this.volume});
        this.currentDispatcher.once('end', () => {
            logger.info('song ended');
            console.log('song ended');
            this.startNextSong(e);
        });
        this.currentDispatcher.on('error', (err) => {
            logger.error(err);
            e.channel.send('Something bad happened while tring to play your song...');
            this.destroyStream();
        })
    }

    pauseSong() {
        if( this.currentStream ) {
            this.currentStream.pause();
        }
    }

    resumeSong() {
        if( this.currentStream ) {
            this.currentStream.resume();
        }
    }

    help(e, args) {
        e.channel.send('queues and plays songs from youtube');
    }
}