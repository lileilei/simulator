'use strict';

module.exports = ( router, service ) => {
  [
    'flight/order',
    'flight/list', //机票预订
  ].forEach( url => router.get(url, service.common.isLogin(), service.common.renderQuickly('index')));

};