var redis = require("redis"),
    redisClient = redis.createClient();

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



module.exports=redisDAL;