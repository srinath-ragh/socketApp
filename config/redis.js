module.exports = {
	development: {
		auth: '',
		host: 'localhost',
		port: 6379
	},
	production: {
		auth: 'chirp',
		host: 'pub-redis-16129.us-east-1-3.4.ec2.garantiadata.com',
		port: 16129
	}
};