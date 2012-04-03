var cluster = require('node-cluster');

var master = new cluster.Master();
master.register(888, __dirname + '/controllers/index.js').dispatch();