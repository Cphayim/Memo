/* 
 * 
 * 服务器地址设置（全局变量）
 */
//var host = 'http://127.0.0.1:3000';
//var host = 'http://172.20.10.9:3000';
// var host = 'http://memo.cphayim.me';
   var host = 'http://node.cphayim.me';
// 4/5透明玻璃挡板
(function(){
	function Glass(){
		this.init();
	}
	Glass.prototype.init = function(){
		this.ele = document.createElement('div');
		document.body.appendChild(this.ele);
		this.ele.id = 'j-glass';
		this.ele.style.display = 'none';
		this.ele.style.position = 'fixed';
		this.ele.style.zIndex = 5;
		this.ele.style.bottom = 0;
		this.ele.style.left = '50px';
		this.ele.style.right = 0;
		this.ele.style.top = 0;
		this.ele.style.bottom = 0;
	}
	Glass.prototype.show = function(){
		this.ele.style.display = 'block';		
	}
	Glass.prototype.hide = function(){
		this.ele.style.display = 'none';		
	}
	
	window.Glass = Glass;
})(window);

/**
 * 删掉 id 中的 memoIndex_ 前缀
 * @param {String} id
 */
function getMemoIndexById(id){
	return id.replace(/memoIndex_/ig,'');
}
