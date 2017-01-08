'use strict';

const co = require( 'co' );
const clean = require( './clean' );
const packcss = require( './packcss' );

module.exports = co.wrap( function* () {

  return yield new Promise( ( resolve, reject ) => {
    //预编译css
    clean( [ 'public/css/*' ] ).then( () => {
      packcss( [
        'client/css/*.styl',
      ], 'public/css' );
    } );

    //打包js
    clean( [ 'public/tpls/*' ] ).then( () => {
      resolve();
    } );
  } );

} );