const winston = require('winston');

// Configure logger settings
winston.remove(winston.transports.Console);
winston.add(new winston.transports.Console, {
    colorize: true
});
winston.level = 'debug';

module.exports = winston;