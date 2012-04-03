var config = require('./config');
var eventproxy = require('eventproxy').EventProxy;
var utils = require('./utils');
var generate = utils.generate(config);
var hash = utils.hash;

module.exports = function (web) {
    var Articles = web.set('Articles');
    var Categories = web.set('Categories');
    var Menus = web.set('Menus');
    var _ = web._;
    web.get({
        '/': function (req, res) {
            var index = new eventproxy();
            index.assign('arts', 'menus', function (arts, menus) {
                res.render('index', {
                    title: config.title,
                    local: {
                        menus: menus,
                        arts: arts
                    }
                });
            });
            Articles.find({}).toArray(function (err, arts) {
                if (err) return index.trigger('arts', []);
                index.trigger('arts', arts);
            });
            Menus.find({}).toArray(function (err, menus) {
                if (err) return index.trigger('menus', []);
                index.trigger('menus', menus);
            });
        },
        '/article/create': _(checkAuth, function (req, res) {
            res.render('create', {
                title: 'Create Article - ' + config.title,
                local: {}
            });
        }),
        '/article/:art': function (req, res) {
            Articles.findOne({url: '/article/' + req.params.art}, function (err, art) {
                if (err) return res.sendError(404);
                res.render('article', {
                    title: art.title + ' - ' + config.title,
                    local: {
                        title: art.title,
                        url: art.url,
                        content: art.content,
                        category: art.category
                    }
                });
            });
        },
        '/category/:category': function (req, res) {
            Categories.findOne({ title: req.params.category }, function (err, cate) {
                if (err) return res.sendError(404);
                Articles.find({ category: req.params.category }).toArray(function (err, arts) {
                    if (err) return res.sendError(404);
                    res.render('index', {
                        title: req.params.category + ' - ' + config.title,
                        local: {
                            menus: [{ title: "返回首页", href: "/" }],
                            arts: arts
                        }
                    });
                });
            });
        },
        '/login': function (req, res) {
            if (req.session.user == config.user) return res.redirect(config.url);
            res.render('admin/login', {
                title: 'Login',
                local: {}
            });
        },
        '/logout': function (req, res) {
            req.session.user = null;
            res.redirect('/');
        },
        '/feed': function (req, res) {
            Articles.find().toArray(function (err, arts) {
                res.send(generate((err?[]:arts)), 'text/xml');
            });
        }
    });
    web.post('/article/create', checkAuth, function (req, res) {
        req.data.url = '/article/' + req.data.url;
        Articles.insert(req.data, function (err) {
            if (err) return res.sendError(500);
            res.redirect(req.data.url);
        });
        Categories.findOne({ title: req.data.category }, function (err, cate) {
            if (!err) return;
            Categories.insert({
                title: req.data.category
            }, function () {});
        });
    });
    web.post('/admin/login', function (req, res) {
        if (req.data.user == config.user && hash('md5', req.data.pass) == config.pass) {
            req.session.user = config.user;
            res.redirect(config.url);
        }
    });
};

function checkAuth (req, res, next) {
    if (req.session.user == config.user) return next();
    res.redirect(config.url + '/login');
}