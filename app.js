//引入模块
const createError = require('http-errors');
const express = require('express');
// const ejs = require('ejs');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');

// import 等语法要用到 babel 支持
require('babel-register');

const app = express();
//set方法用于指定变量的值。
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//use是express注册中间件的方法，它返回一个函数
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// 设定静态文件目录
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser('blog_node_cookie'));
app.use(
	session({
		secret: 'blog_node_cookie',
		//在浏览器中生成cookie的名称key
		name: 'session_id',
		resave: true,
		saveUninitialized: true,
		//cookie过期时间,
		// httpOnly 指浏览器不要在除HTTP（和 HTTPS)请求之外暴露Cookie
		// 可以避免通过js调用，预防XSS(跨站脚本)攻击
		cookie: { maxAge: 60 * 1000 * 30, httpOnly: true }
	})
);

//引入数据库
const mongodb = require('./core/mongodb');
// console.log(mongodb);
//连接数据库
mongodb.connect();

app.get('/', function(req, res) {
	res.render('index');
});
app.get('/login123', function(req, res) {
	res.send('index123');
});

const { responseClient } = require('./utils/util');
// const User = require('./models/user');
const Comment = require('./models/comment');

app.get('/getMessageList', (req, res) => {
	if (!req.session.userInfo) {
		responseClient(res, 200, 1, '您还没登录,或者登录信息已过期，请重新登录！');
		return;
	}
	let keyword = req.query.keyword || null;
	let is_handle = parseInt(req.query.is_handle) || 0;
	let pageNum = parseInt(req.query.pageNum) || 1;
	let pageSize = parseInt(req.query.pageSize) || 10;
	let conditions = {};
	if (keyword) {
		const reg = new RegExp(keyword, 'i');
		if (is_handle) {
			conditions = {
				content: { $regex: reg },
				is_handle
			};
		} else {
			conditions = { content: { $regex: reg } };
		}
	}
	if (is_handle) {
		conditions = {
			is_handle
		};
		console.log({ conditions });
	}

	let skip =

			pageNum - 1 < 0 ? 0 :
			(pageNum - 1) * pageSize;
	let responseData = {
		count: 0,
		list: []
	};

	Comment.countDocuments({}, (err, count) => {
		if (err) {
			console.error({ err });
		} else {
			responseData.count = count;
			//待返回的字段
			let fields = {
				article_id: 1,
				content: 1,
				is_top: 1,
				likes: 1,
				user_id: 1,
				user: 1,
				other_comments: 1,
				state: 1,
				is_handle: 1,
				create_time: 1
			};
			let options = {
				skip,
				limit: pageSize,
				sort: { create_time: -1 }
			};
			Comment.find(conditions, fields, options, (error, result) => {
				if (error) {
					console.error({ error });
				} else {
					responseData.list = result;
					responseClient(res, 200, 0, 'success', responseData);
				}
			});
		}
	});
});

//引入路由文件
const route = require('./routes/index');
//初始化路由
// route(app);

//catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

//error handler
app.use(function(err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error =

			req.app.get('env') === 'development' ? err :
			{};

	res.status(err.status || 500);
	res.render('error');
});

app.listen(3000);

// module.exports = app;
