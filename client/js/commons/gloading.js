'use strict';

const rnotwhite = ( /\S+/g );
const rclass = /[\t\r\n\f]/g;

// 创建dom
function buildDom() {
  const $dom1 = document.createElement( 'div' );
  const $dom11 = $dom1.cloneNode( false );
  const $dom12 = $dom1.cloneNode( false );
  $dom1.className = 'gloading hidden';
  $dom11.className = 'mask';
  $dom12.className = 'content';
  $dom1.appendChild( $dom11 );
  $dom1.appendChild( $dom12 );
  return $dom1;
}

function addClass( elem, value ) {
  let classes, cur, curValue, finalValue;

  if ( typeof value === 'string' && value ) {
    classes = value.match( rnotwhite ) || [];

    curValue = elem.className;
    cur = ( ' ' + curValue + ' ' ).replace( rclass, ' ' );
    if ( cur ) {
      classes.forEach( ( clazz ) => {
        if ( cur.indexOf( ' ' + clazz + ' ' ) < 0 ) {
          cur += clazz + ' ';
        }
      } );
      finalValue = cur.trim();
      if ( curValue !== finalValue ) {
        elem.className = finalValue;
      }
    }
  }
}

function removeClass( elem, value ) {
  let classes, cur, curValue, finalValue;
  if ( arguments.length === 1 ) {
    elem.className = '';
  }

  if ( typeof value === 'string' && value ) {
    classes = value.match( rnotwhite ) || [];
    curValue = elem.className;
    cur = ( ' ' + curValue + ' ' ).replace( rclass, ' ' );
    if ( cur ) {
      classes.forEach( ( clazz ) => {
        while ( cur.indexOf( ' ' + clazz + ' ' ) > -1 ) {
          cur = cur.replace( ' ' + clazz + ' ', ' ' );
        }
      } );
      finalValue = cur.trim();
      if ( curValue !== finalValue ) {
        elem.className = finalValue;
      }
    }
  }
}

const $loading = buildDom();
const $html = document.getElementsByTagName( 'html' )[ 0 ];

document.body.appendChild( $loading );

export default {
  start() {
    //如果页面出现滚动条， 就把预留出滚动条的位置
    if ( document.documentElement.clientHeight < document.documentElement.offsetHeight - 4 ) {
      addClass( $html, 'loading' );
    }
    removeClass( $loading, 'hidden' );
    return this;
  },
  stop() {
    addClass( $loading, 'hidden' );
    removeClass( $html, 'loading' );
    return this;
  }
};