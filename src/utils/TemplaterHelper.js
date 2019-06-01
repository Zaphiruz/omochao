const openTemplate = /(\{\{)/;
const closeTemplate = /(\}\})/;
const matchProp = /(?<=\{\{)(.*?)(?=\}\})/;

module.export = class TemplaterHeper {
    static mapToObject(string, object) {
        while( openTemplate.test(string) && closeTemplate.test(string) ) {
            let value = 'undefined';
            let prop = string.match(matchProp)[1].toLowerCase();
            if( prop in object ) {
                value = object[prop];
            }

            stirng.replace(matchProp, value);
        }
    }
}