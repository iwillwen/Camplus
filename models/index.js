module.exports = function (web) {
    web.extend(__dirname + '/articles')
        .extend(__dirname + '/categories')
        .extend(__dirname + '/menus')
        .extend(__dirname + '/logintoken');
};