var userDAL = require('../DAL/userDAL.js');

var UserBase = function(){
	
};

UserBase.prototype.validateUserLogin = function(userDto, callback) {
	var userDtLgth=0, onUserFetch = function(err, userRec) {
		if(err) {
			COREAPI.logger.error('validateUserLogin ',err, { 'module': 'user' });
			return callback(err);
		}
		userDtLgth = userRec.length ? userRec.length : 0;
		if(userDtLgth){
//			COREAPI.logger.info('getUserByEmail Res -  ',userRec, { module: 'users', route: 'loginUser' });
			userRec = userRec[0];
			if(userRec.password === userDto.password){
				COREAPI.logger.info('Auth Passed!', { module: 'users', route: 'loginUser' });
				delete userRec.password;
				return callback(null, userRec);
			} else {
				COREAPI.logger.error('Auth Failed!', { module: 'users', route: 'loginUser' });
				return callback('User credentials seems to be invalid!');
			}
//			COREAPI.logger.silly('getUserByEmail Res -  ',userRec, { 'module': 'user' });
		} else {
			COREAPI.logger.error('No user found for the provided email', { 'module': 'user' });
			return callback('No user found for the provided email');
		}
	};
	return userDAL.getUserByEmail(userDto.email, onUserFetch);
};

UserBase.prototype.addUser = function(postBody, callback) {
	var userDto = {
			'email': postBody.email,
			'firstname': postBody.firstname,
			'lastname': postBody.lastname,
			'sex': postBody.sex,
			'city': postBody.city,
			'password': postBody.password,
			'mobile': postBody.mobile,
			'imgUrl': postBody.imgUrl,
			'createdTime': new Date().toISOString(),
			'modifiedTime': new Date().toISOString()
		};
	return userDAL.addUser(userDto, callback);
};

module.exports = UserBase;