var convDAL = require('./DAL/convDAL.js'),
ConvBase = require('./BLL/ConvBase.js'),
convBase = new ConvBase();

var ConvAdministrator = function(){
	
};

ConvAdministrator.prototype.getConversationsByRoomName = function(roomName, callback){
	return convBase.getConversationsByRoomName(roomName, callback);
};

ConvAdministrator.prototype.getConversations = function(convReqDto, callback){
	return convBase.getConversations(convReqDto, callback);
};

ConvAdministrator.prototype.postMessage = function(messagDto, callback){
//	return callback(null, messagDto);
	return convDAL.postMessage(messagDto, callback);
};


module.exports = ConvAdministrator;