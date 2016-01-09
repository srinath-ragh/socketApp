var winston = require('winston'),
dbConfig = require('../config/mongodb.js'),
redisConfig = require('../config/redis.js');
//require('winston-mongodb');
//require('winston-redis');

var env = dbConfig[process.env.NODE_ENV],
user = env.user,
pass = env.pass,
host = env.host,
port = env.port,
database = env.database,
url;
if(user && pass){
	url = 'mongodb://'+user+':'+pass+'@'+host+':'+port+'/'+database;
} else {
	url = 'mongodb://'+host+':'+port+'/'+database;
}

var mongoOptions = {
	db: url
};

var config = {
	  levels: { silly: 0, verbose: 1, info: 2, data: 3, warn: 4, debug: 5, error: 6 },
	  colors: { silly: 'magenta', verbose: 'cyan', info: 'green', data: 'grey', warn: 'yellow', debug: 'blue', error: 'red' }
	};

var logger = new (winston.Logger)({
	  transports: [new (winston.transports.Console)({
		  			level: 'error',
	       	      	colorize: true
	       	    	})]
	});


logger.setLevels(config.levels);
winston.addColors(config.colors);

//	       	    new (winston.transports.MongoDB)(mongoOptions),
//	       	    new (winston.transports.Redis)(redisConfig)

module.exports = logger;