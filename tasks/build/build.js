'use strict';

const fs = require( 'fs' );
const cluster = require( 'cluster' );
const gutil = require( 'gulp-util' );
const fileUtils = require( '../../server/utils/file' );
const cfgUtil = require( '../../server/utils/configuration' );
const packjs = require( './partials/packjs' );
const commonlyBuild = require( './partials/commonly-build' );
const SERVERCFG = cfgUtil.get( 'server' );
const filePatterns = [ SERVERCFG.CLIENT_DIR + '/js/controllers/**/*.js' ];

const NODE_ENV = process.env.NODE_ENV;

commonlyBuild().then( () => {
    packjs[ NODE_ENV.toLowerCase() ]( filePatterns, 'public/js' ).then( () => {
  }, ( err ) => {
    gutil.log( 'It has just thrown a Error', err );
  } );
} );