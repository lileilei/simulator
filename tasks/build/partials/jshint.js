'use strict';

const vinylFs = require( 'vinyl-fs' );
const jshint = require( 'gulp-jshint' );
const stylish = require( 'jshint-stylish' );
const gutil = require( 'gulp-util' );
const co = require( 'co' );

module.exports = co.wrap( function* ( src, options ) {
  options = options || {};
  return yield new Promise( ( resolve, reject ) => {
    gutil.log( 'Starting "jshint" task', src );
    vinylFs.src( src )
      .pipe( jshint( options.file || '.jshintrc' ) )
      .on( 'error', function ( err ) {
        gutil.log( 'Running "jshint" task but throw a Error', err );
        reject( err );
      } ).on( 'end', function () {
        gutil.log( 'Finished "jshint" task' );
        setTimeout( function () {
          resolve();
        }, 100 );
      } )
      .pipe( jshint.reporter( stylish ) );
  } );
} );