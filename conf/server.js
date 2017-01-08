'use strict';

const path = require( 'path' );
const PACKAGE = require( '../package' );

module.exports = {
  //公用全局属性
  public: {
    PORT: 3000,

    NAME: PACKAGE.name,

    //环境标识
    NODE_ENV: process.env.NODE_ENV || 'development',

    //工程根目录
    PROJECT_DIR: path.join( __dirname, '../' ),

    //网页模板路径
    VIEWS_DIR: path.join( __dirname, '../client/views' ),

    //配置文件目录
    CONF_DIR: path.join( __dirname, '../conf' ),

    //client存放目录
    CLIENT_DIR: path.join( __dirname, '../client' ),

    //日志文件
    LOGS_DIR: path.join( __dirname, '../logs' ),

    //静态文件目录
    STATIC_DIR: path.join( __dirname, '../public' ),

    //session配置, 一天后失效
    session: {
      prefix: 'ziztour.istay:sess:',
      key: '__zzistayse',
      ttl: 24 * 60 * 60 * 1000
    },

    //路由配置
    router: {
      routes: {
        exclude: [],
        dir: path.join( __dirname, '../server/routes' )
      },
      apis: {
        dir: path.join( __dirname, '../server/apis' )
      }
    },

    //后台http请求配置
    req: {
      gzip: true //默认走nginx，需要解压缩
    }
  },
  //仅开发使用
  development: {
    req: {
      // api: 'http://192.168.1.240/api2',
      api: 'http://demo.service.ziztour.net/api', //后台API接口地址
      testApi: 'http://192.168.1.120:21000'
    },
    redis: {
      host: '192.168.100.88',
      port: 6379
    }
  },
  //仅测试环境设置
  13: {
    req: {
      api: 'http://192.168.1.240/api' //后台API接口地址
    },
    redis: {
      host: '192.168.100.88',
      port: 6379
    }
  },
  16: {
    req: {
      api: 'http://192.168.1.241/api' //后台API接口地址
    },
    redis: {
      host: '192.168.100.89',
      port: 6379
    }
  },
  qa: {
    req: {
      api: 'http://10.173.189.150/api', //后台API接口地址(QA)
      testApi: 'http://192.168.1.120:21000'
        //api: 'http://10.169.104.8/api'  //P端后台API接口地址(公网)
    },
    redis: {
      host: '10.45.164.132',
      port: 6379
    }
  },
  //仅产品环境使用
  production: {
    req: {
      api: 'http://10.169.104.8/api' //P端后台API接口地址
    },
    redis: {
      host: '10.44.70.247',
      port: 6379
    }
  }
};