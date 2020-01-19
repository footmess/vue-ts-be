const TimeAxis = require('../models/timeAxis');
const { responseClient } = require('../utils/util.js');

//获取全部时间轴内容
exports.getTimeAxisList = (req, res) => {
	let keyword = req.query.keyword || null;
	let state = req.query.state || '';
	let pageNum = Number.parseInt(req.query.pageNum) || 1;
	let pageSize = Number.parseInt(req.query.pageSize) || 10;
	let conditions = {};
	if (!state) {
		if (keyword) {
			const reg = new RegExp(keyword, 'i');
			conditions = {
				$or: [ { title: { $regex: reg } }, { content: { $regex: reg } } ]
			};
		}
	} else if (state) {
		state = Number.parseInt(state);
		if (keyword) {
			const reg = new RegExp(keyword, 'i');
			conditions = {
				$and: [
					{ $or: [ { state: state } ] },
					{ $or: [ { title: { $regex: reg } }, { content: { $regex: reg } } ] }
				]
			};
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
	TimeAxis.countDocuments({}, (err, count) => {
		if (err) {
			console.error({ err });
		} else {
			responseData.count = count;
			let fields = {
				title: 1,
				content: 1,
				state: 1,
				start_time: 1,
				end_time: 1
			};
			let options = {
				skip,
				limit: pageSize,
				sort: { end_time: -1 }
			};
			TimeAxis.find(conditions, fields, options, (error, result) => {
				if (error) {
					console.error({ error });
				} else {
					responseData.list = result;
					responseClient(res, 200, 0, '操作成功', responseData);
				}
			});
		}
	});
};

//添加时间轴
exports.addTimeAxis = (req, res) => {
	let { title, state, content, start_time, end_time } = req.body;
	TimeAxis.findOne({ title })
		.then((result) => {
			if (!result) {
				let timeAxis = new TimeAxis({
					title,
					state,
					content,
					start_time,
					end_time
				});
				timeAxis
					.save()
					.then((data) => {
						responseClient(res, 200, 0, '操作成功', data);
					})
					.catch((error) => {
						console.error({ error });
					});
			} else {
				responseClient(res, 200, 1, '该时间轴已存在');
			}
		})
		.catch((err) => {
			console.error({ err });
		});
};

//更新时间轴
exports.updateTimeAxis = (req, res) => {
	let { id, title, state, content, start_time, end_time } = req.body;
	TimeAxis.updateOne(
		{ _id: id },
		{ title, state: Number(state), content, start_time, end_time, update_time: new Date() }
	)
		.then((result) => {
			responseClient(res, 200, 0, '操作成功', result);
		})
		.catch((err) => {
			console.error({ err });
		});
};

//删除时间轴
exports.delTimeAxis = (req, res) => {
	let { id } = req.body;
	TimeAxis.deleteMany({ _id: id })
		.then((result) => {
			if (result.n === 1) {
				responseClient(res, 200, 0, '操作成功');
			} else {
				responseClient(res, 200, 1, '时间轴内容不存在');
			}
		})
		.catch((err) => {
			console.error({ err });
		});
};

//获取时间轴详情
exports.getTimeAxisDetail = (req, res) => {
	let { id } = req.body;
	TimeAxis.findOne({ _id: id })
		.then((data) => {
			responseClient(res, 200, 0, '操作成功', data);
		})
		.catch((err) => {
			console.error({ err });
		});
};
