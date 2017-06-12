// 一列竖排两项，四列一屏
// 列数组
let colArr = [];
for (let i = 0; i < list.length; i += 2) {
	// 生成列(两个项)
	const col = document.createElement('div');
	col.className = 'col';
	col.innerHTML = `<a class="item" data-link="${list[i].link}"><img src="${list[i].image}"/><span>${list[i].title}</span></a>`;
	if (!!list[i + 1]) {
		col.innerHTML += `<a class="item" data-link="${list[i+1].link}"><img src="${list[i+1].image}"/><span>${list[i+1].title}</span></a>`;
	}
	// 存到列数组中
	colArr.push(col);
}
// 列数
let num = colArr.length;
// 计算有几屏
let screenNum = num % 4 ? parseInt(num / 4) + 1 : parseInt(num / 4);
let cureentScreen = 0; // 当前第几屏

for (let i = 0; i < screenNum; i++) {
	const screen = document.createElement('div');
	screen.className = 'mui-slider-item';
	let count = 0;

	for (let j = cureentScreen * 4; j < colArr.length; j++) {
		screen.appendChild(colArr[j]);
		if(++count===4){
			break;
		}
	}
	container.appendChild(screen);
	cureentScreen++;
}