'use strict';

// 酒店
module.exports = ( router, service ) => {

  [
    'hotel/list',
    'hotel/detail', //酒店详情
  ].forEach( ( url ) => {
    router.get( url, service.common.isLogin(), service.common.renderQuickly( 'index' ) );
  } );

};