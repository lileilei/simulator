'use strict';

module.exports = ( router, service ) => {

  [
    '/'
  ].forEach( ( url ) => {
    router.get( url, service.common.renderQuickly( 'index' ) );
  } );

};