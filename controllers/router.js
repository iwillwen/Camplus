var config = require('./config');
var eventproxy = require('eventproxy').EventProxy;
var utils = require('./utils');
var generate = utils.generate(config);
var hash = utils.hash;

module.exports = function (web) {
    var Articles = web.set('Articles');
    var Categories = web.set('Categories');
    var Menus = web.set('Menus');
    var LoginToken = web.set('LoginToken');
    var _ = web._;
    function checkAuth (req, res, next) {
        LoginToken.findOne({ session: req.session_id }, function (e, t) {
            if (e || t == null) return res.redirect(config.url + '/login');
            req.session.login = true;
            next();
        });
    }
    function checkAuth2 (req, res, next) {
        LoginToken.findOne({ session: req.session_id }, function (e, t) {
            req.session.login = true;
            if (e || t == null) req.session.login = false;
            next();
        });
    }
    web.get({
        '/': _(checkAuth2, function (req, res) { 
            var index = new eventproxy();
            index.assign('arts', 'menus', function (arts, menus) {
                res.render('index', {
                    title: config.title,
                    local: {
                        menus: menus,
                        arts: arts.slice(0, 10),
                        login: req.session.login
                    }
                });
            });
            Articles.find({}).sort({'_id': -1}).toArray(function (err, arts) {
                if (err) return index.trigger('arts', []);
                index.trigger('arts', arts);
            });
            Menus.find({}).toArray(function (err, menus) {
                if (err) return index.trigger('menus', []);
                index.trigger('menus', menus);
            });
        }),
        '/page/:page': _(checkAuth2, function (req, res) {
            Articles.find().skip((Number(req.params.page) - 1) * 10).limit(10).toArray(function (err, arts) {
                if (err) return res.sendError(404);
                res.render('index', {
                    title: 'Page ' + req.params.page + ' - ' + config.title,
                    local: {
                        menus: [{ title: "Return to Index", href: "/" }],
                        arts: arts,
                        login: req.session.login
                    }
                });
            });
        }),
        '/article/create': _(checkAuth, function (req, res) {
            res.render('create', {
                title: 'Create Article - ' + config.title,
                local: {
                    title: '',
                    url: '',
                    category: '',
                    content: ''
                }
            });
        }),
        '/article/remove/:url': _(checkAuth, function (req, res) {
            req.params.url = '/article/' + req.params.url;
            Articles.remove({url: req.params.url}, function (err) {
                if (err) return res.sendError(404);
               res.redirect(config.url);
            });
        }),
        '/article/edit/:url': _(checkAuth, function (req, res) {
            Articles.findOne({ url: '/article/' + req.params.url }, function (err, art) {
                if (err) return res.sendError(404);
                res.render('edit', {
                    title: 'Edit Article "' + art.title + '" - ' + config.title,
                    local: {
                        title: art.title,
                        url: art.url.replace(/^\/article\//, ''),
                        category: art.category,
                        content: art.content,
                        id: art._id,
                    }
                });
            });
        }),
        '/article/:art': _(checkAuth2, function (req, res) {
            Articles.findOne({url: '/article/' + req.params.art}, function (err, art) {
                if (err) return res.sendError(404);
                res.render('article', {
                    title: art.title + ' - ' + config.title,
                    local: {
                        title: art.title,
                        url: art.url.replace(/^\/article\//, ''),
                        content: art.content,
                        category: art.category,
                        login: req.session.login
                    }
                });
            });
        }),
        '/category/:category': _(checkAuth2, function (req, res) {
            Categories.findOne({ title: req.params.category }, function (err, cate) {
                if (err) return res.sendError(404);
                Articles.find({ category: req.params.category }).toArray(function (err, arts) {
                    if (err) return res.sendError(404);
                    res.render('index', {
                        title: req.params.category + ' - ' + config.title,
                        local: {
                            menus: [{ title: "Return to Index", href: "/" }],
                            arts: arts,
                            login: req.session.login
                        }
                    });
                });
            });
        }),
        '/login': function (req, res) {
            res.render('admin/login', {
                title: 'Login',
                local: {}
            });
        },
        '/logout': function (req, res) {
            LoginToken.remove({ session: req.session_id }, function (e, t) {
                res.redirect('/');
            });
        },
        '/feed': function (req, res) {
            Articles.find().toArray(function (err, arts) {
                res.send(generate((err?[]:arts)), 'text/xml');
            });
        },
        '/addmenu': _(checkAuth, function (req, res) {
            res.render('addmenu', {
                title: 'Add a new menu item - ' + config.title,
                local: {}
            });
        })
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
    web.post('/article/edit', function (req, res) {
        req.data.url = '/article/' + req.data.url;
        Articles.update({ url: req.data.url }, req.data, {safe:true}, function (err) {
            if (err) return res.sendError(404);
            res.redirect(req.data.url);
        });
    });
    web.post('/admin/login', function (req, res) {
        if (req.data.user == config.user && hash('md5', req.data.pass) == config.pass) {
            LoginToken.insert({ session: req.session_id }, function (e) {
                if (e) return res.sendError(500);
                res.redirect(config.url);
            });
        }
    });
    web.post('/addmenu', checkAuth, function (req, res) {
        Menus.insert(req.data, function (err) {
            if (err) return res.sendError(500);
            res.redirect(config.url);
        });
    });
};
