var convCollection,
obtainConvCollection = function(){
	if(!convCollection) {
		convCollection = COREAPI.db.getCollection('conversations');
	}	
};

var convDAL = {
	getConversationsByRoomName: function(roomName, callback){
		obtainConvCollection();
		var conditions = {
				'roomName': roomName
			},
			options = {
				'fields': {
					'from': 1,
					'to': 1,
					'content': 1,
					'readFlag': 1,
					'createdTime':1,
					'modifiedTime':1
				}
			},
			orderBy = {
				'modifiedTime': 1
			};
		return convCollection.find(conditions, options).sort(orderBy).toArray(callback);
	},
	getConversations: function(convReqDto, callback){
		obtainConvCollection();
		var conditions = {
				'roomName': convReqDto.roomName
			},
			options = {
				'fields': {
					'from': 1,
					'to': 1,
					'content': 1,
					'readFlag': 1,
					'createdTime':1,
					'modifiedTime':1
				}
			},
			orderBy = {
				'modifiedTime': -1
			},
			skip = convReqDto.skip,
			limit = convReqDto.limit;
		return convCollection.find(conditions, options).sort(orderBy).skip(skip).limit(limit).toArray(callback);
	},
	postMessage: function(messageDto, callback){
			obtainConvCollection();
			return convCollection.insert(messageDto, callback);
	}
};



module.exports=convDAL;