var async = require('async'), 
UserAdministrator = require('../../users/UserAdministrator.js'),
userAdmin = new UserAdministrator(),
redisDAL = require('../DAL/redisDAL.js'),
_ = require('underscore'),
mongo = require('mongodb');

var RedisBase = function(){
	
};

RedisBase.prototype.getOnlineUsers = function(currUser, callback) {
//	var validateSocketCredentials = function(callback){
//		return userAdmin.validateSocketUser(socketDto, callback);
//	},
//	addSocketToUser = function(userCount, callback){
//		console.log('userCount - ',userCount);
//	};
//	async.waterfall([validateSocketCredentials, addSocketToUser], callback);
	var fetchAllOnlineUsers = function(callback){
		return redisDAL.getOnlineUsers(currUser, callback);
	},
	removeCurrUser = function(users, callback){
		var cleanUsers = [];
		if(users.length){
			users.forEach(function(user){
				if(user!==currUser+'::sockets'){
					cleanUsers.push(new mongo.ObjectID(user.replace('::sockets', '')));					
				}
			});
//			console.log('currUser - ',currUser);
//			console.log('bf cleanUsers - ',cleanUsers);
//			cleanUsers = _.without(cleanUsers, new mongo.ObjectID(currUser));
//			console.log('af cleanUsers - ',cleanUsers);
			if(cleanUsers.length){
				return userAdmin.fetchUserDetails(cleanUsers, callback);
			} else {
				return callback(null, cleanUsers);
			}
		} else {
			return callback(null, users);
		}
	};
	return async.waterfall([fetchAllOnlineUsers, removeCurrUser], callback);
};

module.exports = RedisBase;