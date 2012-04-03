module.exports = function (web) {
    var db = web.set('db');

    var Menus = db.collection('menus');
    web.set('Menus', Menus);
};