/* 
 * Memo 后端入口文件
 * 负责初始化项目，核心模块加载与启动服务器
 * 
 * Author: Cphayim
 * Date: 2017-03-07
 */

const express = require('express');
const app = express();

// 项目初始化构建模块
require('./modules/init.js');

// 时间格式化模块
require('./modules/dateFormat.js');
//console.log(new Date().Format('yyyy-MM-dd hh:mm:ss'));

// 服务器日志输出模块
require('./modules/printLog.js');

// post 请求解析模块
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('app'));

// 设置跨域响应头
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    if (req.method == "OPTIONS") res.send(200);
    else next();
});

// 路由模块
app.use('/folder', require('./router/folder.js'));
app.use('/items', require('./router/items.js'));

app.listen(3000, function(req, res) {
    console.log('Memo 服务器已开启...');
});