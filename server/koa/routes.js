'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );
const h5 = require( 'koa-router' )();
const posts = require( 'koa-router' )();

const cfgUtil = require( '../utils/configuration' );

const serverCfg = cfgUtil.get( 'server' );
const ROUTER = serverCfg.router;

const services = require( './services' );

Object.keys( ROUTER ).forEach( ( key ) => {
  let obj = ROUTER[ key ];
  let dir = obj.dir;
  let exclude = obj.exclude || [];
  ( fs.readdirSync( dir ) || [] ).forEach( function ( file ) {
    let fileNameParser = path.parse( file );
    if ( fileNameParser.ext === '.js' && exclude.indexOf( fileNameParser.name ) === -1 ) {
      let fn = require( path.join( dir, file ) );
      if ( util.isFunction( fn ) ) {
        fn( posts, services.loadServices( key + '/services' ) );
      }
    }
  } );
} );

h5.use( '/', posts.routes(), posts.allowedMethods() );

module.exports = ( app ) => {
  app.use( h5.routes() );
};