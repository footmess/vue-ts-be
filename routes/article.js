const Article = require('../models/article');
const User = require('../models/user');
const { responseClient } = require('../utils/util.js');
const { formatter } = require('../utils/util.js');

exports.addArticle = (req, res) => {
	let { title, author, keyword, content, desc, img_url, tags, category, state, type, origin } = req.body;
	let tempArticle = null;
	if (img_url) {
		tempArticle = new Article({
			title,
			author,
			keyword:
				keyword ? keyword.split(',') :
				[],
			content,
			numbers: content.length,
			desc,
			img_url,
			tags:
				tags ? tags.split(',') :
				[],
			category:
				category ? category.split(',') :
				[],
			state,
			type,
			origin
		});
	} else {
		tempArticle = new Article({
			title,
			author,
			keyword:
				keyword ? keyword.split(',') :
				[],
			content,
			numbers: content.length,
			desc,
			tags:
				tags ? tags.split(',') :
				[],
			category:
				category ? category.split(',') :
				[],
			state,
			type,
			origin
		});
	}
	tempArticle
		.save()
		.then((data) => {
			responseClient(res, 200, 0, '保存成功', data);
		})
		.catch((err) => {
			console.error({ err });
		});
};

exports.updateArticle = (req, res) => {
	let { title, author, keyword, content, desc, img_url, tags, category, state, type, origin, id } = req.body;
	Article.update(
		{ _id: id },
		{
			title,
			author,
			keyword:
				keyword ? keyword.split(',') :
				[],
			content,
			numbers: content.length,
			desc,
			img_url,
			tags:
				tags ? tags.split(',') :
				[],
			category:
				category ? category.split(',') :
				[],
			state,
			type,
			origin
		}
	)
		.then((result) => {
			responseClient(res, 200, 0, '操作成功', result);
		})
		.catch((err) => {
			console.error({ err });
		});
};

exports.delArticle = (req, res) => {
	let { id } = req.body;
	Article.deleteMany({ _id: id })
		.then((result) => {
			if (result.n === 1) {
				responseClient(res, 200, 0, '删除成功');
			} else {
				responseClient(res, 200, 1, '文章不存在');
			}
		})
		.catch((err) => {
			console.error({ err });
		});
};

//获取前台文章列表
exports.getArticleList = (req, res) => {
	let keyword = req.query.keyword || null;
	let state = req.query.state || '';
	let likes = req.query.likes || '';
	let tag_id = req.query.tag_id || '';
	let category_id = req.query.category_id || '';
	let article = req.query.article || '';
	let pageNum = req.query.pageNum || 1;
	let pageSize = req.query.pageSize || 10;

	//如果是文章归档，返回全部文章
	if (article) {
		pageSize = 1000;
	}
	let conditions = {};
	if (!state) {
		if (keyword) {
			const reg = new RegExp(keyword, 'i');
			conditions = {
				$or: [ { title: { $regex: reg } }, { desc: { $regex: reg } } ]
			};
		}
	} else if (state) {
		state = parseInt(state);
		if (keyword) {
			const reg = new RegExp(keyword, 'i');
			conditions = {
				$and: [
					{ $or: [ { state: state } ] },
					{ $or: [ { title: { $regex: reg } }, { desc: { $regex: reg } }, { keyword: { $regex: reg } } ] }
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
	Article.countDocuments({}, (err, count) => {
		if (err) {
			console.error({ err });
		} else {
			responseData.count = count;
			// 待返回的字段;
			let fields = {
				title: 1,
				desc: 1,
				img_url: 1,
				tags: 1,
				category: 1,
				meta: 1,
				create_time: 1
			};
			if (article) {
				fields = { title: 1, create_time: 1 };
			}
			let options = {
				skip,
				limit: pageSize,
				sort: { create_time: -1 }
			};
			Article.find(conditions, fields, options, (error, result) => {
				if (error) {
					console.error({ error });
				} else {
					let newList = [];
					if (likes) {
						//根据热度likes返回数据
						result.sort((a, b) => {
							return b.meta.likes - a.meta.likes;
						});
						responseData.list = result;
					} else if (category_id) {
						//根据分类id返回数据
						result.forEach((item) => {
							if (item.category.indexOf(category_id) > -1) {
								newList.push(item);
							}
						});
						let len = newList.length;
						responseData.count = len;
						responseData.list = newList;
					}
				}
			})
				.then()
				.catch();
		}
	});
};
