'use strict';

module.exports = {

    // 直接渲染
    renderQuickly(path) {
        return function*() {
            yield this.render(path);
        }
    },

    // 登录状态拦截
  isLogin() {
    return function* (next) {
      if (!this.session.web) { // 未登录
        const CONTEXT_PATH = this.state.CONTEXT_PATH;
        this.redirect( CONTEXT_PATH + '/guide/login.html?backurl=' + CONTEXT_PATH + encodeURIComponent(this.url) );
      } else {
        yield next;
      }
    };
  }
};