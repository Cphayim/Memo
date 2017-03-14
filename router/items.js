/* items相关操作的路由模块
 * 
 * 功能点
 * 
 * Author: Cphayim
 * Date: 2017-03-09
 */

const express = require('express');
// 文件IO模块
const fs = require('fs');
// 数据库连接模块
const DB = require('../modules/db.js');
// 服务端错误响应模块
const errRes = require('../modules/error.js');
// 创建路由
let router = express.Router();

// items 列表数据接口
router.get('/list', function(req, res) {
    setTimeout(function() {
        getItems(req, res);
    }, 300);
});

// item 创建接口
router.post('/create', function(req, res) {
    console.log('/create 收到post请求');
    let date = new Date().Format('yyyy-MM-dd hh:mm:ss');
    let folderId = req.body.folderId;
    req.body.createDate = date;
    req.body.editDate = date;
    let items = new DB.Items(req.body);
    items.save(function(err, data) {
        if (!err) {
            // 更新 folder 中的 count
            res.status(200).json({
                code: 1,
                mess: '创建数据成功',
                data: data
            });
        } else {
            res.status(200).json(errRes.writeErr)
        }

    });

});

// item 更新接口
router.post('/update', function(req, res) {
    console.log(req.body);
    let _id = req.body._id;
    let detail = req.body.detail;
    let editDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
    DB.Items.update({ _id }, { detail, editDate }, function(err, result) {
        if (err) {
            res.status(200).json(errRes.writeErr)
        }
        if (!result) {
            res.status(200).json({
                code: 2,
                mess: '你更新的可能是一条假数据，数据库表示没有找到它'
            });
        } else {
            res.status(200).json({
                code: 1,
                mess: '更新数据成功'
            });
        }
    });
});

// item 删除接口
router.post('/remove', function(req, res) {
    let ids = req.body.ids;
    console.log(1);
    DB.Items.remove({ '_id': { $in: ids } }, function(err, data) {
        if (err) {
            res.status(200).json(errRes.writeErr);
        } else {
            res.status(200).json({ code: 1, mess: '删除成功' });
        }
    });
});

/**
 * 返回 items list 数据
 * @param {Object} req
 * @param {Object} res
 */
function getItems(req, res) {
    DB.Items.find(req.query, function(err, data) {
        if (err) {
            res.status(200).json(errRes.readErr);
        } else {
            res.status(200).json({
                code: 1,
                mess: 'Items数据加载成功',
                data: data
            });
        }
    }).sort({ editDate: -1 });
}

module.exports = router;