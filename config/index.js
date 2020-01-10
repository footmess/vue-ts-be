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

exports.mongodb = {
	uri: `mongodb://${argv.db_username}:${argv.pwd}@127.0.0.1:${argv.dbport}||'27017'`,
	username: argv.username || 'DB_username',
	password: argv.pwd || 'DB_password'
};
