'use strict';

const deepAssign = require( 'deep-assign' );
const request = require( 'request' );
const URLUtil = require( 'url' );
const createError = require( 'http-errors' );
const fs = require('fs');

const slice = Array.prototype.slice;
const logFactory = require( './logFactory' );
const log = logFactory.getLogger( "request" );
const errorLog = logFactory.getLogger( 'error' );
const configuration = require( './configuration' );
const config = configuration.get( 'server' );

//请求接口相关配置
const cfg = config.req;
const api = cfg.api;

const METHODS = [ 'get', 'head', 'post', 'put', 'patch', 'del' ];

//获取ip
function getIp( options ) {
  let _headers = options.req.headers;
  return _headers[ 'x-forwarded-for' ] ||
    _headers[ 'x-real-ip' ] ||
    _headers.remoteip ||
    ( options.req.connection || {} ).remoteAddress ||
    ( options.req.socket || {} ).remoteAddress ||
    ( options.req.connection.socket || {} ).remoteAddress;
}

//设置默认值
function setDefaultValues( options ) {
  //配置gzip压缩
  options.gzip = options.gzip || cfg.gzip;
  //默认get方法
  options.method = options.method || 'GET';
}

//设置header
function setHeaders( headers, options ) {
  if ( options.req ) {
    Object.assign( headers, {
      'x-forwarded-for': options.req.ips.join( ', ' ) || getIp( options ),
      'user-agent': options.req.headers[ 'user-agent' ]
    } );
    delete options.req;
  }
}

/*
 * @param url [string | object] 请求地址(必填)
 * @param options [object] 请求参数，第一个参数为对象时可以不传(选填)
 */
function httpRequest( url, options ) {
  //创建一个Promise对象
  return new Promise( function ( resolve, reject ) {
    //兼容object传参
    if ( typeof url === 'object' ) {
      options = url;
      url = options.url;
    }
    //非http开头的url，自动拼接配置的rest地址
    url = !url.indexOf( 'http' ) ? url : api + url;
    setDefaultValues( options );
    let headers = options.headers || {};
    setHeaders( headers, options );
    //设置token
    if ( options.session ) {
      const token = options.session.web ? options.session.web.xtoken : null;
      if ( token ) {
        headers[ 'x-auth-token' ] = token;
      } else {
        let httpError = createError( 500, '差旅登录超时，请重新认证', {
          code: 1003,
          url: url
        } );
        errorLog.warn( options, httpError );
        reject( httpError );
      }
      delete options.session;
    }
    //保持跟目标host一致
    headers.host = URLUtil.parse( url ).host;
    options.headers = headers;
    log.info( '请求转发开始：【' + url + '】', JSON.stringify( options ) );

    request( url, options, function ( error, response, body ) {
      var statusCode = response && response.statusCode || 500;
      if ( error ) {
        let httpError = createError( statusCode, error, {
          url: url
        } );
        errorLog.error( '网络请求异常：', options, httpError );
        reject( httpError );
        return;
      }
      if ( body ) {
        log.info( '请求转发成功：【' + url + '】', body );
        //如果返回的数据是json格式
        if ( !( response.headers[ 'content-type' ] || '' ).indexOf( 'application/json' ) ) {
          if ( typeof body === 'string' ) {
            try {
              body = JSON.parse( body )
            } catch ( e ) {
              let httpError = createError( 500, body, {
                url: url
              } );
              errorLog.error( '响应数据非json格式：', options, httpError );
              reject( httpError );
              return;
            }
          }
        } else {
          errorLog.warn( '响应数据非json格式：【' + url + '】', options, body );
        }
      }
      if ( statusCode === 200 ) {
        response.body = body;
        resolve( response );
      } else {
        let err;
        if ( typeof body === 'string' ) {
          err = {
            message: body
          };
        } else {
          body.message || ( body.message = '服务器打盹了' );
          err = body;
        }
        err.url = url;
        let httpError = createError( statusCode, err );
        errorLog.error( '请求返回异常：【' + url + '】', options, httpError );
        reject( httpError );
      }
    } );
  } );
};

function multiHttp( options, cb ) {
  let req = cb || httpRequest;
  options = options.map( function ( option ) {
    return req( option );
  } );
  return Promise.all( options );
};

const proxyLog = logFactory.getLogger( 'proxy' );
const coRequest = require( 'co-request' );

function proxy( req, options ) {
  let url = req.url;
  url = req.url = url.indexOf( 'http' ) === 0 ? url : api + url;
  const method = req.method;
  let _options = {
    method: method,
    headers: req.headers,
    gzip: cfg.gzip
  };
  // if (_options.headers.host) {
  //   delete _options.headers.host;
  // }
  //保持跟目标host一致
  // _options.headers.host = URLUtil.parse(url).host;
  _options.url = url;
  _options = deepAssign( _options, options );
  if ( _options.headers[ 'x-auth-token' ] !== 'false' && _options.session ) {
    var token = _options.session.web ? _options.session.web.xtoken : null;
    if ( token ) {
      _options.headers[ 'x-auth-token' ] = token;
    }
  } else {
    delete _options.headers[ 'x-auth-token' ];
  }
  delete _options.session;
  let contentType = _options.headers[ 'content-type' ] || '';
  switch ( method.toUpperCase() ) {
    case 'POST':
      if ( !contentType.indexOf( 'application/json' ) ) {
        _options.body = JSON.stringify( req.body );
      } else if ( !contentType.indexOf( 'multipart/form-data') ) {
        const formData = _options.formData = {};
        Object.keys(req.body).forEach((key)=> {
          formData[key] = req.body[key].map((file)=> {
            return {
              value: fs.createReadStream(file.path),
              options: {
                filename: file.name,
                contentType: file.type
              }
            };
          });
        });
      } else {
        _options.form = req.body || {};
      }
      break;
    case 'GET':
      //url.indexOf('?') === -1 && (_options.qs = req.query);
      break;
  }
  proxyLog.info( '请求转发开始：', _options );
  return coRequest( _options );
}

const ajax = {
  config: cfg,
  request: httpRequest,
  map: {
    /*
     * @param options [object] 请求参数(必填)
     */
    request: multiHttp
  },
  proxy: proxy
};

METHODS.forEach( function ( verb ) {
  var method = verb === 'del' ? 'DELETE' : verb.toUpperCase();
  ajax[ verb ] = function ( url, options ) {
    if ( typeof url === 'object' ) {
      options = url;
      url = options.url;
    }
    options = options || {};
    options.method || ( options.method = method );
    return httpRequest( url, options );
  };
  ajax.map[ verb ] = function ( options ) {
    if ( arguments.length > 1 ) {
      options = slice.call( arguments, 0 );
    }
    return multiHttp( options, ajax[ verb ] );
  };
} );

module.exports = ajax;