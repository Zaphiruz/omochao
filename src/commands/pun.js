const Command = require('../command.js');
const $ = require('cheerio');
const request= require('request-promise');

const logger = require('../utils/logger.js');

module.exports = class Ping extends Command {
    constructor(bot, settings) {
        super('pun', bot, settings);
    }

    action(e, args) {
        //e.channel.send(['pong', ...args].join(' '));
        let url = `https://pungenerator.org/puns?utf8=%E2%9C%93&q=${ args.join('+') }&commit=Generate+Puns%21`;
        logger.info('fetching pun from ` '+ url)
        request(url)
            .then(html => $.load(html))
            .then($ => {
                let facts = $('td:not(.action-buttons)').toArray()
                    .map(el => el.children[0].data.trim().trim())
                    .filter( (text, index) => (index % 2 == 0) ) // every other is a pun
                
                let randomFact = facts[ Math.round(Math.random() *  facts.length) ];
                if(!randomFact) {
                    throw new Error('No Facts Exist');
                }

                e.channel.send(randomFact);
            })
            .catch((err) => {
                e.channel.send('... I tried my best ...');
                logger.error(err.message);
            })
    }
}