/*
 * 目录内页，数据列表
 * 
 * 功能点：
 * Items 列表请求、加载		完成
 * items 列表下拉刷新			完成
 * 列表项向左滑动删除 Item	完成
 * 批量删除 item				
 * 
 * Author: Cphayim
 * Date: 2017-03-09
 */

// 下拉刷新组件初始化
mui.init({
    pullRefresh: {
        container: "#refreshContainer",
        down: {
            auto: true,
            contentdown: "下拉刷新数据",
            contentover: "释放立即刷新",
            contentrefresh: "正在刷新...",
            callback: itemsLoad
        }
    }
});
// 初始化区域滚动组件
mui('.mui-scroll-wrapper').scroll({
    deceleration: 0.0005, // 阻尼系数
    bounce: true, // 列表回弹
});

// 参数获取
// iOS and Android
var self = plus.webview.currentWebview();
var folderId = self.folderId;
var folderName = self.folderName;

var itemList = document.querySelector('#j-items-list');

// 网页端测试
//var folderId = '58c1437fcb9df80f0644e5fc';
//var folderName = '生活';

//返回事件
mui.back = function() {
    // 触发父 Webview 的自定义事件
    mui.fire(plus.webview.getWebviewById('folder'), 'reloadList');
    // 关闭当前 Webview
    plus.webview.currentWebview().close();
};

// 更新Title
mui('.mui-bar .mui-title')[0].innerHTML = folderName;



/**
 * 加载 items List
 * @param {Object} isBack 标记是否是返回触发的刷新事件 
 */
function itemsLoad(isBack) {
    var data = {
        folderId: folderId
    }
    mui.ajax(host + '/items/list', {
        type: 'get',
        data: data,
        success: function(resData) {
            console.log(resData);
            itemList.innerHTML = '';
            if (resData.code) {
                insertItems(resData.data);
                isBack || mui.toast('"' + folderName + '"数据加载成功');
            } else {
                mui.toast(resData.mess);
            }
            mui('#refreshContainer').pullRefresh().endPulldownToRefresh();
        },
        error: function() {
            mui.toast('连接服务器失败，请检查网络');
        }
    });
}

