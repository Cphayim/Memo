/* 
 * 功能点:
 * 首页数据请求、列表加载					完成
 * 首页数据列表下拉刷新					完成
 * 新建文件夹请求、数据加载				完成
 * 列表项向左滑动删除单条，请求，数据更新	完成
 * 批量删除，请求，数据更新				完成
 * 
 * Author: Cphayim
 * Date: 2017-03-05
 */

// 初始化下拉刷新组件
mui.init({
    pullRefresh: {
        container: "#refreshContainer",
        down: {
            auto: true,
            contentdown: "下拉刷新数据",
            contentover: "释放立即刷新",
            contentrefresh: "正在刷新...",
            callback: folderLoad
        }
    }
});
// 初始化区域滚动组件
mui('.mui-scroll-wrapper').scroll({
    deceleration: 0.0005, // 阻尼系数
    bounce: true, // 列表回弹
});

/**
 * 加载 folder List
 * @param {Object} isBack 标记是否是返回触发的刷新事件 
 */
function folderLoad(isBack) {
    mui.ajax(host + '/folder/list', {
        type: 'get',
        success: function(resData) {
            mui('#j-folder-list')[0].innerHTML = '';
            if (resData.code) {
                insertFolder(resData.data);
                isBack || mui.toast('目录数据加载成功');
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
(function(mui) {
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
            mui('#j-mkdir')[0].style.display = 'none';
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
            mui('#j-mkdir')[0].style.display = 'block';
            mui('#j-remove')[0].style.display = 'none';
            // a标签 挂上前进标记
            for (var i = 0; i < allA.length; i++) {
                allA[i].className = 'mui-navigate-right go';
            }
        }
        editState = !editState;
    });

    // 左滑删除单个文件夹
    mui('.mui-table-view').on('tap', '.mui-disabled .mui-btn', function(e) {
        var $this = this;
        var li = $this.parentNode.parentNode;
        mui.confirm('确认删除？', '提示', ['取消', '确认'], function(e) {
            if (e.index) {
                var ids = [];
                ids.push(li.id);
                mui.ajax(host + '/folder/remove', {
                    type: 'post',
                    data: {
                        ids: ids
                    },
                    success: function(resData) {
                        if (resData.code == 1) {
                            li.parentNode.removeChild(li);
                            mui.toast('删除目录成功');
                        } else {
                            mui.toast('删除目录失败');
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
        // 打开子页面
        mui.openWindow('items.html', 'itmes', {
            extras: {
                folderId: this.parentNode.id,
                folderName: this.getAttribute('folderName')
            },
            show: {
                aniShow: 'pop-in',
                duration: 300
            },
            waiting: {
                autoShow: true
            }
        });
    }).on('tap', '.mui-navigate-right.edit', function(e) {
        if (this.getAttribute('default') == 'true') {
            return;
        }
        // 重命名文件夹
        var li = this.parentNode;
        var folderId = li.id;
        var nameDiv = this.getElementsByTagName('div')[0];
        // 原文件夹名
        var oldFolderName = nameDiv.innerHTML;
        mui.prompt('请为"' + oldFolderName + '"输入新名称', oldFolderName, '重命名文件夹', ['取消', '存储'], function(e) {
            if (e.index === 0) {
                return;
            }
            var newFolderName = e.value;
            // 无输入或同名
            if (newFolderName.length == 0 || newFolderName == oldFolderName) {
                return;
            }
            var reg = /([\s0-9a-zA-Z\u4E00-\u9FA5])/g;
            if (!reg.test(newFolderName)) {
                mui.toast('文件夹名只能由中文，字母，数字和空格组成');
                return;
            }
            mui.ajax(host + '/folder/rename', {
                type: 'post',
                data: {
                    folderId: folderId,
                    oldFolderName: oldFolderName,
                    newFolderName: newFolderName
                },
                success: function(resData) {
                    if (resData) {
                        nameDiv.innerHTML = newFolderName;
                        nameDiv.parentNode.setAttribute('folderName', newFolderName);
                        mui.toast('重命名成功')
                    } else {
                        mui.toast(resData.mess);
                    }
                },
                error: function() {
                    mui.toast('连接服务器失败，请检查网络');
                }
            });
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

    mui('.mui-bar-tab').on('tap', '#j-mkdir', function() {
        // 新建文件夹
        mui.prompt('请为此文件夹输入名称', '名称', '新建文件夹', ['取消', '存储'], function(e) {
            if (e.index === 0) {
                return;
            }
            var folderName = e.value;
            if (folderName.length == 0) {
                mui.toast('文件夹名不能为空');
                return;
            }
            var reg = /([\s0-9a-zA-Z\u4E00-\u9FA5])/g;
            if (!reg.test(folderName)) {
                mui.toast('文件夹名只能由中文，字母，数字和空格组成');
                return;
            }
            mui.ajax(host + '/folder/create', {
                type: 'post',
                data: {
                    folderName: folderName
                },
                success: function(resData) {
                    console.log(resData);
                    if (resData.code == 1) {
                        insertFolder(resData.data);
                        mui.toast(resData.mess);
                    } else if (resData.code == 2) {
                        mui.toast(resData.mess);
                    } else {
                        mui.toast(resData.mess);
                    }
                },
                error: function() {
                    mui.toast('连接服务器失败，请检查网络');
                }
            });

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
            mui.ajax(host + '/folder/remove', {
                type: 'post',
                data: {
                    ids: ids
                },
                success: function(resData) {
                    if (resData.code == 1) {
                        for (var i = 0; i < aLi.length; i++) {
                            aLi[i].parentNode.removeChild(aLi[i]);
                        }
                        mui.toast('删除目录成功');
                        mui.trigger(mui('#j-edit')[0],'tap');
                    } else {
                        mui.toast('删除目录失败');
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
		folderLoad(true);
	});
})(mui);



/**
 * 在 #j-folder-list 插入 Folder 文件夹
 * @param {Object} data 服务端返回的 data 数组
 */
function insertFolder(data) {
    for (var i = 0; i < data.length; i++) {
        var li = document.createElement('li');
        li.id = data[i]._id;
        li.className = 'mui-table-view-cell';
        if (data[i].index == 1) {
            li.innerHTML = '<a class="mui-navigate-right go" default="true" folderName="' + data[i].folderName + '">' + data[i].folderName + '<span class="mui-badge noColor">' + data[i].count + '</span></a>'
        } else {
            li.innerHTML = '<div class="mui-checkbox mui-left"><input name="checkbox" value="0" type="checkbox"></div><a class="mui-navigate-right go" folderName="' + data[i].folderName + '" ><div class="mui-slider-handle">' + data[i].folderName + '</div><span class="mui-badge noColor">' + data[i].count + '</span><div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div></a>';
        }
        mui('#j-folder-list')[0].appendChild(li);
    }
}