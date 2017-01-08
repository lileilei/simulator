'use strict';

module.exports = {

  // 移动光标
  setCursorPosition( input, pos ) {
    if ( !input ) {
      return;
    }
    if ( typeof pos === 'undefined' ) {
      pos = input.value.length;
    }
    if ( input.setSelectionRange ) {
      input.focus();
      input.setSelectionRange( pos, pos );
    } else if ( input.createTextRange ) {
      var range = input.createTextRange();
      range.collapse( true );
      range.moveEnd( 'character', pos );
      range.moveStart( 'character', pos );
      range.select();
    }
  },

  //全角转半角
  fullChar2halfChar( str ) {
    var result = '';
    var code = 0;
    for ( var i = 0, j = str.length; i < j; i += 1 ) {
      code = str.charCodeAt( i );
      //获取当前字符的unicode编码  
      if ( code >= 65281 && code <= 65373 ) { //unicode编码范围是所有的英文字母以及各种字符
        result += String.fromCharCode( str.charCodeAt( i ) - 65248 );
        //把全角字符的unicode编码转换为对应半角字符的unicode码  
      } else if ( code === 12288 ) {
        result += String.fromCharCode( str.charCodeAt( i ) - 12288 + 32 );
        //半角空格  
      } else {
        result += str.charAt( i );
        //原字符返回  
      }
    }
    return result;
  }
};