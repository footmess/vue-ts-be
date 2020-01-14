// user数据模型  orm

const crypto = require('crypto');
// yargs 模块能够解决如何处理命令行参数
// argv 对象，用来读取命令行参数
const { argv } = require('yargs');
const { mongoose } = require('../core/mongodb');
//设置自增长键值
const autiIncrement = require('mongoose-auto-increment');

const adminSchema = new mongoose.Schema({
	//github用户的id
	github_id: { type: String, default: '' },
	name: { type: String, default: '', required: true },
	//用户类型  0:博主,1:其他用户,2:github,3:weixin,4:qq
	type: { type: Number, default: 1 },
	phone: { type: String, default: '' },
	img_url: { type: String, default: '' },
	email: { type: String, default: '' },
	introduce: { type: String, default: '' },
	avatar: { type: String, default: 'user' },
	location: { type: String, default: 'user' },
	password: {
		type: String,
		required: true,
		default: crypto.createHash('md5').update(argv.auth_default_password || 'root').digest('hex')
	},
	create_time: { type: Date, default: Date.now },
	update_time: { type: Date, default: Date.now }
});

//自增id插件配置
adminSchema.plugin(autiIncrement.plugin, {
	model: 'User',
	field: 'id',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model('User', adminSchema);
