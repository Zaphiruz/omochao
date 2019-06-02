
// base class for commands
module.exports = class Command {
    constructor(name = 'undefined', bot, settings = {}) {
        this.name = name;
        this.bot = bot;
        this.settings = settings
    }

    action(e, args) {
        e.channel.send('This is a work in progress. Please try this command again later');
    }

    help(e, args) {
        e.channel.send('This is undocumented. Please try again later');
    }
}