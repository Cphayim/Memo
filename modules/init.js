/*
 * 项目数据文件确认初始化与构建
 */

let fs = require('fs');
console.log('Memo 初始化检测中...');

// 服务端日志文件确认
if (!fs.existsSync('serverLog.txt')) {
    fs.writeFileSync('serverLog.txt','');
}

console.log('Memo 初始化完毕...');
/**
 * 目录检查
 * 不存在则创建
 * @param {Object} path 路径
 */
function pathCheck(path) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
        console.log('初始化目录: ' + path + ' 创建成功');
    }
}