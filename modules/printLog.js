// 服务器日志生成

var fs = require('fs');
require('./dateFormat.js');

/**
 * 日志生成
 * @param {Object} mess 消息
 */
var printLog = function(mess){
	var log = new Date().Format('yyyy-MM-dd hh:mm:ss') +'\t' +mess +'\n';
	fs.appendFile('serverLog.txt',log);
}

module.exports = printLog;