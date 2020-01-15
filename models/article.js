const { mongoose } = require('../core/mongodb');
//设置自增长键值
const autiIncrement = require('mongoose-auto-increment');

const articleSchema = new mongoose.Schema({
	title: { type: String, required: true, validate: /\S+}/ },
	keyword: { type: String, default: '' },
	author: { type: String, required: true, validate: /\S+/ },
	desc: { type: String, required: true, validate: /\S+/ },
	//字数
	numbers: { type: Number, default: 0 },
	img_url: {
		type: String,
		default: 'https://web-img.benq.com.cn/news/lcd/20200115/20200115_25a8025f64e64f1399a66dbb63a2ee0a.jpg'
	},
	//文章类型 1:普通文章 2：简历 3：管理员介绍
	type: { type: Number, default: 1 },
	//文章发布状态 0 草稿 1 已发布
	state: { type: Number, default: 1 },
	//文章转载状态 0 原创 1 转载 2 混合
	origin: { type: Number, default: 0 },
	tags: [ { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tag', required: true } ],
	comments: [ { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Comments', required: true } ],
	category: [ { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category', required: true } ],
	like_users: [
		{
			id: { type: mongoose.Schema.Types.ObjectId },
			name: { type: String, required: true, default: '' },
			type: {
				type: Number,
				default: 1
			},
			avatar: {
				type: String,
				default: 'user'
			},
			introduce: {
				type: String,
				default: ''
			},
			create_time: { type: Date, default: Date.now }
		}
	],
	meta: {
		views: { type: Number, default: 0 },
		likes: { type: Number, default: 0 },
		comments: { type: Number, default: 0 }
	},
	create_time: { type: Date, default: Date.now },
	update_time: { type: Date, default: Date.now }
});

//自增id插件配置
adminSchema.plugin(autiIncrement.plugin, {
	model: 'Article',
	field: 'id',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model('Article', adminSchema);
