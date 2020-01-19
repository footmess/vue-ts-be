const Message = require('../models/message');
const User = require('../models/user');
const { responseClient } = require('../utils/util.js');

//获取全部留言
exports.getMessageList = (req, res) => {
	let keyword = req.query.keyword || null;
	//状态 0=>未处理 1=>已处理
	let state = req.query.state || '';
	let pageNum = Number.parseInt(req.query.pageNum) || 1;
	let pageSize = Number.parseInt(req.query.pageSize) || 10;
	let conditions = {};
	if (state === '') {
		if (keyword) {
			const reg = new RegExp(keyword, 'i');
			conditions = {
				content: { $regex: reg }
			};
		}
	} else if (state) {
		state = Number.parseInt(state);
		if (keyword) {
			const reg = new RegExp(keyword, 'i');
			conditions = { $and: [ { $or: [ { state: state } ] }, { $or: [ { content: { $regex: reg } } ] } ] };
		} else {
			conditions = { state };
		}
	} else {
		state = 0;
		if (keyword) {
			const reg = new RegExp(keyword, 'i');
			conditions = { $and: [ { $or: [ { state: state } ] }, { $or: [ { content: { $regex: reg } } ] } ] };
		} else {
			conditions = { state };
		}
	}

	let skip =

			pageNum - 1 < 0 ? 0 :
			(pageNum - 1) * pageSize;
	let responseData = {
		count: 0,
		list: []
	};
	Message.countDocuments({}, (err, count) => {
		if (err) {
			console.error({ err });
		} else {
			responseData.count = count;
			//字段
			let fields = {
				user_id: 1,
				name: 1,
				avatar: 1,
				phone: 1,
				introduce: 1,
				content: 1,
				email: 1,
				state: 1,
				reply_list: 1,
				create_time: 1
			};
			let options = {
				skip,
				limit: pageSize,
				sort: { create_time: -1 }
			};
			Message.find(conditions, fields, options, (error, result) => {
				if (err) {
					console.error({ error });
				} else {
					responseData.list = result;
					responseClient(res, 200, 0, 'success', responseData);
				}
			});
		}
	});
};

//添加留言
exports.addMessage = (req, res) => {
	let { user_id, content, email, phone, name } = req.body;
	if (user_id) {
		User.findById({
			_id: user_id
		})
			.then((result) => {
				if (result) {
					let message = new Message({
						user_id: result.id,
						name:
							name ? name :
							result.name,
						avatar: result.avatar,
						phone: result.phone,
						introduce: result.introduce,
						content: result.content,
						email:
							email ? email :
							result.email
					});
					message
						.save()
						.then((data) => {
							responseClient(res, 200, 0, '添加成功', data);
						})
						.catch((err) => {
							console.error({ err });
						});
				} else {
				}
			})
			.catch((error) => {
				console.error({ error });
			});
	} else {
		let message = new Message({
			name,
			phone,
			email,
			content
		});
		message
			.save()
			.then((data) => {
				responseClient(res, 200, 0, '添加成功', data);
			})
			.catch((err2) => {
				console.error({ err2 });
			});
	}
};

//删除留言
exports.delMessage = (req, res) => {
	let { id } = req.body;
	Message.deleteMany({ _id: id })
		.then((result) => {
			if (result.n === 1) {
				responseClient(res, 200, 0, '删除成功');
			} else {
				responseClient(res, 200, 1, '留言不存在或者已经删除');
			}
		})
		.catch((err) => {
			console.error({ err });
		});
};

//留言详情
exports.getMessaggeDetail = (req, res) => {
	if (!req.session.userInfo) {
		responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
		return;
	}
	let { id } = req.body;
	Message.findOne({ _id: id })
		.then((data) => {
			responseClient(res, 200, 0, '操作成功', data);
		})
		.catch((err) => {
			console.error({ err });
		});
};

//回复留言
exports.addReplyMessage = (req, res) => {
	if (!req.session.userInfo) {
		responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
		return;
	}
	let { id, state, content } = req.body;
	Message.findById({ _id: id })
		.then((result) => {
			let list = result.reply_list;
			let item = {
				content
			};
			list.push(item);
			Message.update({ _id: id }, { state: Number.parseInt(state), reply_list: list })
				.then((data) => {
					responseClient(res, 200, 0, '操作成功', data);
				})
				.catch((err) => {
					console.error({ err });
				});
		})
		.catch((error) => {
			console.error({ error });
		});
};
