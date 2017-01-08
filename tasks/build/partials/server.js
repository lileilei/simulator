'use strict';

//服务启动 修改代码自动重启
const server = require( 'gulp-develop-server' );
const cfgUtil = require( '../../../server/utils/configuration' );
const serverCfg = cfgUtil.get( 'server' );
const gutil = require( 'gulp-util' );
let initialized = false;

module.exports = function () {
  gutil.log( 'Starting "server" task' );
  if ( !initialized ) {
    server.listen( {
      path: './app.js',
      env: {
        PORT: serverCfg.PORT,
        NODE_ENV: 'development',
        DEBUG: serverCfg.NAME
      }
    } );
    initialized = true;
  }
  gutil.log( 'Finished "server" task' );
  return server;
};