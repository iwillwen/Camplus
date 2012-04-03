module.exports = function (web) {
    var db = web.set('db');

    var Categories = db.collection('categories');
    web.set('Categories', Categories);
};