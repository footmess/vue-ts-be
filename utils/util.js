import crypto from 'crypto';

module.exports = {
	MD5_SUFFIX: 'liaoyujia12',
	md5: function(pwd) {
		let md5 = crypto.createHash('md5');
		return md5.update(pwd).digest('hex');
	},

	//响应客户端请求
	responseClient(res, httpCode = 500, code = 3, message = '服务端异常', data = {}) {
		let responseData = {};
		responseData.code = code;
		responseData.message = message;
		responseData.data = data;
		res.status(httpCode).json(responseData);
	},

	//格式化时间 2020-01-12 08:12:00
	formatter(timestamp) {
		const data = new Date(timestamp);
		const Y = data.getFullYear() + '-';
		const M =

				data.getMonth() + 1 < 10 ? '0' + (data.getMonth() + 1) :
				data.getMonth() + 1 + '-';
		const D =

				data.getDate() < 10 ? '0' + data.getDate() + ' ' :
				data.getDate() + ' ';
		const h =

				data.getHours() < 10 ? '0' + data.getHours() + ':' :
				data.getHours() + ':';
		const m =

				data.getMinutes() < 10 ? '0' + data.getMinutes() + ':' :
				data.getHours() + ':';
		const s =

				data.getSeconds() < 10 ? '0' + data.getHours() :
				data.getHours();
	}
};
