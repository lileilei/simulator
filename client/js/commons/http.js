'use strict';

import axios from 'axios';
import qs from 'qs';
import gloading from './gloading';

const G_CFG = window.App.globals;
const X_AUTH_TOKEN = 'x-auth-token';
const REST_PATH = G_CFG.REST_PATH;
const TEST_PATH = G_CFG.TEST_PATH;
const CONTEXT_PATH = G_CFG.CONTEXT_PATH;

// 申请一个新的http实例
const instance = axios.create( {
  baseURL: CONTEXT_PATH,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
  },
  timeout: 60000, //设置超时时间为1分钟
  validateStatus( status ) {
    return status >= 200 && status < 300 || status === 304;
  }
} );

let queueNum = 0;

// 菊花停下来
const stopLoading = () => {
  if ( queueNum < 1 ) {
    queueNum = 0;
    gloading.stop();
  }
};

let nonce = Date.now();
const rts = /([?&])_=[^&]*/;
const rquery = ( /\?/ );

// 添加请求拦截器
instance.interceptors.request.use( ( options ) => {
  queueNum += 1;
  let url = options.url;
  //遮罩
  if ( options.mask !== false ) {
    // 这里写菊花转
    gloading.start();
    delete options.mask;
  }
  //简化类型设置
  const headers = options.headers = options.headers || {};
  if ( options.json ) {
    headers[ 'Content-Type' ] = 'application/json; charset=UTF-8';
    delete options.json;
  }
  //校验post数据格式
  const contentType = headers[ 'Content-Type' ];
  if ( typeof options.data === 'object' && contentType && contentType.indexOf( 'application/x-www-form-urlencoded' ) > -1 ) {
    options.data = qs.stringify( options.data );
  }
  //是否要设置token
  if ( options.token === false ) {
    headers[ X_AUTH_TOKEN ] = 'false';
    delete options.token;
  }
  //防止页面缓存
  if ( !options.cache ) {
    url = rts.test( url ) ? url.replace( rts, '$1_=' + nonce++ ) : url + ( rquery.test( url ) ? '&' : '?' ) + '_=' + nonce++;
    delete options.cache;
  }
  //调用测试API
  if ( options.testApi ) {
    if ( url.indexOf( TEST_PATH ) === -1 ) {
      url = TEST_PATH + url;
      delete options.testApi;
    }
  } else {
    //是否调用本地API
    if ( options.api !== false && url.indexOf( REST_PATH ) === -1 ) {
      url = REST_PATH + url;
      delete options.api;
    }
  }
  options.url = url;
  return options;
}, function ( error ) {
  queueNum -= 1;
  // 错误了要把菊花停下来
  stopLoading();
  return Promise.reject( error );
} );

// 响应拦截器
instance.interceptors.response.use( ( response ) => {
  queueNum -= 1;
  // 成功了要把菊花停下来
  stopLoading();
  return response;
}, function ( error ) {
  queueNum -= 1;
  // 错误了要把菊花停下来
  stopLoading();
  const data = error.response.data;
  // const status = error.response.status;
  console.error( error.config.url, JSON.stringify( data ) );
  return Promise.reject( error );
} );

export default instance;