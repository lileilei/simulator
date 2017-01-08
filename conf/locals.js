﻿'use strict';

const PACKAGE = require('../package');

module.exports = {
  //公用全局属性
  public: {
    TITLE: '蜘蛛差旅',
    DESCRIPTION: '深圳市蜘蛛旅游网络技术有限公司成立于2014年，是一家在线旅游互联网技术平台公司，瞄准的是中国酒店行业B2B市场。公司汇集了一大批BAT背景的互联网高级人才。不同于传统的中介分销模式，蜘蛛旅游网旨在利用互联网思维，通过自有平台技术和产品服务，为酒店和酒店产品行业客户（旅行社、会展公司、企业客户等）搭建一个开放、透 明、中立的酒店产品在线直销和交易撮合平台。作为完全中立的第三方，蜘蛛旅游网不介入或影响任何平台交易的达成。我们将专注于通过互联网技术和在线交易机制的创新，帮助解 决传统酒店产品线下交易的种种问题和弊端，提高交易效率、减少交易环节及降低交易成本。蜘蛛旅游网的愿景是成为中国酒店行业第一个B2B在线直销交易平台，真正推进中国酒店行业在线化进程。',
    KEYWORDS: '携程,艺龙,去哪儿,OTA,客房销售,客房管理,酒店管理,酒店推广,酒店采购,酒店预订,三亚预订,客房预订,订房,包房,酒店空房率,协议酒店,公司接待,公司预订,蜘蛛旅游,蜘蛛旅游网,深圳市蜘蛛旅游网络技术有限公司',
    VERSION: PACKAGE.version, //此版本号应于工程版本号一致
    debug: false,
    HOTEL_GRADE_LABEL: ['', '快捷连锁', '二星/经济', '三星/舒适', '四星/高档', '五星/豪华'],
    BREAKFAST_LABEL: ['无早', '单早', '双早', '三早', '四早'],
    ROLES: {
      E_EMPLOYEE: '员工',
      E_OWNER: '管理员',
      E_BOSS: '老板',
      E_BANKER: '财务'
    },
    WEEK_LABEL: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    FLIGHT_IDTYPES: {
      0: '身份证',
      1: '护照',
      2: '学生证',
      3: '军官证',
      4: '驾驶证',
      5: '回乡证',
      6: '台胞证',
      7: '港澳通行证',
      8: '台湾通行证',
      9: '士兵证',
      10: '临时身份证',
      11: '户口簿',
      12: '警官证',
      13: '出生证明',
      14: '出生日期',
      99: '其它'
    },
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