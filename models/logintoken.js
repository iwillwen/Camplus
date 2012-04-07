module.exports = function (web) {
    var db = web.set('db');

    var LoginToken = db.collection('logintoken');
    web.set('LoginToken', LoginToken);
};