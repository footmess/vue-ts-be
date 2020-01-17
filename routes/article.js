const Article = require('../models/article');
const User = require('../models/user');
const { responseClient } = require('../utils/util.js');
// const { formatter } = require('../utils/util.js');

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
					} else if (tag_id) {
						//根据标签id返回数据
						result.forEach((item) => {
							if (item.tags.indexOf(tag_id) > -1) {
								newList.push(item);
							}
						});
						let len = newList.length;
						responseData.count = len;
						responseData.list = newList;
					} else if (article) {
						//按年份归档, 文章数组
						let archiveList = [];
						let obj = {};
						result.forEach((item) => {
							let year = item.create_time.getFullYear();
							if (!obj[year]) {
								obj[year] = [];
								obj[year].push(item);
							} else {
								obj[year].push(item);
							}
						});
						for (let key in obj) {
							//实例中的属性
							if (obj.hasOwnProperty(key)) {
								let value = obj[key];
								let articleObj = {};
								articleObj.year = key;
								articleObj.list = value;
								archiveList.push(articleObj);
							}
						}
						//按年份排序 降序
						archiveList.sort((a, b) => {
							return b.year - a.year;
						});
						responseData.list = archiveList;
					} else {
						responseData.list = result;
					}
					responseClient(res, 200, 0, '操作成功', responseData);
				}
			});
		}
	});
};

//后台文章列表
exports.getArticleListAdmin = (req, res) => {
	let keyword = req.query.keyword || null;
	let state = req.query.state || '';
	let likes = req.query.likes || '';
	let tag_id = req.query.tag_id || '';
	let pageNum = req.query.pageNum || 1;
	let pageSize = req.query.pageSize || 10;
	let conditions = {};
	if (!state) {
		if (keyword) {
			const reg = new RegExp(keyword, 'i');
			conditions = {
				$or: [ { title: { $regex: reg } }, { desc: { $regex: reg } } ]
			};
		}
	} else if (state) {
		state = Number.parseInt(state);
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
			//定义变量
			let fields = {
				title: 1,
				author: 1,
				keyword: 1,
				desc: 1,
				img_url: 1,
				tags: 1,
				category: 1,
				state: 1,
				type: 1,
				origin: 1,
				comments: 1,
				like_User_id: 1,
				meta: 1,
				create_time: 1
			};
			let options = {
				skip,
				limit: pageSize,
				sort: { create_time: -1 }
			};
			Article.find(conditions, fields, options, (error, result) => {
				if (error) {
					console.error({ error });
				} else {
					if (likes) {
						//降序排序
						result.sort((a, b) => {
							return b.meta.likes - a.meta.likes;
						});
					}
					responseData.list = result;
					responseClient(res, 200, 0, '操作成功', responseData);
				}
			})
				.populate([ { path: 'tags' }, { path: 'comments' }, { path: 'category' } ])
				.exec((err, doc) => {
					console.log({ doc });
				});
		}
	});
};

//文章点赞
exports.likeArticle = (req, res) => {
	if (!req.session.userInfo) {
		responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
		return;
	}
	//结构赋值
	let { id, user_id } = req.body;
	Article.findOne({ _id: id })
		.then((data) => {
			let fields = {};
			data.meta.likes = data.meta.likes + 1;
			fields.meat = data.meta;
			let like_user_arr =

					data.like_users.length > 0 ? data.like_users :
					[];
			User.findOne({ _id: user_id })
				.then((user) => {
					let new_like_user = {};
					new_like_user.id = user._id;
					new_like_user.name = user.name;
					new_like_user.avatar = user.avatar;
					new_like_user.create_time = user.create_time;
					new_like_user.type = user.type;
					new_like_user.introduce = user.introduce;
					like_user_arr.push(new_like_user);
					fields.like_users = like_user_arr;
					Article.update({ _id: id }, fields)
						.then((result) => {
							responseClient(res, 200, 0, '操作成功', result);
						})
						.catch((err) => {
							console.error({ err });
						});
				})
				.catch((err) => {
					console.error({ err });
				});
		})
		.catch((err) => {
			console.error({ err });
		});
};

//文章详情
exports.getArticleDetailByType = (req, res) => {
	let { type } = req.body;
	if (!type) {
		responseClient(res, 200, 1, '文章不存在');
		return;
	}
	Article.findOne({ type: type }, (error, data) => {
		if (error) {
			console.error({ error });
		} else {
			data.meta.views += 1;
			Article.update({ type: type }, { meta: data.meta })
				.then((result) => {
					responseClient(res, 200, 0, '操作成功', data);
				})
				.catch((err) => {
					console.error({ err });
				});
		}
	})
		.populate([
			{ path: 'tags', select: '-_id' },
			{ path: 'comments', select: '-_id' },
			{ path: 'category', select: '-_id' }
		])
		.exec((err, doc) => {
			console.log({ doc });
		});
};

exports.getArticleDetail = (req, res) => {
	let { id } = req.body;
	//文章类型 => 1: 普通文章，2: 简历，3: 管理员介绍
	let type = Number(req.body.type) || 1;
	//文章的评论过滤 => 1: 过滤，2: 不过滤
	let filter = Number(req.body.filter) || 1;
	if (type === 1) {
		if (!id) {
			responseClient(res, 200, 1, '文章不存在');
			return;
		}
		Article.findOne({ _id: id }, (error, data) => {
			if (error) {
				console.error({ error });
			} else {
				data.meta.views += 1;
				Article.update({ _id: id }, { meta: data.meta })
					.then((result) => {
						if (filter === 1) {
							let arr = data.comments;
							for (let i = arr.length - 1; i >= 0; i--) {
								let comment = arr[i];
								if (comment.state !== 1) {
									arr.splice(i, 1);
								}
								let newArr = comment.other_comments;
								let len = newArr.length;
								if (len) {
									for (let j = len - 1; j >= 0; j--) {
										let item = newArr[j];
										if (item.state !== 1) {
											newArr.splice(j, 1);
										}
									}
								}
							}
						}
						responseClient(res, 200, 1, '操作成功', data);
					})
					.catch((err) => {
						console.error({ err });
					});
			}
		})
			.populate([ { path: 'tags' }, { path: 'comments' }, { path: 'category' } ])
			.exec((err, doc) => {
				console.log({ doc });
			});
	} else {
		Article.findOne({ type: type }, (error, data) => {
			if (error) {
				console.error({ error });
			} else {
				if (data) {
					data.meta.views += 1;
					Article.update({ type: type }, { meta: data.meta })
						.then((result) => {
							if (filter === 1) {
								let arr = data.comments;
								for (let i = arr.length - 1; i >= 0; i--) {
									let comment = arr[i];
									if (comment.state !== 1) {
										arr.splice(i, 1);
									}
									let newArr = comment.other_comments;
									let len = newArr.length;
									if (len) {
										for (let j = len - 1; j >= 0; j--) {
											let item = newArr[j];
											if (item.state !== 1) {
												newArr.splice(j, 1);
											}
										}
									}
								}
							}
							responseClient(res, 200, 0, '操作成功', data);
						})
						.catch((err) => {
							console.error({ err });
						});
				} else {
					responseClient(res, 200, 0, '文章不存在');
				}
			}
		})
			.populate([
				{ path: 'tags', select: '-_id' },
				{ path: 'comments', select: '-_id' },
				{ path: 'category', select: '-_id' }
			])
			.exec((err, doc) => {
				console.log({ doc });
			});
	}
};
