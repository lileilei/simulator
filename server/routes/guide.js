'use strict';

// 个人中心

module.exports = (router, service) => {

	// 注册登陆
	router.get('guide/login.html', service.guide.login);
};