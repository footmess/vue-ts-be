const { mongoose } = require('../core/mongodb');
//设置自增长键值
const autiIncrement = require('mongoose-auto-increment');

//标签模型
const tagSchema = new mongoose.Schema({
	name: { type: String, required: true, validate: /\S+/ },
	desc: String,
	icon: String,
	create_time: { type: Date, default: Date.now },
	update_time: { type: Date, default: Date.now }
});

//自增id插件配置
tagSchema.plugin(autiIncrement.plugin, {
	model: 'Tag',
	field: 'id',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model('Tag', tagSchema);
