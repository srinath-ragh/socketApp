var convDAL = require('../DAL/convDAL.js'),
UserAdministrator = require('../../users/UserAdministrator.js'),
userAdmin = new UserAdministrator(), 
async = require('async');

var ConvBase = function(){
	
};

ConvBase.prototype.getConversationsByRoomName = function(roomName, callback){
	var fetchConvDetails = function(callback){
		return convDAL.getConversationsByRoomName(roomName, callback);
	},
	addUserDetails = function(convDetails, callback){
		var finalRes = [], 
		fetchUserDetails = function(conv, callback){
			var onUserFetch = function(err, userDetails){
				if(err){
					return callback(err);
				}
				if(userDetails.length){
					convDetails[convDetails.indexOf(conv)].userDetails = userDetails[0]; 
				}
				return callback(null, convDetails);
			};
			return userAdmin.fetchUserDetails([conv.from], onUserFetch);
		},
		onAllFetchComplete = function(err){
			if(err){
				return callback(err);
			}
			return callback(null, convDetails);
		};
		return async.each(convDetails, fetchUserDetails, onAllFetchComplete);
	};
	return async.waterfall([fetchConvDetails, addUserDetails], callback);
};

ConvBase.prototype.getConversations = function(roomName, callback){
	var fetchConvDetails = function(callback){
		return convDAL.getConversations(roomName, callback);
	},
	addUserDetails = function(convDetails, callback){
		var finalRes = [], 
		fetchUserDetails = function(conv, callback){
			var onUserFetch = function(err, userDetails){
				if(err){
					return callback(err);
				}
				if(userDetails.length){
					convDetails[convDetails.indexOf(conv)].userDetails = userDetails[0]; 
				}
				return callback(null, convDetails);
			};
			return userAdmin.fetchUserDetails([conv.from], onUserFetch);
		},
		onAllFetchComplete = function(err){
			if(err){
				return callback(err);
			}
			return callback(null, convDetails);
		}; //Check and remove this if its not required
		return async.each(convDetails, fetchUserDetails, onAllFetchComplete);
	};
	return async.waterfall([fetchConvDetails, addUserDetails], callback);
};

module.exports = ConvBase;