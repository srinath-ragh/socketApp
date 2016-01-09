var express = require('express');
var http = require('http');
//var jade = require('jade');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
process.env.PORT = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var port = process.env.PORT || 3000;
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var morgan = require('morgan');
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
//var methodOverride = require('method-override');
process.env.NODE_ENV = 'production';
//app.use(morgan('dev'));	
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
//app.use(bodyParser());
app.use(bodyParser.urlencoded({'extended':'true'})); 			
app.use(bodyParser.json()); 									
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
//routes configuration
require('./app/routes.js')(app);

//Winston logger
var logger = require('./config/logger.js');

//EventHandler
var eventHandler = require('./app/eventHandler.js');

//DB Connect
var DBconnect = require('./app/DBConnect.js'),
dbconnect = new DBconnect();

COREAPI = {
	db: dbconnect,
	logger: logger
};

if (cluster.isMaster) {
	  // Fork workers.
	  for (var i = 0; i < numCPUs; i++) {
	    cluster.fork();
	  }

	  cluster.on('exit', function(worker, code, signal) {
	    console.log('worker '+worker.process.pid+' died with code '+code+' and signal '+signal);
	    eventHandler.emit('closeRedis');
	    console.log('Starting a new worker');
        cluster.fork();
	  });
	  
	} else {
		var server = http.createServer(app);
		server.listen(port, ipaddress, function() {
			COREAPI.logger.info('server instance pid: '+cluster.worker.id+' running at '+port,{ 'module': 'general' });
		});
		server.on('request', function(request){
			COREAPI.logger.silly('instance '+cluster.worker.id+' picks the '+request.method+' request from '+request.connection.remoteAddress, {route: 'Cluster'});
//			if(request.url==='/api/postMessage' && request.method === 'POST'){
//				COREAPI.logger.silly('published by '+cluster.worker.id, {route: 'postMessage'});
//				client.publish('postMessage', cluster.worker.id);
//			}
		});
		server.on('close', function() {
			eventHandler.emit('closeRedis');
			});
		process.on('SIGINT', function() {
			  server.close();
			});
		//Primus initialization
		require('./app/socket.js')(server);
	}