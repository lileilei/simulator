'use strict';

module.exports = (router, service) => {
	[
		'member/experience',
		'member/submited'
	].forEach((url) => {
		router.get(url, service.common.isLogin(), service.common.renderQuickly('sindex'));
	});
};