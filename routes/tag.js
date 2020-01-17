const Tag = require('../models/tag');
const { responseClient } = require('../utils/util.js');

exports.getTagList = (req, res) => {
	let keyword = req.query.keyword || null;
	let pageNum = req.query.pageNum || 1;
	let pageSize = req.query.pageSize || 10;
	let conditions = {};
	if (keyword) {
		let reg = new RegExp(keyword, 'i');
		conditions = {
			$or: [ { name: { $regex: reg } }, { desc: { $regex: reg } } ]
		};
	}
	let skip =

			pageNum - 1 < 0 ? 0 :
			(pageNum - 1) * pageSize;
	let responseData = {
		count: 0,
		list: []
	};
	Tag.countDocuments(conditions, (err, count) => {
		if (err) {
			console.error({ err });
		} else {
			responseData.count = count;
			//待返回字段
			let fields = {
				_id: 1,
				name: 1,
				create_time: 1
			};
			let options = {
				skip,
				limit: pageSize,
				sort: { create_time: -1 }
			};
			Tag.find(conditions, fields, options, (error, result) => {
				if (error) {
					console.error({ error });
				} else {
					(responseData.list = result), responseClient(res, 200, 0, 'success', responseData);
				}
			});
		}
	});
};

exports.addTag = (req, res) => {
	let { name, desc } = req.body;
	Tag.findOne({ name })
		.then((result) => {
			if (!result) {
				let tag = new Tag({
					name,
					desc
				});
				tag
					.save()
					.then((data) => {
						responseClient(res, 200, 0, '添加成功', data);
					})
					.catch((err) => {
						console.error({ error });
					});
			} else {
				responseClient(res, 200, 1, '该标签已存在');
			}
		})
		.catch((err) => {
			console.error({ err });
		});
};

exports.delTag = (req, res) => {
	let { id } = req.body;
	Tag.deleteMany({ _id: id })
		.then((result) => {
			if (result.n === 1) {
				responseClient(res, 200, 0, '删除成功');
			} else {
				responseClient(res, 200, 1, '标签不存在');
			}
		})
		.catch((err) => {
			console.error({ err });
		});
};
