var userCollection,
obtainUserCollection = function(){
	if(!userCollection) {
		userCollection = COREAPI.db.getCollection('users');
	}	
};

var userDAL = {
	addUser: function(userDto, callback){
		obtainUserCollection();
		return userCollection.insert(userDto, callback);
	},
	getAllUsers: function(callback){
		obtainUserCollection();
		var conditions = {	
			},
			options = {
				'fields': {
					'firstname': 1,
					'email': 1,
					'location': 1
				}
			};
		userCollection.find(conditions, options).toArray(callback);
	},
	getUserByEmail: function(email, callback){
		var conditions = {
			'email': email	
		},
		options = {
			'fields': {
				'firstname': 1,
				'email': 1,
				'location': 1,
				'password': 1,
				'imgUrl': 1
			}
		};
		obtainUserCollection();
		userCollection.find(conditions, options).toArray(callback);
	},
	validateSocketUser: function(socketDto, callback){
		var conditions = {
			'email': socketDto.email,
			'_id': socketDto.hash
		},
		options = {
			'fields': {
				'firstname': 1
			}
		};
		obtainUserCollection();
		userCollection.count(conditions, options, callback);
	},
	fetchUserDetails: function(userList, callback){
		var conditions = {
				'_id': {
					'$in': userList
				}
			},
			options = {
				'fields': {
					'firstname': 1,
					'imgUrl': 1
				}
			};
		obtainUserCollection();
		userCollection.find(conditions, options).toArray(callback);
	},
	fetchUserProfile: function(userid, callback){
		var conditions = {
				'_id': userid
			},
			options = {
				'fields': {
					'password': 0
				}
			};
		obtainUserCollection();
		userCollection.find(conditions, options).toArray(callback);
	}
};

module.exports=userDAL;