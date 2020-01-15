const { mongoose } = require('../core/mongodb');
//设置自增长键值
const autiIncrement = require('mongoose-auto-increment');

//评论模型
const commentSchema = new mongoose.Schema({
	//评论所在的文章id
	article_id: { type: mongoose.Schema.Types.ObjectId, required: true },
	//content
	content: { type: String, required: true, validate: /\S+/ },
	//是否置顶
	is_top: { type: Boolean, default: false },
	//被赞数
	likes: {
		tyoe: Number,
		default: 0
	},
	//用户id
	user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	//父评论的用户信息
	user: {
		user_id: { type: mongoose.Schema.Types.ObjectId },
		name: {
			type: String,
			require: true,
			default: ''
		},
		//用户类型 0 博主 1 其他
		type: {
			type: Number,
			default: 1
		},
		avatar: {
			type: String,
			default: 'user'
		}
	},
	other_comments: [
		{
			user: {
				user_id: { type: mongoose.Schema.Types.ObjectId },
				name: {
					type: String,
					require: true,
					default: ''
				},
				//用户类型 0 博主 1 其他
				type: {
					type: Number,
					default: 1
				},
				avatar: {
					type: String,
					default: 'user'
				}
			},
			to_user: {
				user_id: { type: mongoose.Schema.Types.ObjectId },
				name: {
					type: String,
					require: true,
					default: ''
				},
				//用户类型 0 博主 1 其他
				type: {
					type: Number,
					default: 1
				},
				avatar: {
					type: String,
					default: 'user'
				}
			},
			likes: { tyoe: Number, default: 0 },
			content: {
				type: String,
				required: true,
				validate: /\S+/
			},
			//状态：0 待审核 1 通过 -1已删除 -2 垃圾评论
			state: {
				type: Number,
				default: 1
			},
			create_time: { type: Date, default: Date.now }
		}
	],
	state: { type: Number, default: 1 },
	//是否已经处理过 1 是 2 否
	is_handle: { type: Number, default: 2 },
	create_time: { type: Date, default: Date.noe },
	update_time: { type: Date, default: Date.now }
});

//自增id插件配置
adminSchema.plugin(autiIncrement.plugin, {
	model: 'Comment',
	field: 'id',
	startAt: 1,
	incrementBy: 1
});

module.exports = mongoose.model('Comment', commentSchema);
