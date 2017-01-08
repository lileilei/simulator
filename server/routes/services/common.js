'use strict';

module.exports = {

  // 直接渲染
  renderQuickly( path ) {
    return function* () {
      yield this.render( path );
    }
  },
};