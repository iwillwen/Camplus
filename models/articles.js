module.exports = function (web) {
    var db = web.set('db');

    var Articles = db.collection('articles');
    web.set('Articles', Articles);
};