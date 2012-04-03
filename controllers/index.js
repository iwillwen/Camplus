var web = require('webjs');
var mongo = require('mongoskin');
var config = require('./config');
var cluster = require('node-cluster');

var app = web.create();
var db = mongo.db(config.db);
app.config({
        'view engine': 'jade',
        'views': __dirname + '/../views',
        'readonly': false,
        'mode': 'pro'
    })
    .set('db', db)
    .use(app.static(__dirname + '/../static'))
    .use(app.cookieParser())
    .use(app.session())
    .use(app.bodyParser())
    .use(app.compiler({ enable: ["less"] }))
    .use(app.compress())
    .extend(__dirname + '/../models/')
    .extend(__dirname + '/router');

var worker = new cluster.Worker();
worker.ready(function(socket) {
    app.emit('connection', socket);
});