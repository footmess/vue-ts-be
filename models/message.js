const { mongoose } = require('../core/mongodb');
//设置自增长键值
const autiIncrement = require('mongoose-auto-increment');

//留言模型
const messageSchema = new mongoose.Schema({
	user_id: { type: String, default: '' },
	name: { type: String, default: '' },
	avatar: { type: String, default: 'user' },
	phone: { type: String, default: '' },
	introduce: { type: String, default: '' },
	content: { type: String, required: true },
	//回复留言内容
	reply_list: [ { content: { type: String, required: true } } ],
	email: { type: String, default: '' },
	//状态 0=>未处理 1=>已处理
	state: { type: Number, default: 0 },
	create_time: { type: Date, default: Date.now },
	update_time: { type: Date, default: Date.now }
});

//自增id插件配置
messageSchema.plugin(autiIncrement.plugin, {
	model: 'Message',
	field: 'id',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model('Message', messageSchema);
