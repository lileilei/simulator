'use strict';

// 同事管理
module.exports = ( router, service ) => {

  [
    'employees',
    'employees/main',
    'employees/main/department-set',
    'employees/main/verify',
    'employees/main/verify/edit',
    'employees/other/authority',
    'employees/other/invite',
    'employees/other/standard',
    'employees/other/standard/set',
  ].forEach( ( url ) => {
    router.get( url, service.common.isLogin(), service.common.renderQuickly( 'index' ) );
  } );

  [
    'employees/invite',
    'employees/invite/form/main',
    'employees/invite/form/success',
  ].forEach( ( url ) => {
    router.get( url, service.common.isLogin(), service.common.renderQuickly( 'sindex' ) );
  } );

};