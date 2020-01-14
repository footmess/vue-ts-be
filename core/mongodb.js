/**
 * Mongoose module.
 * @file 数据库模块
 * @module core/mongoose
 */

const consola = require('consola');
const config = require('../config/index');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

//remove DeprecationWarning
mongoose.set('useFindAndModify', false);

// 让 mongoose 使用全局 Promise 库
mongoose.Promise = global.Promise;

// exports.exo = { obj: 2 };
// module.exports = { num: 1 };
exports.mongoose = mongoose;
exports.connect = () => {
	// 连接数据库
	mongoose.connect(config.mongodb.uri, {
		useCreateIndex: true,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		promiseLibrary: global.Promise
	});

	//连接错误
	mongoose.connection.on('error', (error) => {
		consola.warn('数据库连接失败', error);
	});

	//连接成功
	mongoose.connection.once('open', () => {
		consola.ready('数据库连接成功');
	});

	//自增ID初始化
	autoIncrement.initialize(mongoose.connection);

	return mongoose;
};
