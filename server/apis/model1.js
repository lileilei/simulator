'use strict';

module.exports = ( router, service ) => {

  router.get( 'api/biz1.do', service.biz1.getList );

  router.get( 'api/demo1.do', service.biz1.getList );

  router.get( 'api/demo2.do', service.biz1.getList2 );

  router.get( 'api/demo3.do', service.biz1.getList3 );

};