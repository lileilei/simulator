'use strict';

const cfgUtil = require( './server/utils/configuration' );
const logFactory = require( './server/utils/logFactory' );

const serverCfg = cfgUtil.get( 'server' );
const appLog = logFactory.getLogger( 'app' );

const app = require( './server/koa' );

const http = require( 'http' );
const port = +process.env.PORT || serverCfg.PORT;
const server = http.createServer( app.callback() );

server.on( 'error', ( error ) => {
  appLog.error( '服务器异常：', error );
  const ds = require( './tasks/build/partials/server' )();
  if ( error.syscall !== 'listen' ) {
    if ( app.env === 'development' ) {
      if ( ds.child ) {
        ds.restart();
      }
    } else {
      throw error;
    }
  }
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch ( error.code ) {
    case 'EACCES':
      appLog.error( bind + ' requires elevated privileges' );
      process.exit( 1 );
      break;
    case 'EADDRINUSE':
      appLog.error( bind + ' is already in use' );
      process.exit( 1 );
      break;
    default:
      if ( app.env === 'development' ) {
        if ( ds.child ) {
          ds.restart();
        }
      } else {
        throw error;
      }
  }
} );
server.on( 'listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  appLog.info( 'Listening on ' + bind );
  console.log( 'Listening on ' + bind );
} );

server.listen( port );