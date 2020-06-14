const winston = require('winston');

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.File({ filename: 'error.log', level: 'error', maxsize: 10000 }),
      new winston.transports.File({ filename: 'combined.log', maxsize: 10000 }),

      new winston.transports.Console({
        stderrLevels: ['error'],
        consoleWarnLevels : ['warn']
      })
    ]
});

module.exports = logger;