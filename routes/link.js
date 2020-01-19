const Link = require('../models/link');
const { responseClient } = require('../utils/util.js');

//获取全部链接
exports.getLinkList = (req, res) => {
	let keyword = req.query.keyword || '';
	// 1 :其他友情链接 2: 是博主的个人链接 ,‘’ 代表所有链接
	let type = Number(req.query.type);
	let pageNum = Number.parseInt(req.query.pageNum) || 1;
	let pageSize = Number.parseInt(req.query.pageSize) || 10;
	let conditions = {};
	if (type) {
		if (keyword) {
			const reg = new RegExp(keyword, 'i');
			conditions = {
				$and: [ { $or: [ { type: type } ] }, { $or: [ { name: { $regex: reg } }, { desc: { $regex: reg } } ] } ]
			};
		} else {
			conditions = { type };
		}
	} else {
		if (keyword) {
			const reg = new RegExp(keyword, 'i');
			conditions = { $or: [ { name: { $regex: reg } }, { desc: { $regex: reg } } ] };
		}
	}
	let skip =

			pageNum - 1 < 0 ? 0 :
			(pageNum - 1) * pageSize;
	let responseData = {
		count: 0,
		list: []
	};
	Link.countDocuments({}, (err, count) => {
		if (err) {
			console.error({ err });
		} else {
			responseData.count = count;
			//待返回字段
			let fields = {
				_id: 1,
				name: 1,
				url: 1,
				icon: 1
			};
			let options = {
				skip,
				limit: pageSize,
				sort: { create_time: -1 }
			};
			Link.find(conditions, fields, options, (error, result) => {
				if (error) {
					console.error({ error });
				} else {
					responseData.list = result;
					responseClient(res, 200, 0, 'success', responseData);
				}
			});
		}
	});
};

//添加链接
exports.addLink = (req, res) => {
	let { name, desc, icon, url, type } = req.body;
	Link.findOne({ name })
		.then((result) => {
			if (!result) {
				let link = new Link({
					name,
					desc,
					icon,
					url,
					type
				});
				link
					.save()
					.then((data) => {
						responseClient(res, 200, 0, '添加成功', data);
					})
					.catch((err) => {
						console.error({ err });
					});
			} else {
				responseClient(res, 200, 1, '该链接已存在');
			}
		})
		.catch((err1) => {
			console.error({ err1 });
		});
};

//更新链接
exports.updateLink = (req, res) => {
	let { state, id } = req.body;
	Link.update({ _id: id }, { state })
		.then((result) => {
			responseClient(res, 200, 0, '操作成功', result);
		})
		.catch((err) => {
			console.error({ err });
		});
};

//删除链接
exports.delLink = (req, res) => {
	let { id } = req.body;
	Link.deleteMany({ _id: id })
		.then((result) => {
			if (result.n === 1) {
				responseClient(res, 200, 0, '删除成功');
			} else {
				responseClient(res, 200, 1, '链接不存在');
			}
		})
		.catch((err) => {
			console.error({ err });
		});
};
