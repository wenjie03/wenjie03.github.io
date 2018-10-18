;(function(window, document){
	let idEmptyPos = 0,					// 默认的空的位置
		stepNumber = 0,					// 步数记录
		imgUrl     = './banner01.jpg',	// 默认的背景图片
		lineNum    = 3, 				// 行数（列数与行数相同）
		blockWidth = 100,				// 拼图每场的宽高
		idData     = [],				// 移动拼图时，操作的数据
		gameIng    = false;				// 是否进行中

	const 
		// 拼图区域
		$jigsawBox     = document.getElementById('jigsawBox'), 
		// 预览区域
		$previewImgBox = document.querySelector('.previewBox').querySelector('img'),
		// 状态区域
		$statusBox     = document.querySelector('.statusBox'),
		// 状态下的所用时间
		$timeBox       = $statusBox.querySelectorAll('span')[0],
		// 状态下的步数记录
		$stepBox       = $statusBox.querySelectorAll('span')[1],
		// 开始/重新开始按钮
		$startBtn      = document.querySelector('.buttonBox').querySelectorAll('button')[0],
		// 暂停/进行按钮
		$stopBtn       = document.querySelector('.buttonBox').querySelectorAll('button')[1],
		// 上传新图片按钮
		$fileBtn       = document.getElementById('upload'),
		// 难易成度的选择
		$difficultyBtn = document.getElementById('difficulty'),
		// 遮罩层
		$maskBox       = document.querySelector('.maskBox'),
		// 完成层
		$finishBox     = document.querySelector('.finishBox'),
		// 完成层的所用时间
		$finishTimeBox = $finishBox.querySelectorAll('span')[0],
		// 完成层的所用步数
		$finishStepBox = $finishBox.querySelectorAll('span')[1],
		// 完成层下的重新开始按钮
		$reStartBox    = $finishBox.querySelector('button');



	// 创建dom
	const createJigsawDom = {
		idData : [],
		count  : 0,
		// 设置拼图的顺序
		setIdData () {
			var currIdData = [];
			this.count = lineNum ** 2 - 1;

			for( let i = 1; i <= this.count; i++ ) {
				currIdData.push(i);
			}

			this.randomIdData(currIdData);
		},
		// 打乱id顺序
		randomIdData (currIdData) {
			let reverseAmount = 0; // 逆序和

			idData      = [];
			this.idData = currIdData;

			// 打乱id顺序
			this.idData.sort(function(){
				return Math.random() - 0.5;
			});

			// 计算逆序和
			for(let i = 0; i < this.count; i++) {
				for(let j = i+1; j < this.count; j++) {
					if( this.idData[i] > this.idData[j] ) {
						reverseAmount++;
					}
				}
			}
			
			// 逆序和是偶数，是可还原的拼图，
			if( reverseAmount % 2 === 0 ) {
				for( index in this.idData) {
					let i = Math.floor(index / lineNum);

					if( !idData[i] ) idData[i] = [];
					idData[i].push(this.idData[index]);
				}
				idData[lineNum - 1].push( this.count + 1 );
				idEmptyPos = this.count;
			} else {
				// 逆序各是奇数，是不可还原拼图
				this.randomIdData(currIdData);
			}
		},
		// 清空拼图数据
		emptyDom () {
			$jigsawBox.innerHTML = "";
		},
		// 创建DOM
		createDom () {
			let $currDomTem;
			// 清空拼图数据
			this.emptyDom();
			// 设置拼图的顺序
			this.setIdData();

			for( i in this.idData ) {
				$currDomTem                          = document.createElement('div');
				$currDomTem.className                = 'areaBlock area' + i;
				$currDomTem.style.width              = blockWidth + 'px';
				$currDomTem.style.height             = blockWidth + 'px';
				$currDomTem.style.left               = ( i % lineNum * ( blockWidth + 2 ) + 1) + 'px';
				$currDomTem.style.top                = ( parseInt( i / lineNum ) * ( blockWidth + 2 ) + 1) + 'px';
				$currDomTem.style.backgroundImage    = 'url(' + imgUrl + ')';
				$currDomTem.style.backgroundPosition = ((this.idData[i] - 1) % lineNum * -blockWidth ) + 'px ' + (parseInt( (this.idData[i] - 1) / lineNum ) * -blockWidth) + 'px';
				// $currDomTem.dataset.id = this.idData[i];
				// $currDomTem.innerHTML  = this.idData[i];
				$jigsawBox.appendChild($currDomTem);
			}

			// 设置预览的图片
			$previewImgBox.src = imgUrl;
		}
	}

	// 逻辑操作
	const logicOperate = {
		// 移动拼图
		moveJigsaw (x, y, moveX, moveY, type) {
			const nextIdPos = (moveX * lineNum) + moveY; // 要移动的元素

			// 交换元素
			[ idData[moveX][moveY], idData[x][y] ] = [ idData[x][y], idData[moveX][moveY] ];

			if ( type === 'up' || type === 'down' ) {
				// 上下移动只修改top
				$jigsawBox.getElementsByClassName('area' + nextIdPos)[0].style.top = (blockWidth + 2) * x + 1 + 'px';
			} else if ( type === 'left' || type === 'right' ) {
				// 左右移动只修改left
				$jigsawBox.getElementsByClassName('area' + nextIdPos)[0].style.left = (blockWidth + 2) * y + 1 + 'px';
			}

			// 修改移动元素新的位置标志
			$jigsawBox.getElementsByClassName('area' + nextIdPos)[0].className = 'areaBlock area' + idEmptyPos;
			// 移动元素的原位置为新的空位置
			idEmptyPos = nextIdPos;

			// 添加步数
			stepNumber++;
			$stepBox.innerHTML = stepNumber;

			// 判断是否完成
			logicOperate.judgeFinishStatus();
		},
		// 重新开始
		restart () {
			gameIng = true;

			// 重置时间
			timing.startSecond = 0;
			timing.startMinute = 0;
			clearTimeout(timing.timer);
			$timeBox.innerHTML = '0:00';
			timing.startTimer();

			// 重置步数
			stepNumber = 0;
			$stepBox.innerHTML = stepNumber;
			
			// 重置暂停按钮
			$stopBtn.innerHTML = '暂停';
			// 创建拼图元素
			createJigsawDom.createDom();

			// 添加拼图的移动数据
			operateEvent.bindingJigsawClickEvent();
		},
		// 判断完成状态
		judgeFinishStatus() {
			let isFinish = true, // 默认完成
				that = this;

			// 判断是否完成
			for ( var i = 0; i < lineNum; i++ ) {
				for ( var j = 0; j < lineNum; j++ ) {
					if ( idData[i][j] !== i * lineNum + j + 1 ) {
						isFinish = false;
						break;
					}
				}
				if ( !isFinish ) break;
			}

			if ( isFinish ) {
				setTimeout(function(){
					that.jigsawFinish();
				}, 0);
			}
		},
		// 完成
		jigsawFinish () {
			gameIng = false;
			clearTimeout(timing.timer);

			// 默认完成层及相关数据
			$maskBox.style.display   = 'block';
			$finishBox.style.display = 'block';
			$finishTimeBox.innerHTML = $timeBox.innerHTML;
			$finishStepBox.innerHTML = $stepBox.innerHTML;
		}
	}

	// 定时器
	const timing = {
		startSecond : 0, // 所有时间的秒
		startMinute : 0, // 所有时间的分
		timer       : null, // 定时器
		// 开始定时器
		startTimer () {
			const that = this;

			that.timer = setTimeout(function(){
				that.startSecond += 1;
				if ( that.startSecond >= 60 ) {
					that.startSecond = 0;
					that.startMinute = 1;
				}

				$timeBox.innerHTML = that.startMinute + ':' + ( '0' + that.startSecond ).substr(-2);
				that.startTimer();
			}, 1000);
		}
	}

	// 使用事件
	const operateEvent = {
		init () {
			let type 		= navigator.userAgent.match(/.*Mobile.*/) ? "mobile" : "pc",
				clickEvent  = type === 'mobile' ? 'touchend' : 'click';

			if ( type === 'pc' ) {
				// 鼠标按钮上下左右移动
				document.addEventListener('keyup', this.clavierDirectionEvent, true);
			}

			// 开始事件
			$startBtn.addEventListener(clickEvent, this.startEvent, true);
			// 暂停/进行事件
			$stopBtn.addEventListener(clickEvent, this.stopEvent, true);

			// 完成后的重新开始事件
			$reStartBox.addEventListener(clickEvent, this.reStartEvent, true);

			// 上传文件事件
			$fileBtn.addEventListener('change', this.uploadimageEvent, true);

			// 切换难易成度
			$difficultyBtn.addEventListener('change', this.difficultyEvent, true);

			// 拼图的点击移动事件
			this.bindingJigsawClickEvent();
		},
		// 绑定拼图点击移动事件
		bindingJigsawClickEvent () {
			this.$areaBlock = $jigsawBox.querySelectorAll('.areaBlock');

			for ( let i = 0; i < this.$areaBlock.length; i++ ) {
				this.$areaBlock[i].removeEventListener('click', this.jigsawClickEvent);
				this.$areaBlock[i].addEventListener('click', this.jigsawClickEvent, true);
			}

		},
		// 鼠标点击
		jigsawClickEvent (e) {
			let x = Math.floor( idEmptyPos / lineNum ),	// 当前空位置的x
				y = idEmptyPos % lineNum,					// 当前空位置的y
				index = parseInt(e.target.className.match(/(?:^| )area(\d+)(?:$| )/)[1]),
				moveX = Math.floor( index / lineNum ), 
				moveY = index % lineNum; 	

			if( !gameIng ) return;

			// 是否可以移动
			if ( moveX - x === 1 && moveY === y ) {

				logicOperate.moveJigsaw(x, y, moveX, moveY, 'down');
			} else if ( x - moveX === 1 && moveY === y ) {

				logicOperate.moveJigsaw(x, y, moveX, moveY, 'up');
			} else if ( moveY - y === 1 && moveX === x ) {

				logicOperate.moveJigsaw(x, y, moveX, moveY, 'left');
			} else if ( y - moveY === 1 && moveX === x ) {

				logicOperate.moveJigsaw(x, y, moveX, moveY, 'right');
			}
		},
		// 键盘按键（上、下、左、右）
		clavierDirectionEvent (e) {
			let x = Math.floor( idEmptyPos / lineNum ),	// 当前空位置的x
				y = idEmptyPos % lineNum,					// 当前空位置的y
				moveX, moveY; 						// 需要移动的元素位置

			if( !gameIng ) return;

			// 左
			if( e.keyCode === 37 ) {

				if( idData[x][y + 1] ) {
					moveX = x;
					moveY = y + 1;

					logicOperate.moveJigsaw(x, y, moveX, moveY, 'left');
				}
			}
			// 上 
			else if( e.keyCode === 38 ) {

				if( idData[x + 1] && idData[x + 1][y] ) {
					moveX = x + 1;
					moveY = y;

					logicOperate.moveJigsaw(x, y, moveX, moveY, 'up');
				}
			} 
			// 右
			else if( e.keyCode === 39 ) {

				if( idData[x][y - 1] ) {
					moveX = x;
					moveY = y - 1;
				
					logicOperate.moveJigsaw(x, y, moveX, moveY, 'right');
				}
			} 
			// 下
			else if( e.keyCode === 40 ) {

				if( idData[x - 1] && idData[x - 1][y] ) {

					moveX = x - 1;
					moveY = y;

					logicOperate.moveJigsaw(x, y, moveX, moveY, 'down');
				}
			}
		},
		// 开始按钮
		startEvent (e) {

			if ( $startBtn.innerHTML === '重新开始' ) {
				logicOperate.restart();
			} else {
				gameIng = true;
				timing.startTimer();
				$startBtn.innerHTML = '重新开始';
			}
		},
		// 暂停
		stopEvent (e) {
			if ( $startBtn.innerHTML === '开始' ) {
				return
			}

			if( $stopBtn.innerHTML === '暂停' ) {

				gameIng = false;
				clearTimeout(timing.timer);
				$stopBtn.innerHTML = '进行';
			} else {

				gameIng = true;
				timing.startTimer();
				$stopBtn.innerHTML = '暂停';
			}
		},
		// 成功后的重新开始, 
		reStartEvent () {
			// 关闭完成层
			$maskBox.style.display   = 'none';
			$finishBox.style.display = 'none';

			// 重置拼图数据
			logicOperate.restart();
		},
		// 上传图片事件
		uploadimageEvent (e) {
			let file = e.target.files[0],
				reads = new FileReader();

			console.log(e);

			if ( !file ) return;

			reads.onload = function () {
				let canvas = document.createElement('canvas'),
					ctx	   = canvas.getContext('2d'),
					picSrc = this.result,
					$pic   = new Image();

				// 裁剪成正方形区域，取中间部分
				$pic.src = picSrc;
				$pic.onload = function(){
					let [width, height] = [this.width, this.height],
						minLength = Math.min(width, height);

					canvas.width = minLength;
					canvas.height = minLength;
					
					if ( width > height ) {
						ctx.drawImage($pic, -(width - height) / 2, 0);
					} else {
						ctx.drawImage($pic, 0, -(height - width) / 2);
					}

					picSrc = canvas.toDataURL('image/jpeg');

					// 图片裁剪成功，重置开始
					imgUrl = picSrc;
					logicOperate.restart();

				}
			}
			reads.readAsDataURL(file);
		},
		// 切换难易成度事件
		difficultyEvent (e) {
			if ( e.target.checked ) {
				lineNum = 4;
			} else {
				lineNum = 3;
			}
			blockWidth = Math.floor( 300 / lineNum );
			
			$jigsawBox.style.width = (300 + lineNum * 2) + 'px';
			$jigsawBox.style.height = (300 + lineNum * 2) + 'px';

			logicOperate.restart();
		}
	}

	// 创建拼图数据
	createJigsawDom.createDom();

	// 添加相关事件
	operateEvent.init();

}(window, document));