var userDAL = require('./DAL/userDAL.js'),
UserBase = require('./BLL/UserBase.js'),
userBase = new UserBase();

var UserAdministrator = function(){
	
};

UserAdministrator.prototype.getAllUsers = function(callback){
	return userDAL.getAllUsers(callback);
};

UserAdministrator.prototype.validateUserLogin = function(userDto, callback){
	return userBase.validateUserLogin(userDto, callback);
};

UserAdministrator.prototype.validateSocketUser = function(socketDto, callback){
	return userDAL.validateSocketUser(socketDto, callback);
};

UserAdministrator.prototype.getOnlineUsers = function(callback){
	return userDAL.getAllUsers(callback);
};

UserAdministrator.prototype.fetchUserDetails = function(userList, callback){
	return userDAL.fetchUserDetails(userList, callback);
};

UserAdministrator.prototype.addUser = function(userDto, callback){
	return userBase.addUser(userDto, callback);
};

UserAdministrator.prototype.fetchUserProfile = function(userList, callback){
	return userDAL.fetchUserProfile(userList, callback);
};


module.exports = UserAdministrator;