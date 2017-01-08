'use strict';
const fs = require('fs');
const log4js = require('log4js');

const configuration = require('./configuration');
const config = configuration.get('server');

/*
 * 日志对象获取
 */
class Log {
  constructor() {
    this.logs = {};
    //创建日志文件夹
    const dir = config.LOGS_DIR;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    log4js.configure(config.CONF_DIR + '/log4js.json');
    this.connectLogger = this.connectLogger.bind(this);
  }
  getLogger(name) {
    const logs = this.logs;
    return !name ? this : (logs[name] || (logs[name] = log4js.getLogger(name)))
  }
  connectLogger(name) {
    return log4js.connectLogger(this.get(name), {
      level: 'auto' /*, format: ':method :url :status'*/
    });
  }
}

const instance = new Log();
module.exports = instance;