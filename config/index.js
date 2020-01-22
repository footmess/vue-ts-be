/**
 * App config module.
 * @file 应用运行配置
 * @module config
 */

const path = require('path');
// yargs 模块能够解决如何处理命令行参数
// argv 对象，用来读取命令行参数
const { argv } = require('yargs');

exports.APP = {
	limit: 10,
	port: 8000,
	root_path: __dirname,
	name: 'tony',
	url: 'my-blog_index.html',
	front_end_path: path.join(__dirname, '..', 'tony')
};

exports.CROSS_DOMAIN = {
	allowedOrigins: [],
	allowedReferer: ''
};

exports.mongodb = {
	// uri: `mongodb://${argv.db_username}:${argv.pwd}@127.0.0.1:27017`,
	uri: 'mongodb://tony:666666@127.0.0.1:27017/blog',
	username: argv.username || 'DB_username',
	password: argv.pwd || 'DB_password'
};

exports.AUTH = {
	data: argv.auth_data || { user: 'root' },
	jwtTokenSecret: argv.auth_key || 'blog-node',
	defaultPassword: argv.auth_default_password || 'root'
};

exports.EMAIL = {
	account: argv.email_account || 'your email address like : i@biaochenxuying',
	password: argv.email_password || 'your email password',
	from: 'https://github.com/biaochenxuying',
	admin: 'biaochenxuying'
};
