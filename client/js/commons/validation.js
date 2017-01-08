'use strict';

const REGEXP = {
  CELLPHONE: /^0?(13[0-9]|15[0-9]|17[0-9]|18[0-9]|14[0-9]|0?85[23])[0-9]{8}$/,
  PHONE: /^([0-9]{3,4}(\-\|)?)?[0-9]{7,8}$/,
  EMAIL: /^[a-z0-9A-Z]+([._\\-]*[a-z0-9A-Z])*@([a-z0-9A-Z]+[-a-z0-9A-Z]*[a-z0-9A-Z]+.){1,63}[a-z0-9A-Z]+$/,
  NUMBER: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,
  PASSWORD: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}\[\]:";'<>?,.\/]).{6,16}$/,
  INTEGER: /^\d+$/,
  URL: /^([a-zA-Z]+:\/\/)?([a-zA-Z0-9\-\.]+)([-\w .\/?%&=:]*)$/
};

function validate( text, regexp, isTrim ) {
  if ( isTrim ) {
    text = text === null || typeof text === 'undefined' ? '' : ( text + '' ).trim();
  }
  return regexp.test( text );
}

module.exports = {
  REGEXP: REGEXP,

  isCellphone( text, isTrim ) {
    return validate( text, this.REGEXP.CELLPHONE, isTrim );
  },

  isPhone( text, isTrim ) {
    return validate( text, this.REGEXP.PHONE, isTrim );
  },

  isEmail( text, isTrim ) {
    return validate( text, this.REGEXP.EMAIL, isTrim );
  },

  isNumber( text, isTrim ) {
    return validate( text, this.REGEXP.NUMBER, isTrim );
  },

  isPassword( text, isTrim ) {
    return validate( text, this.REGEXP.PASSWORD, isTrim );
  },

  isInteger( text, isTrim ) {
    return validate( text, this.REGEXP.INTEGER, isTrim );
  },

  isEmpty( text ) {
    return text === null || typeof text === 'undefined' ? true : !( text + '' ).trim();
  },

  isUrl( text, isTrim ) {
    return validate( text, this.REGEXP.URL, isTrim );
  }
};