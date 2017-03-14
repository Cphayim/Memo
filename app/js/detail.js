/* 
 * detail 数据详细查看/编辑
 * 
 * 功能点
 * 查看/编辑模式切换				完成
 * 新增数据请求 		 			完成
 * 更新数据请求					完成
 * 
 * Author: Cphayim
 * Date: 2017-03-09
 */

mui.init({});

// 参数获取
// iOS and Android
var self = plus.webview.currentWebview();

var folderId = self.folderId; // 文件夹id
var folderName = self.folderName;// 文件夹名
var _id = self._id; // 当前记录的主键(有即修改，无即创建)
var detail = self.detail;// 原内容(有的话)

mui('.mui-bar-nav .mui-pull-left')[0].innerHTML = folderName;

//
var textarea = document.querySelector('.u-text-input');
var p = document.querySelector('.u-text-p');
var edit = document.querySelector('#j-edit');

// 网页端测试
//var _id;
//detail = '测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字测试文字';
//////////

//返回事件
mui.back = function() {
    // 触发父 Webview 的自定义事件
    mui.fire(plus.webview.getWebviewById('itmes'), 'reloadList');
    // 关闭当前 Webview
    plus.webview.currentWebview().close();
};

// 初值
p.innerHTML = detail;
textarea.value = detail;

// 根据有没有传递 _id 来判断 “创建” 还是 “更新”
if (_id) {
    // 进入查看模式
    lookModel();
} else {
    // 进入编辑模式
    editModel();
}

// 事件监听
mui('.mui-bar-nav').on('tap', '#j-edit.edit', function(e) {
	// 没有修改内容
	if (textarea.value == p.innerHTML) {
        lookModel();
        return;
    }
    var data = {
    		folderId: folderId,
        detail: textarea.value
    }
    // 完成保存->发送更新(创建)请求
    if (_id) {
        data._id = _id;
        // 更新请求
        mui.ajax(host + '/items/update', {
            type: 'post',
            data: data,
            success: function(resData) {
                mui.toast(resData.mess);
   				p.innerHTML = textarea.value;
   				// 进入查看模式
   				lookModel();
            },
            error: function() {
                mui.toast('连接服务器失败，请检查网络');
            }
        });
    } else {
        // 创建请求
        mui.ajax(host + '/items/create', {
            type: 'post',
            data: data,
            success: function(resData) {
                mui.toast(resData.mess);
                _id = resData.data._id; // _id 赋值 为返回的 _id
                p.innerHTML = textarea.value;
   				// 进入查看模式
   				lookModel();
            },
            error: function() {
                mui.toast('连接服务器失败，请检查网络');
            }
        });
    }
}).on('tap', '#j-edit.look', function(e) {
    // 开始编辑

    // 进入编辑模式
    editModel();
});

/**
 * 切换到编辑模式
 */
function editModel() {
    p.style.display = 'none';
    textarea.style.display = 'block';
    textarea.focus();
    edit.className = 'mui-pull-right edit';
    edit.innerHTML = '保存';
}

/**
 * 切换到查看模式
 */
function lookModel() {
    textarea.blur();
    textarea.style.display = 'none';
    p.style.display = 'block';
    edit.className = 'mui-pull-right look';
    edit.innerHTML = '编辑';
}