'use strict';

const jshint = require( './partials/jshint' );
const clean = require( './partials/clean' );
const server = require( './partials/server' );
const watcher = require( 'glob-watcher' );

//预编译css
clean( [ 'public/css/*' ] );
//打包js
clean( [ 'public/tpls/*' ] ).then( () => {
  //js代码检查
  jshint( [ 'client/js/**/*.js' ] );
  watcher( [ 'client/js/**/*.js' ] ).on( 'change', ( path ) => {
    jshint( path );
  } );
} );

const app = server();
// 监听文件的改变 重启服务
watcher( [ 'app.js', 'conf/**/*.js', 'server/**/*.js' ], app.restart );