const Command = require('../command.js');
const request = require('request-promise');
const options = {
    url: 'https://icanhazdadjoke.com/',
    headers: {
        'Accept': 'text/plain'
    }
}


const logger = require('../utils/logger.js');

module.exports = class Joke extends Command {
    constructor(bot, settings) {
        super('joke', bot, settings);
    }

    action(e, args) {
        request(options)
            .then((joke) => {
                e.channel.send(joke);
            })
            .catch((err) => {
                e.channel.send('The joke I was about to tell took a wrong turn...');
                logger.error(err.message || err);
            })
    }

    help(e, args) {
        e.channel.send('tells a joke');
    }
}