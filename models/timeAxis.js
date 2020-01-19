const { mongoose } = require('../core/mongodb');
//设置自增长键值
const autiIncrement = require('mongoose-auto-increment');

//时间轴模型
const timeAxisSchema = new mongoose.Schema({
	title: { type: String, required: true },
	content: { type: String, required: true },
	// 状态 1 是已经完成 ，2 是正在进行，3 是没完成
	state: { type: Number, default: 1 },
	start_time: { type: Date, default: Date.now },
	end_time: { type: Date, default: Date.now },
	update_time: { type: Date, default: Date.now }
});

//自增id插件配置
timeAxisSchema.plugin(autiIncrement.plugin, {
	model: 'TimeAxis',
	field: 'id',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model('TimeAxis', timeAxisSchema);
