'use strict';

const webpack = require( 'webpack' );
const webpackDevMiddleware = require( 'webpack-dev-middleware' );
const webpackHotMiddleware = require( 'webpack-hot-middleware' );
const browserSync = require( 'koa-browser-sync' );

const cfgUtil = require( '../utils/configuration' );
const fileUtils = require( '../utils/file' );

const SERVERCFG = cfgUtil.get( 'server' );
const JS_DIR = '/js/controllers/';
const hotClient = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000';

module.exports = ( app ) => {
  const config = require( '../../conf/webpack-config' );

  //热部署监听
  //获取匹配后的文件
  const matches = fileUtils.matchesByPatterns( [ SERVERCFG.CLIENT_DIR + '/js/controllers/**/*.js' ] );
  const entry = {};
  matches.forEach( ( n, i ) => {
    let begin = n.indexOf( JS_DIR ) + JS_DIR.length;
    let end = n.indexOf( '.js' );
    let relativeK = n.slice( begin, end );
    entry[ relativeK ] = [ hotClient ].concat( n );
  } );
  //为每个文件添加热部署
  config.entry = entry;
  const compiler = webpack( config );

  // 动态编译
  app.use( ( () => {

    function middleware( doIt, req, res ) {
      var originalEnd = res.end;

      return function ( done ) {
        res.end = function () {
          originalEnd.apply( this, arguments );
          done( null, 0 );
        };
        doIt( req, res, function () {
          done( null, 1 );
        } )
      }
    }

    var doIt = webpackDevMiddleware( compiler, {
      // 只显示warnings 和 errors
      noInfo: false,

      // 不显示调试信息到控制台
      quiet: false,

      // 如果为true, 就不监听监听js的变化
      lazy: false,

      // lazy为false才生效
      watchOptions: {
        aggregateTimeout: 300,
        poll: true
      },

      // 输出的路径和配置一样
      publicPath: config.output.publicPath,

      // 客户端请求头
      headers: { 'X-Custom-Header': 'yes' },

      // 设置输出调试信息的格式
      stats: {
        colors: true,
        chunks: false
      },
      inline: true
    } );

    return function* ( next ) {
      var ctx = this;
      ctx.webpack = doIt;
      var req = this.req;
      var runNext = yield middleware( doIt, req, {
        end: function ( content ) {
          ctx.body = content;
        },
        setHeader: function () {
          ctx.set.apply( ctx, arguments );
        }
      } );
      if ( runNext ) {
        yield* next;
      }
    };

  } )() );

  // js热替换，但是vue文件还触发不了
  app.use( ( () => {
    function middleware( doIt, req, res ) {
      let originalEnd = res.end;
      return function ( done ) {
        res.end = function () {
          originalEnd.apply( this, arguments );
          done( null, 0 );
        };
        doIt( req, res, function () {
          done( null, 1 );
        } );
      };
    }
    let action = webpackHotMiddleware( compiler, {
      // log: console.log,
      // path: '/__webpack_hmr',
      // heartbeat: 10 * 1000
    } );

    // compiler.plugin( 'compilation', ( compilation ) => {
    //   compilation.plugin( 'html-webpack-plugin-after-emit', ( data, cb ) => {
    //     action.publish( { action: 'reload' } );
    //     cb();
    //   } );
    // } );
    return function* ( next ) {
      let nextStep = yield middleware( action, this.req, this.res );
      if ( nextStep && next ) {
        yield* next;
      }
    };
  } )() );

  //这是比较水的方案，先这样吧
  app.use( browserSync( {
    init: true,
    files: [ 'client/tpls/**/*', 'client/css/**/*.styl', 'client/views/**/*.pug', 'client/components/**/*' ],
    logConnections: true
  } ) );

};