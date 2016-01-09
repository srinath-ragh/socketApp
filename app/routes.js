var UserAdministrator = require('./modules/users/UserAdministrator.js'),
userAdmin = new UserAdministrator(),
ConvAdministrator = require('./modules/conversation/ConvAdministrator.js'),
convAdmin = new ConvAdministrator(),
RedisAdministrator = require('./modules/redis/RedisAdministrator.js'),
redisAdmin= new RedisAdministrator(),
mongo = require('mongodb'),
eventHandler = require('./eventHandler.js'),
cluster = require('cluster'),
redis = require('redis'),
redisConfig = require('../config/redis.js'),
client = redis.createClient(redisConfig[process.env.NODE_ENV]);

eventHandler.on('closeRedis', function(){
	client.end();
	COREAPI.db.closeDB();
	console.log('Redis connections closed - routes.js');
});

module.exports = function(app) {
	// API
	app.get('/', function(req, res) {
		res.end('Welcome to Socket API');
	});
	app.get('/connect', function(req, res){
		COREAPI.db.connect();
		res.end('DB Connected');
	});
	app.get('/getRecords', function(req, res){
		COREAPI.db.getRecords();
		res.end('DB queried');
	});
	app.get('/logMe', function(req, res){
		COREAPI.logger.silly('silly request!', {route: 'logMe'});
		COREAPI.logger.info('info request!', {route: 'logMe'});
		COREAPI.logger.verbose('verbose request!', {route: 'logMe'});
		COREAPI.logger.error('error request!', {route: 'logMe'});
		COREAPI.logger.debug('debug request!', {route: 'logMe'});
		COREAPI.logger.warn('warn request!', {route: 'logMe'});
		COREAPI.logger.data('data request!', {route: 'logMe'});
		res.end('logged!');
	});
	app.get('/api/loginUser', function(req, res){
		COREAPI.logger.info('route accessed',{ module: 'users', route: 'loginUser' });
		var email = req.headers.email,
		pass = req.headers.password,
		onValidation = function(err, data){
			if(err) {
				COREAPI.logger.error(err,{ module: 'users', route: 'loginUser' });
				return res.status(500).end(err);
			}
			return res.json(data);
		};
		
		if(email && pass) {
			var loginDto = {
				'email': email,
				'password': pass
			};
			return userAdmin.validateUserLogin(loginDto ,onValidation);
		} else {
			res.status(500).json({ error: 'Mandatory params missing!' });
		}
	});
	app.get('/api/getOnlineUsers', function(req, res){
		var currUser = (req.cookies.hash) ? req.cookies.hash.replace(/"/g,''): null,
		onFetch = function(err, data){
			if(err) {
				COREAPI.logger.error(err,{ module: 'users', route: 'getOnlineUsers' });
				return res.status(500).end(err);
			}
			return res.json(data);
		};
//		return userAdmin.getOnlineUsers(onFetch);
		if(currUser){
			return redisAdmin.getOnlineUsers(currUser, onFetch);
		} else {
			var err='Mandatory hash param empty!';
			COREAPI.logger.error(err,{ module: 'users', route: 'getOnlineUsers' });
			return res.status(500).end(err);
		}
	});
	app.get('/api/getUserProfile/:currUser', function(req, res){
//		var currUser = (req.cookies.hash) ? new mongo.ObjectID(req.cookies.hash.replace(/"/g,'')): null,
		var currUser = (req.params.currUser) ? new mongo.ObjectID(req.params.currUser): null,
		onFetch = function(err, data){
			if(err) {
				COREAPI.logger.error(err,{ module: 'users', route: 'getUserProfile' });
				return res.status(500).end(err);
			}
			return res.json(data);
		};
//		return userAdmin.getOnlineUsers(onFetch);
		if(currUser){
			return userAdmin.fetchUserProfile(currUser, onFetch);
		} else {
			var err='Mandatory hash param empty!';
			COREAPI.logger.error(err,{ module: 'users', route: 'getUserProfile' });
			return res.status(500).end(err);
		}
	});
	app.get('/api/getConversations', function(req, res){
		//Get conversations for particular room name
		var currUser = (req.cookies.hash) ? req.cookies.hash.replace(/"/g,''): null,
		roomName = req.query.room,
		onFetch = function(err, data){
			if(err) {
				COREAPI.logger.error(err,{ module: 'conversations', route: 'getConversations' });
				return res.status(500).end(err);
			}
			return res.json(data);
		};
		if(roomName){
			return convAdmin.getConversationsByRoomName(roomName, onFetch);
		} else {
			var err='Mandatory room param empty!';
			COREAPI.logger.error(err,{ module: 'conversations', route: 'getConversations' });
			return res.status(500).end(err);
		}
	});
	app.get('/api/getAllConversations', function(req, res){
		//Get conversations for particular room name
		var convReqDto = {
			'roomName' : req.query.room,
			'skip' : (req.query.skip) ? parseInt(req.query.skip) : 0,
			'limit' : (req.query.limit) ? parseInt(req.query.limit) : 0,
			'currUser': (req.cookies.hash) ? req.cookies.hash.replace(/"/g,''): null
		},
		onFetch = function(err, data){
			if(err) {
				COREAPI.logger.error(err,{ module: 'conversations', route: 'getConversations' });
				return res.status(500).end(err);
			}
			return res.json(data);
		};
		if(convReqDto.roomName){
			return convAdmin.getConversations(convReqDto, onFetch);
		} else {
			var err='Mandatory room param empty!';
			COREAPI.logger.error(err,{ module: 'conversations', route: 'getConversations' });
			return res.status(500).end(err);
		}
	});
	//POST methods
	app.post('/api/postMessage', function(req, res){
		var currUser = (req.cookies.hash) ? req.cookies.hash.replace(/"/g,''): null,
		postBody = req.body,
		onPostSuccess = function(err, data){
			if(err) {
				COREAPI.logger.error(err,{ module: 'conversations', route: 'postMessage' });
				return res.status(500).end(err);
			} else if(data.result.ok){
				//Raise an event for UI to refresh
//				eventHandler.emit('serverCom', 'messagePosted');
				COREAPI.logger.silly('published by '+cluster.worker.id, {route: 'postMessage'});
				client.publish('postMessage', 'messagePosted');
				return res.json({'insert': 'success'});
			} else {
				err = 'Something wrong with the insert operation';
				return res.status(500).end(err);
			}
		};
		if(postBody.content && postBody.room  && postBody.to){
			var messageDto = {
				'from': new mongo.ObjectID(currUser),
				'content': postBody.content,
				'roomName': postBody.room,
				'to': postBody.to,
				'createdTime': new Date().toISOString(),
				'modifiedTime': new Date().toISOString()
			};
			return convAdmin.postMessage(messageDto, onPostSuccess);
		} else {
			var err='Mandatory post body params are empty!';
			COREAPI.logger.error(err,{ module: 'conversations', route: 'postMessage' });
			return res.status(500).end(err);
		}
	});
	
	app.post('/api/registerUser', function(req, res){
		var postBody = req.body,
		onPostSuccess = function(err, data){
			if(err) {
				COREAPI.logger.error(err,{ module: 'users', route: 'registerUser' });
				return res.status(500).end(err);
			} else if(data.result.ok){
				//Raise an event for new user
//				eventHandler.emit('serverCom', 'messagePosted');
				return res.json({'insert': 'success'});
			} else {
				err = 'Something wrong with the insert operation';
				return res.status(500).end(err);
			}
		};
		if(postBody.email && postBody.firstname  && postBody.sex && (postBody.password===postBody.cnfpassword)){
			return userAdmin.addUser(postBody, onPostSuccess);
		} else {
			var err='Mandatory post body params are empty!';
			COREAPI.logger.error(err,{ module: 'users', route: 'registerUser' });
			return res.status(500).end(err);
		}
	});
};