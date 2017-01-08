'use strict';

const http = require('../../utils/http');

exports.login = function* () {
	const resp = yield http.post({
		url: '/btravel/travelRegister/generateQRCode4Login',
		form: {
			h5SessionId: this.sessionId
		}
	});
	yield this.render('/guide/login', {
		info: resp.body,
		h5Session: this.sessionId
	});

};