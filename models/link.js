const { mongoose } = require('../core/mongodb');
//设置自增长键值
const autiIncrement = require('mongoose-auto-increment');

//链接模型
const linkSchema = new mongoose.Schema({
	name: { type: String, required: true, validate: /\S+/ },
	des: { type: String, default: '' },
	url: { type: String, required: true, validate: /\S+/, default: '' },
	icon: { type: String, default: '' },
	// 类型 =>  // 1 :其他友情链接 2: 是博主的个人链接
	type: { type: Number, default: 1 },
	// 状态 => 0 不向外展示，1 向外展示，
	state: { type: Number, default: 1 },
	create_time: { type: Date, default: Date.now },
	update_time: { type: Date, default: Date.now }
});

//自增id插件配置
linkSchema.plugin(autiIncrement.plugin, {
	model: 'Link',
	field: 'id',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model('Link', linkSchema);
