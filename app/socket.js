var Primus = require('primus'),
PrimusCluster = require('primus-cluster'),
cookie = require('cookie'),
cluster = require('cluster'),
redis = require("redis"),
redisConfig = require('../config/redis.js'),
socketRedisClient = redis.createClient(redisConfig[process.env.NODE_ENV]),
usrActvyRedisClient = redis.createClient(redisConfig[process.env.NODE_ENV]),
options = {
	port: process.env.PORT || 3000, 
	transformer: 'engine.io',
	cluster: {
		redis: redisConfig[process.env.NODE_ENV]
	}
},
RedisAdministrator = require('./modules/redis/RedisAdministrator.js'),
redisAdmin = new RedisAdministrator(),
eventHandler = require('./eventHandler.js');

module.exports = function(server){
	var primus = new Primus(server, options);
	primus.use('cluster', PrimusCluster);
//	primus.save('./public/js' +'/primus.js');
	socketRedisClient.subscribe('postMessage');
	COREAPI.logger.info('primus listening at '+options.port,{ 'module': 'general' });
	
	primus.authorize(function (req, done) {
		if(req.headers.cookie){
			var cookieObj = cookie.parse(req.headers.cookie);
			
			var email = cookieObj.email ? (cookieObj.email.replace(/"/g,'')):null,
			hash = cookieObj.hash ? (cookieObj.hash.replace(/"/g,'')):null;
			cookieObj.email = email;
			cookieObj.hash = hash;
			if(email && hash){
				done();
			} else {
				done('Socket Auth Failed!');
			}
		} else {
			done('Unable to parse cookie, Auth Failed!');
		}
	});
	
	primus.on('connection', function (spark) {
		COREAPI.logger.info('Client connected with spark id - ', spark.id,{ 'module': 'general' , 'event': 'socketClip'});
		var cookObj = cookie.parse(spark.headers.cookie);
		cookObj.email= cookObj.email ? (cookObj.email.replace(/"/g,'')):null;
		cookObj.hash= cookObj.hash ? (cookObj.hash.replace(/"/g,'')):null;
		var clipDto = {
			'hash': cookObj.hash,
			'socketid': spark.id
		};
		return redisAdmin.clipSocketToUser(clipDto, function(err, res){
			if(err) {
				COREAPI.logger.error(err,{ 'module': 'general' , 'event': 'socketClip'});
			} 
			usrActvyRedisClient.publish('postMessage','usersActivityChange');
		});
	});
	
	primus.on('disconnection', function (spark) {
		COREAPI.logger.info('Client disconnected with spark id - ', spark.id,{ 'module': 'general' , 'event': 'socketUnclip'});
		var cookObj = cookie.parse(spark.headers.cookie);
		cookObj.email= cookObj.email ? (cookObj.email.replace(/"/g,'')):null;
		cookObj.hash= cookObj.hash ? (cookObj.hash.replace(/"/g,'')):null;
		var unclipDto = {
				'hash': cookObj.hash,
				'socketid': spark.id
			};
		return redisAdmin.unclipSocketFromUser(unclipDto, function(err, res){
			if(err) {
				COREAPI.logger.error(err,{ 'module': 'general' , 'event': 'socketUnclip'});
			} 
			usrActvyRedisClient.publish('postMessage','usersActivityChange');
		}); 
	});
	COREAPI.logger.info('listener deployed');
	socketRedisClient.on('message', function (channel, message) {
//		COREAPI.logger.debug("socketRedisClient of "+cluster.worker.id+" channel " + channel + ": " + message);
		COREAPI.logger.info(message+' socket write complete - '+cluster.worker.id);
		primus.write(message);
	});
	
	//Server communcations through events
	eventHandler.on('serverCom', function(data){
		if(data === 'messagePosted'){
			primus.write('messagePosted');
		}
	});
};