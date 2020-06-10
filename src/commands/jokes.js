const Command = require('../command.js');
const fetch = require('node-fetch');
const options = {
    headers: {
        'Accept': 'text/plain',
        'User-Agent': 'Omochao (https://github.com/Zaphiruz/omochao)'
    }
};
const url = 'https://icanhazdadjoke.com/';

const logger = require('../utils/logger.js');

module.exports = class Joke extends Command {
    constructor(bot, settings) {
        super('joke', bot, settings);
    }

    action(e, args) {
        fetch(url, options)
            .then(res => res.text())
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