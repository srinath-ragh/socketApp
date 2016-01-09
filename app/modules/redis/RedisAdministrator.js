var redisDAL = require('./DAL/redisDAL.js'),
RedisBase = require('./BLL/RedisBase.js'),
redisBase = new RedisBase();

var RedisAdministrator = function(){
	
};

RedisAdministrator.prototype.clipSocketToUser = function(socketDto, callback){
	return redisDAL.clipSocketToUser(socketDto, callback);
};

RedisAdministrator.prototype.unclipSocketFromUser = function(socketDto, callback){
	return redisDAL.unclipSocketFromUser(socketDto, callback);
};

RedisAdministrator.prototype.getOnlineUsers = function(currUser, callback){
	return redisBase.getOnlineUsers(currUser, callback);
};

module.exports = RedisAdministrator;