var redis = require("redis"),
	redisConfig = require('../../../../config/redis.js'),
    redisClient = redis.createClient(redisConfig[process.env.NODE_ENV]),
    eventHandler = require('../../../../app/eventHandler.js');

var redisDAL = {
	clipSocketToUser: function(socketDto, callback){
		var listName = socketDto.hash+'::sockets';
		COREAPI.logger.debug('before push '+listName, {route: 'clipSocketToUser'});
		return redisClient.lpush(listName, socketDto.socketid, callback);	
	},
	unclipSocketFromUser: function(socketDto, callback){
		var listName = socketDto.hash+'::sockets';
		return redisClient.lrem(listName, 0, socketDto.socketid, callback);	
	},
	getOnlineUsers: function(currUser, callback){
		var pattern = '*::sockets';
//		var pattern = '*[^'+currUser+']*::sockets';
//		console.log('pattern - ',pattern);
		return redisClient.keys(pattern, callback);
	}
};

eventHandler.on('closeRedis', function(){
	redisClient.end();
	console.log('Redis connections closed - redisDAL.js');
});


module.exports=redisDAL;