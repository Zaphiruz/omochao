
// base class for commands
module.exports = class Command {
    constructor(name = 'undefined', bot, settings = {}) {
        this.name = name;
        this.bot = bot;
        this.settings = settings
    }

    action(e, args) {

    }
}