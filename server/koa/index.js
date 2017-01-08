'use strict';

const app = require( 'koa' )();
const path = require( 'path' );
const createError = require( 'http-errors' );
const _ = require( 'lodash' );

const cfgUtil = require( '../utils/configuration' );
const logUtil = require( '../utils/logFactory' );
const serverCfg = cfgUtil.get( 'server' );
const localsCfg = cfgUtil.get( 'locals' );
const appLog = logUtil.getLogger( 'app' );
const errorLog = logUtil.getLogger( 'error' );

const NODE_ENV = serverCfg.NODE_ENV;

//网页静态图标
const favicon = require( 'koa-favicon' );
app.use( favicon( path.join( serverCfg.STATIC_DIR, 'favicon.ico' ) ) );
appLog.info( 'favicon中间件加载完成' );

if ( NODE_ENV === 'development' ) {
  //配置stylus
  const middleware = require( 'koa-stylus' );
  const stylus = require( 'stylus' );
  const nib = require( 'nib' );
  app.use( middleware( {
    src: serverCfg.CLIENT_DIR,
    dest: serverCfg.STATIC_DIR,
    compile: ( str, path ) => {
      return stylus( str )
        .set( 'filename', path )
        .define( 'inline-url', stylus.url( {
          paths: [ serverCfg.STATIC_DIR ]
        } ) )
        .define( '$STATIC_PATH', localsCfg.STATIC_PATH )
        .use( nib() );
    }
  } ) );
  appLog.info( 'stylus中间件加载完成' );
  require( './webpack-dev' )( app );
}

//静态目录配置
const serve = require( 'koa-static' );
app.use( serve( serverCfg.STATIC_DIR ) );
appLog.info( 'static中间件加载完成' );

//对提交的数据格式进行解析
const body = require( 'koa-better-body' );
// 为了解析文件流
app.use( body( {
  querystring: require( 'qs' ),
  fields: 'body'
} ) );
appLog.info( 'koa-better-body中间件加载完成' );

//输出json数据格式
const json = require( 'koa-json' );
app.use( json() );
appLog.info( 'json中间件加载完成' );

// csrf 防止跨站攻击
// const csrf = require('koa-csrf');
// app.use(csrf({
//   invalidSessionSecretMessage: 'Invalid session secret',
//   invalidSessionSecretStatusCode: 403,
//   invalidTokenMessage: 'Invalid CSRF token',
//   invalidTokenStatusCode: 403
// }));
// appLog.info( 'CSRF中间件加载完成' );

// session中间件
app.keys = [ serverCfg.session.prefix, serverCfg.session.key ];
const session = require( 'koa-generic-session' );
// const redisStore = require( 'koa-redis' )( {
//   port: serverCfg.redis.port,
//   host: serverCfg.redis.host
// } );
// app.redis = redisStore.client;
// appLog.info( 'redis配置完成' );
// app.use( session( Object.assign( {
//   store: redisStore
// }, serverCfg.session ) ) );
app.use( session() );

//单点登录
appLog.info( 'session中间件加载完成' );

//设置全局模板渲染数据
const locals = Object.assign( {}, localsCfg, {
  NODE_ENV: NODE_ENV,
  VERSION: localsCfg.VERSION.slice( 0, 2 ) + Date.now(),
} );

//pug模板配置
const views = require( 'koa-views' );
app.use( views( serverCfg.VIEWS_DIR, {
  root: serverCfg.VIEWS_DIR,
  default: 'pug',
  extension: 'pug',
  options: {
    pretty: false,
    debug: false,
    compileDebug: false,
    cache: NODE_ENV !== 'development',
    basedir: serverCfg.VIEWS_DIR
  }
} ) );
appLog.info( 'pug模板配置完成' );

app.use( function* ( next ) {
  Object.assign( this.state, locals );
  //页面不缓存
  this.set( 'Cache-Control', 'no-cache' );
  try {
    yield next;
  } catch ( err ) {
    errorLog.error( '服务器报错了 -> ' + this.url, err );
    const status = err.status || 500;
    const code = err.code || 500;
    this.status = status;
    if ( this.headers[ 'x-requested-with' ] === 'XMLHttpRequest' ) {
      this.body = Object.assign( {
        message: err.message,
        url: this.url
      }, err );
    } else {
      yield this.render( 'error', {
        status: status,
        code: code,
        url: this.url,
        message: err.message,
        error: err
      } );
    }
  }
  if ( this.status === 404 ) {
    const err = createError( '找不到页面 -> ' + this.url, 404 );
    errorLog.error( err );
    yield this.render( 'error', {
      status: 404,
      code: 404,
      url: this.url,
      message: err.message,
      backurl: this.state.CONTEXT_PATH + '/',
      error: err
    } );
  }
} );

//配置路由
require( './routes' )( app );
appLog.info( '路由加载完成' );

app.name = serverCfg.NAME;
app.env = serverCfg.NODE_ENV;

module.exports = app;