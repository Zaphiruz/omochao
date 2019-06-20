const openTemplate = /(\{\{)/;
const closeTemplate = /(\}\})/;
const matchProp = /(?<=\{\{)(.*?)(?=\}\})/;

module.exports = class TemplaterHelper {
    static mapToObject(string, object) {
        while( openTemplate.test(string) && closeTemplate.test(string) ) {
            let value = 'undefined';
            let prop = string.match(matchProp)[1];

            let props = prop.toLowerCase().split('.');
            value = getValue(object, props).toString();

            string = string.replace(`{{${prop}}}`, value);
        }

        return string;
    }
}

function getValue(obj, [prop, ...props]) {
    if( !(prop in obj) ) {
        return undefined;
    }

    if( props.length == 0 ) {
        return obj[prop];
    }

    return getValue(obj[prop], props);
}