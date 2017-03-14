/* 文件目录相关操作的路由模块
 * 
 * 功能点
 * 服务器日志生成					完成
 * 首页列表数据请求的响应 			完成
 * 新建目录的写入、响应			完成
 * 删除目录请求的响应				完成
 * 
 * Author: Cphayim
 * Date: 2017-03-08
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

// 首页目录列表数据接口
router.get('/list', function(req, res) {
    updateCount();
    console.log('收到首页数据拉取请求');
    setTimeout(function() {
        getFolder(req, res);
    }, 300);
});

// 目录创建接口
router.post('/create', function(req, res) {
    let folderObj = req.body;
    // 查询数据库是否存在同名目录
    DB.Folder.findOne(folderObj, function(err, data) {
        if (err) {
            res.status(200).json(errRes);
        } else if (data) {
            res.status(200).json({
                code: 2,
                mess: '该文件夹已存在'
            });
        } else {
            folderObj.count = 0;
            folderObj.createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
            // 写入数据库
            let folder = new DB.Folder(folderObj);
            folder.save(function(err, data) {
                if (err) {
                    res.status(200).json(errRes.writeErr);
                } else {
                    // 前端使用循环创建列表视图的函数，需要返回数组类型的数据
                    res.status(200).json({
                        code: 1,
                        mess: '创建目录成功',
                        data: [data]
                    });
                }
            });
        }
    });
});

/**
 * 删除目录接口
 */
router.post('/remove', function(req, res) {
    let ids = req.body.ids;
    // 删除数据库中对应项
    DB.Folder.remove({
        '_id': {
            $in: ids
        }
    }, function(err, data) {
        if (err) {
            res.status(200).json(errRes.writeErr);
        } else {
            res.status(200).json({
                code: 1,
                mess: '删除成功'
            });
        }
    });
});

/*
 * 重命名目录接口
 */
router.post('/rename', function(req, res) {
    console.log(req.body);
    var updateObj = {
        folderName: req.body.newFolderName
    }
    DB.Folder.update({
        folderId: req.body.folderId
    }, updateObj, function(err, Obj) {
        if (err) {
            res.status(200).json(errRes.writeErr);
        } else {
            res.status(200).json({
                code: 1,
                mess: "重命名成功"
            });
        }
    });
});

/**
 * 获取 首页目录列表 并返回给前端
 * @param {Object} req
 * @param {Object} res
 */
function getFolder(req, res) {
    // 数据查询
    DB.Folder.find(function(err, data) {
        if (err) {
            res.status(200).json(errRes.readErr);
        } else {
            res.status(200).json({
                code: 1,
                mess: '查询成功',
                data
            });
        }
    });
}

/**
 * 更新 所有 Folder 集合的 Count
 */
function updateCount() {
    DB.Folder.find(function(err, data) {
        let a_id = [];
        console.log(data.length);
        for (var i = 0; i < data.length; i++) {
            let _id = data[i]._id;
            DB.Items.count({
                folderId: _id
            }, function(err, count) {
                console.log(_id + ' ,count:' + count);
                DB.Folder.update({
                    _id
                }, {
                    count
                }, function() {});
            });
        }
    });
}
updateCount();
module.exports = router;