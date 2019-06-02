const openTemplate = /(\{\{)/;
const closeTemplate = /(\}\})/;
const matchProp = /(?<=\{\{)(.*?)(?=\}\})/;

module.exports = class TemplaterHelper {
    static mapToObject(string, object) {
        while( openTemplate.test(string) && closeTemplate.test(string) ) {
            let value = 'undefined';
            let prop = string.match(matchProp)[1].toLowerCase();
            if( prop in object ) {
                value = object[prop];
            }

            string = string.replace(`{{${prop}}}`, value);
        }

        return string;
    }
}