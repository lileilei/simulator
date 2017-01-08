'use strict';

const vinylFs = require( 'vinyl-fs' );
const stylus = require( 'gulp-stylus' );
const nib = require( 'nib' );
const co = require( 'co' );

const cfgUtil = require( '../../../server/utils/configuration' );
const serverCfg = cfgUtil.get( 'server' );
const gutil = require( 'gulp-util' );

module.exports = co.wrap( function* ( src, dest ) {
  return yield new Promise( ( resolve, reject ) => {
    gutil.log( 'Starting "packcss" task', src );
    vinylFs.src( src ).pipe( stylus( {
      compress: true,
      use: [
        nib()
      ],
      globals: {
        '$STATIC_PATH': ''
      },
      functions: {
        'inline-url': stylus.stylus.url( {
          paths: [ serverCfg.STATIC_DIR ]
        } )
      }
    } ) ).on( 'error', ( err ) => {
      gutil.log( 'Running "packcss" task but throw a Error', err );
      reject( err );
    } ).on( 'end', () => {
      gutil.log( 'Finished "packcss" task' );
      setTimeout( function () {
        resolve();
      }, 100 );
    } ).pipe( vinylFs.dest( dest ) );
  } );
} );