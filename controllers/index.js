var web = require('webjs');
var mongo = require('mongoskin');
var config = require('./config');
var cluster = require('node-cluster');

var db = mongo.db(config.db);
var app = web.create();
app.config({
        'view engine': 'jade',
        'views': __dirname + '/../views',
        'readonly': false,
        'mode': 'pro'
    })
    .set('db', db)
    .use(web.static(__dirname + '/../static'))
    .use(web.cookieParser())
    .use(web.session())
    .use(web.bodyParser())
    .use(web.compiler({ enable: ["less"] }))
    .use(web.compress())
    .extend(__dirname + '/../models/')
    .extend(__dirname + '/router');

web.server.close();

var worker = new cluster.Worker();
worker.ready(function(socket) {
    web.server.emit('connection', socket);
});
