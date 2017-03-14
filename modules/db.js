/*
 * mongodb 数据库连接，集合创建模块
 * Author: Cphayim
 * Date: 2017-03-07
 */

// 导入 mongoose 模块
const mongoose = require('mongoose');
const DB_URL = 'mongodb://memo:memo123456@127.0.0.1:37017/Memo';

// 连接数据库
mongoose.connect(DB_URL);

mongoose.connection.on('connected', function() {
    console.log('Memo mongodb 数据库连接成功: ');
});
mongoose.connection.on('error', function() {
    console.log('Memo mongodb 数据库连接失败: ');
});

mongoose.connection.on('disconnected', function() {
    console.log('Memo mongodb 数据库连接断开: ');
});

let Schema = mongoose.Schema;

// 文件夹集合
let folderSchema = new Schema({ folderName: String, count: Number, createDate: String }, { versionKey: false }, { collection: 'folder' });
let Folder = mongoose.model('Folder', folderSchema);

// 文件集合
let itemSchema = new Schema({ detail: String, createDate: String, editDate: String,folderId:{type:Schema.Types.ObjectId, ref:'Folder'} }, { versionKey: false }, { collection: 'item' });
let Items = mongoose.model('Items', itemSchema);

module.exports = { Items, Folder };