'use strict';
const fs = require('fs');
const path = require('path');
const deepAssign = require('deep-assign');
const CONF_DIV = path.join(__dirname, '../../conf');
const includeList = ['server', 'locals'];

class Config {
  constructor() {
    const serverCfg = require(path.normalize(CONF_DIV + '/' + 'server'));
    const NODE_ENV = serverCfg.public.NODE_ENV;
    const defaults = this.defaults = {};
    (fs.readdirSync(CONF_DIV) || []).forEach((file) => {
      let fileNameParser = path.parse(file);
      if (~includeList.indexOf(fileNameParser.name)) {
        let obj = require(path.normalize(CONF_DIV + '/' + file));
        defaults[fileNameParser.name] = deepAssign({}, obj.public, obj[NODE_ENV]);
      }
    });
  }

  get(name) {
    const defaults = Object.assign({}, this.defaults);
    return !name ? defaults : defaults[name];
  }

  set(key, value) {
    const defaults = this.defaults;
    typeof key === 'object' ? Object.assign(defaults, key) : (defaults[key] = value);
    return this;
  }
}

const instance = new Config();
module.exports = instance;