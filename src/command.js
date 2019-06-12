
// base class for commands
module.exports = class Command {
    constructor(name = 'undefined', bot, settings = {}) {
        this.name = name;
        this.bot = bot;
        this.settings = settings;
        this.restrictedByRole = false;
    }

    argsToLowerCase(args) {
        return args.map( s => s.toLowerCase() );
    }

    verification(e, args) {
        if( this.restrictedByRole && !e.member.roles.some( r => r.name === 'Omochao') ) {
            return false;
        }

        return true;
    }
    
    triggerAction(e, args) {
        if( this.verification(e, args) ) {
            this.action(e, this.argsToLowerCase(args));
        }
    }

    action(e, args) {
        e.channel.send('This is a work in progress. Please try this command again later');
    }

    help(e, args) {
        e.channel.send('This is undocumented. Please try again later');
    }
}