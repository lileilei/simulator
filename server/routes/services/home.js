'use strict';
exports.indexRender = function* () {
  console.log( this.session.web );
  yield this.render( 'index' );
};