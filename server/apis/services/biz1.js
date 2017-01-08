'use strict';

const http = require( '../../utils/http' );

module.exports = {

  // demo1
  * getList() {

    const rsp = yield http.get( {
      url: '/generic/addr/provinces2cities2Areas',
      req: this.request
    } );
    this.type = rsp.headers[ 'content-type' ];
    this.body = rsp.body;
  },

  // demo2
  * getList2() {

    const rsp = yield http.get( {
      url: '/generic/addr/provincecities',
      req: this.request,
      qs: {
        provinceId: '110000'
      }
    } );
    this.type = rsp.headers[ 'content-type' ];
    this.body = rsp.body;

  },

  //demo3
  * getList3() {

    const rsp = yield http.post( {
      url: '/generic/addr/provincecities',
      req: this.request,
      form: {
        provinceId: '110000'
      }
    } );
    this.type = rsp.headers[ 'content-type' ];
    this.body = rsp.body;

  }

};