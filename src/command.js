
// base class for commands
module.exports = class Command {
    constructor(name = 'undefined', bot) {
        this.name = name;
        this.bot = bot;
    }

    action(e, args) {

    }
}