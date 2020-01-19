const { mongoose } = require('../core/mongodb');
//设置自增长键值
const autiIncrement = require('mongoose-auto-increment');

//分类集合模型
const categorySchema = new mongoose.Schema({
	name: { type: String, required: true, validate: /\S+/ },
	desc: { type: String, default: '' },
	create_time: { type: Date, default: Date.now },
	update_time: { type: Date, default: Date.now }
});

//自增id插件配置
categorySchema.plugin(autiIncrement.plugin, {
	model: 'Category',
	field: 'id',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model('Category', categorySchema);
