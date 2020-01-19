const Project = require('../models/project');
const { responseClient } = require('../utils/util.js');

//获取全部项目内容
exports.getProjectList = (req, res) => {
	let keyword = req.query.keyword || null;
	// 状态 1 是已经完成 ，2 是正在进行，3 是没完成
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
	Project.countDocuments({}, (err, count) => {
		if (err) {
			console.error({ err });
		} else {
			responseData.count = count;
			let fields = {
				title: 1,
				content: 1,
				img: 1,
				url: 1,
				start_time: 1,
				end_time: 1
			};
			let options = {
				skip,
				limit: pageSize,
				sort: { end_time: -1 }
			};
			Project.find(conditions, fields, options, (error, result) => {
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

//添加项目
exports.addProject = (req, res) => {
	let { title, state, content, img, url, start_time, end_time } = req.body;
	Project.findOne({ title })
		.then((result) => {
			if (!result) {
				let project = new Project({
					title,
					state,
					content,
					img,
					url,
					start_time,
					end_time
				});
				project
					.save()
					.then((data) => {
						responseClient(res, 200, 0, '操作成功', data);
					})
					.catch((err) => {
						console.error({ err });
					});
			} else {
				responseClient(res, 200, 0, 1, '该项目内容已存在');
			}
		})
		.catch((err2) => {
			console.error({ err2 });
		});
};

//更新项目
exports.updatePriject = (req, res) => {
	let { title, state, content, img, url, start_time, end_time } = req.body;
	Project.updateOne(
		{ _id: id },
		{ title, state: Number(state), content, img, url, start_time, end_time, update_time: new Date() }
	)
		.then((result) => {
			responseClient(res, 200, 0, '操作成功', result);
		})
		.catch((err) => {
			console.error({ err });
		});
};

//删除项目
exports.delProject = (req, res) => {
	let { id } = req.body;
	Project.deleteMany({ _id: id })
		.then((result) => {
			if (result.n === 1) {
				responseClient(res, 200, 0, '操作成功');
			} else {
				responseClient(res, 200, 1, '项目内容不存在');
			}
		})
		.catch((err) => {
			console.error({ err });
		});
};

//项目详情
exports.getProjectDetail = (req, res) => {
	let { id } = req.body;
	Project.findOne({ _id: id })
		.then((data) => {
			responseClient(res, 200, 0, '操作成功', data);
		})
		.catch((err) => {
			console.error({ err });
		});
};
