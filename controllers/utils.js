var utils = module.exports;
var crypto = require('crypto');

utils.generate = function (config) {
    return function (data) {
        var atom = [
            '<?xml version="1.0" encoding="utf-8" ?>',
            '<feed xmlns="http://www.w3.org/2005/Atom">'
        ];
        atom.push('<title>' + config.title + '</title>');
        atom.push('<subtitle>' + config.description + '</subtitle>');
        atom.push('<link href="' + config.url + '" />');
        atom.push('<author><name>' + config.user + '</name></author>');
        data.forEach(function (n) {
            atom.push('<entry>');
            atom.push('<title>' + n.title + '</title>');
            atom.push('<link href="http://wen.c61.me' + n.url + '" />');
            atom.push('<category>' + n.category + '</category>');
            atom.push('<content type="html" xml:base="http://wen.c61.me/" xml:lang="en"><![CDATA[' + n.content + ']]></content>');
            atom.push('</entry>');
        });
        atom.push('</feed>');
        return atom.join('\n');
    };
};

utils.hash = function (m, s) {
    var hash = crypto.createHash(m);
    hash.update(s);
    return hash.digest('hex');
};