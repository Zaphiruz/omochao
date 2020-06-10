const Command = require('../command.js');
const fetch = require('node-fetch');
const logger = require('../utils/logger.js');

module.exports = class Trivia extends Command {
    static get DIFFICULTY() {
        return {
            ANY: 'any',
            EASY: 'easy',
            MEDIUM: 'medium',
            HARD: 'hard'
        }
    }

    static escape(str) {
        return str.replace(/(\:|\s)*/g, "_");
    }

    static unescape(str) {
        return str.replace(/\_\_/g, ": ").replace(/\_/, " ");
    }

    static get CATEGORY() {
        return {
            ANY: 0,
            GENERAL_KNOWELDGE: 9,
            ENTERTAINMENT__BOOKS: 10,
            ENTERTAINMENT__FILM: 11,
            ENTERTAINMENT__MUSIC: 12,
            ENTERTAINMENT__MUSICALS_AND_THEATERS: 13,
            ENTERTAINMENT__TELEVISION: 14,
            ENTERTAINMENT__VIDEO_GAMES: 15,
            ENTERTAINMENT__BOARD_GAMES: 16,
            ENTERTAINMENT__COMICS: 29,
            ENTERTAINMENT__JAPANESE_ANIME_AND_MANGA: 30,
            ENTERTAINMENT__CARTOONS_AND_ANIMATIONS: 31,
            SCIENCE__NATURE: 17,
            SCIENCE__COMPUTERS: 18,
            SCIENCE__MATHMATICS: 19,
            MYTHOLOGY: 20,
            SPORTS: 21,
            GEOGRAPHY: 22,
            HISTORY: 23,
            POLITICS: 24,
            ART: 25,
            CELEBRITIES: 26,
            ANIMALS: 27,
            VEHICALS: 28
        }
    }

    constructor(bot, settings) {
        super('trivia', bot, settings);
        this.currentDifficulty = Trivia.DIFFICULTY.ANY;
        this.currentCategory = Trivia.CATEGORY.ANY;
        this.currentQuestion = undefined;
    }

    action(e, args) {
        switch(args[0]) {

            // show availble options
            case 'list':
                switch(args[1]) {
                    case 'difficulties':
                    case 'difficulty':
                        e.channel.send("\nDifficulties:\n\n" + Object.values(Trivia.DIFFICULTY).join('\n'))
                        break;

                    case 'categories':
                    case 'category': 
                        e.channel.send("\nCategories: \n\n" + Object.keys(Trivia.CATEGORY)
                            .map( c => Trivia.unescape(c.toLowerCase()) )
                            .map( c => c.split(' ').map( word => word[0].toUpperCase() + word.slice(1) ).join(' ') )
                            .join('\n')
                        )
                        break;

                    default:
                        e.channel.send('please use the "list" command with one of the following options: "difficulty", "category"')
                }
                break;

            case 'start':

                if(args[1]) {
                    let settingValue = processArgs(args, 2);
                    this.setSetting(args[1], settingValue, e)
                }

                if( args[2] ) {
                    let settingValue = processArgs(args, 3);
                    this.setSetting(args[2], settingValue, e)
                }

                // NO BREAK
            case 'next':
                this.fetchQuestion()
                    .then(() => {
                        let answers = this.currentQuestion.incorrect_answers;
                        answers.splice(Math.floor(Math.random() * answers.length), 0, this.currentQuestion.correct_answer)
                        e.channel.send('\n'+this.currentQuestion.question+'\n\n'+answers.join('\n'));
                    })
                    .catch((err) => {
                        logger.error(err.message)
                        e.channel.send('... I tried my best ...');
                    })
                break;

            case 'stop':
            case 'reset':
                    e.channel.send('Reset quiz settings');
                    this.currentDifficulty = Trivia.DIFFICULTY.ANY;
                    this.currentCategory = Trivia.CATEGORY.ANY;
                    this.currentQuestion = undefined;
                break;

            case 'answer':
                    if( !this.currentQuestion ) {
                        return e.channel.send('You need to start a quiz before you can get an answer.')
                    }

                    e.channel.send('\n'+this.currentQuestion.question+" -> "+this.currentQuestion.correct_answer)
                break;

            case 'change':
                let settingValue = processArgs(args, 2);
                this.setSetting(args[1], settingValue, e)
                break;
            
            default:
                    e.channel.send('Please use one of the following commands: list, start, answer, next, stop, reset, change')
        }
    }

    setSetting(setting, value, e) {
        if( !value ) {
            return e.channel.send(`You didn't pass a value to change ${setting} to.`);
        }

        switch(setting) {

            case 'difficulty':
                if( !(value.toUpperCase() in Trivia.DIFFICULTY) ) {
                    return e.channel.send(`Difficulty [${value}] not found. Keeping original setting of [${this.currentDifficulty}].`);
                }

                this.currentDifficulty = Trivia.DIFFICULTY[value.toUpperCase()];
                e.channel.send(`Difficulty changed to [${this.currentDifficulty}]`);
                break;

            case 'category':
                for( let category in Trivia.CATEGORY ) {
                    let safeCategory = Trivia.unescape(category).toLowerCase();
                    if( safeCategory.includes(value) ) {
                        this.currentCategory = Trivia.CATEGORY[category];
                        e.channel.send(`Category changed to [${safeCategory}]`);
                        return;
                    }
                }
                
                let safeCategory = Object.entries(Trivia.CATEGORY).filter(item => item[1] == this.currentCategory)[0][0].toLowerCase();
                e.channel.send(`Category [${value}] not found. Keeping original setting of [${safeCategory}].`);
                break;


            default:
                e.channel.send('please use "difficulty" or "category" when updating settings');
        }
    }

    fetchQuestion() {
        let url = `https://opentdb.com/api.php?amount=1&encode=url3986${ this.currentDifficulty !== Trivia.DIFFICULTY.ANY ? '&difficulty='+this.currentDifficulty : '' }${ this.currentCategory !== Trivia.CATEGORY.ANY ? '&category='+this.currentCategory : '' }`;
        return fetch(url)
            .then(res => res.json())
            .then( (data) => {
                if(data.response_code != 0) {
                    throw new Error('Error on Trivia API: ' + data.response_code)
                }

                this.currentQuestion = data.results[0];

                this.currentQuestion.question = unescape(this.currentQuestion.question);
                this.currentQuestion.correct_answer = unescape(this.currentQuestion.correct_answer);
                this.currentQuestion.incorrect_answers = this.currentQuestion.incorrect_answers.map(item => unescape(item) );

                return this.currentQuestion;
            })
    }
}

function processArgs(args, startindex = 1) {
    let str = "";

    while ( args[startindex] != undefined 
         && args[startindex] != 'category' 
         && args[startindex] != 'difficulty' ) {
            str += args.splice(startindex, 1) + " ";
         }

    return str.trim();
}