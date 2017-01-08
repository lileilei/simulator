'use strict';

const PACKAGE = require( '../package' );

module.exports = {
  //公用全局属性
  public: {
    TITLE: '服务端模拟器',
    DESCRIPTION: '服务端模拟器',
    KEYWORDS: '服务端模拟器',
    VERSION: PACKAGE.version, //此版本号应于工程版本号一致
    debug: false,
    //动态编译的js片段路径
    DYN_JS_PATH: '/__DYN_JS__/'
  },
  //仅开发使用
  development: {
    CONTEXT_PATH: '',
    REST_PATH: '/rest',
    TEST_PATH: '/test',
    UPLOAD_PATH: '/api2'
  },
  //仅测试环境设置
  13: {
    CONTEXT_PATH: '/h5',
    REST_PATH: '/h5/rest',
    TEST_PATH: '/h5/test',
    UPLOAD_PATH: '/api2'
  },
  16: {
    CONTEXT_PATH: '/h5',
    REST_PATH: '/h5/rest',
    TEST_PATH: '/h5/test',
    UPLOAD_PATH: '/api2'
  },
  qa: {
    CONTEXT_PATH: '',
    REST_PATH: '/rest',
    TEST_PATH: '/test',
    UPLOAD_PATH: '/api2'
  },
  //仅产品环境使用
  production: {
    CONTEXT_PATH: '',
    REST_PATH: '/rest',
    TEST_PATH: '/test',
    UPLOAD_PATH: '/api2'
  }
};