// 事件监听
(function() {
    // 编辑状态标记
    var editState = false;
    // 编辑按钮
    mui('.mui-bar-nav').on('tap', '#j-edit', function() {
        var allA = mui('.mui-table-view .mui-navigate-right');
        if (!editState) {
            // 进入编辑
            this.innerHTML = '完成';
            mui('.mui-table-view')[0].className = 'mui-table-view edit';
            mui('#j-remove')[0].style.display = 'block';
            mui('#j-createItems')[0].style.display = 'none';
            // a标签 挂上编辑标记
            for (var i = 0; i < allA.length; i++) {
                allA[i].className = 'mui-navigate-right edit';
            }
        } else {
            // 退出编辑
            this.innerHTML = '编辑';
            mui('.mui-table-view')[0].className = 'mui-table-view';
            var aCheckbox = mui('.mui-table-view .mui-checkbox input');
            // 重置 checkbox
            for (var i = 0; i < aCheckbox.length; i++) {
                aCheckbox[i].checked && (aCheckbox[i].checked = false);
            }
            mui('#j-createItems')[0].style.display = 'block';
            mui('#j-remove')[0].style.display = 'none';
            // a标签 挂上前进标记
            for (var i = 0; i < allA.length; i++) {
                allA[i].className = 'mui-navigate-right go';
            }
        }
        editState = !editState;
    });

    // 列表
    mui('.mui-table-view').on('tap', '.mui-disabled .mui-btn', function(e) {
        var $this = this;
        var li = $this.parentNode.parentNode;
        console.log(li);
        mui.confirm('确认删除？', '提示', ['取消', '确认'], function(e) {
            if (e.index) {
                var ids = [];
                ids.push(li.id);
                mui.ajax(host + '/items/remove', {
                    type: 'post',
                    data: {
                        ids: ids
                    },
                    success: function(resData) {
                        if (resData.code == 1) {
                            li.parentNode.removeChild(li);
                            mui.toast('删除成功');
                        } else {
                            mui.toast('删除失败');
                        }
                    },
                    error: function() {
                        mui.toast('连接服务器失败，请检查网络');
                        setTimeout(function() {
                            mui.swipeoutClose(li);
                        }, 0);
                    }
                });
            } else {
                setTimeout(function() {
                    mui.swipeoutClose(li);
                }, 0);
            }
        });
    }).on('tap', '.mui-navigate-right.go', function(e) {
        var li = this.parentNode;
        var detail = this.querySelector('.mui-ellipsis').innerHTML;
        var _id = li.id;
        // 打开子页面
        openDetail({
            _id: _id,
            folderId: folderId,
            folderName: folderName,
            detail: detail
        });
    }).on('change', '.mui-checkbox input', function() {
        // 编辑状态下根据 input的 checked情况更变 删除按钮状态
        var aCheckbox = Array.from(mui('.mui-table-view .mui-checkbox input'));
        aCheckbox = aCheckbox.filter(function(item, index, arr) {
            return item.checked;
        });
        if (aCheckbox.length < 1) {
            mui('#j-remove')[0].className = 'mui-pull-right';
        } else {
            mui('#j-remove')[0].className = 'mui-pull-right active';
        }
    });

    mui('.mui-bar-tab').on('tap', '#j-createItems', function() {
        // 新建 进入子 webview 的编辑模式
        openDetail({
            folderId: folderId,
            folderName: folderName,
            detail: ''
        });
    }).on('tap', '#j-remove', function() {
        // 批量删除选择项
        var aCheckbox = Array.from(mui('.mui-table-view .mui-checkbox input'));
        // 过滤出选项
        aCheckbox = aCheckbox.filter(function(item, index, arr) {
            return item.checked;
        });
        // 选项小于1不执行
        if (aCheckbox.length < 1) {
            return;
        }
        mui.confirm('确认删除？', '提示', ['取消', '确认'], function(e) {
            if (!e.index) {
                return;
            }
            var aLi = []; // li 节点数组
            var ids = []; // id 数据数组
            for (var i = 0; i < aCheckbox.length; i++) {
                var li = aCheckbox[i].parentNode.parentNode;
                aLi.push(li);
                ids.push(li.id);
            }
            console.log(ids);
            mui.ajax(host + '/items/remove', {
                type: 'post',
                data: {
                    ids: ids
                },
                success: function(resData) {
                    if (resData.code == 1) {
                        for (var i = 0; i < aLi.length; i++) {
                            aLi[i].parentNode.removeChild(aLi[i]);
                        }
                        mui.toast('批量删除成功');
                        mui.trigger(mui('#j-edit')[0], 'tap');
                    } else {
                        mui.toast('批量删除失败');
                    }
                },
                error: function() {
                    mui.toast('连接服务器失败，请检查网络');
                }
            });
        });
    });
    
    // 窗口自定义事件
	window.addEventListener('reloadList',function(e){
		itemsLoad(true);
	});
})();
/**
 * 插入 items
 * @param {Array} data 请求的数据数组
 */
function insertItems(data) {
    for (var i = 0; i < data.length; i++) {
        var li = document.createElement('li');
        li.id = data[i]._id;
        li.className = 'mui-table-view-cell mui-media';
        li.innerHTML = '<div class="mui-checkbox mui-left"><input name="checkbox" value="0" type="checkbox"></div><a href="javascript:;" class="mui-navigate-right go"><div class="mui-media-body mui-slider-handle"><p class="mui-ellipsis">' + data[i].detail + '</p><p class="last-edit-time">' + data[i].editDate + '</p></div><div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div></a>';
        itemList.appendChild(li);
    }
}

/**
 * 打开 Detail Webview
 * @param {Object} extras 向 detail webview 传递的参数
 */
function openDetail(extras) {
    extras = extras || {};
    mui.openWindow('detail.html', 'detail', {
        extras: extras,
        show: {
            aniShow: 'pop-in',
            duration: 300
        },
        waiting: {
            autoShow: true
        }
    });
}