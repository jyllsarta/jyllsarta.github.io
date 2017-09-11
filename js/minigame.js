/* ミニゲーム関連 */

// 三角の障害物はDOMツリーの更新を抑えるために要素を使いまわす
// enabledのときのみ描画し、新しく作る際にはenabledでないものを拾って移動させる
// enabled=falseになる瞬間にopacity:0になるように調整するのでenabled=falseのものの更新・描画は一切行わない

var mini_game_data={
	is_playing : false,
	ob_dom : $(".obstacle"),
	obstacles : [
	{
		id:0,
		enabled : false,
		x : 0,
		side : "bottom",
		size : 100,
	},
	{
		id:1,
		enabled : false,
		x : 0,
		side : "bottom",
		size : 150,
	},
	{
		id:2,
		enabled : false,
		x : 0,
		side : "bottom",
		size : 100,
	},
	{
		id:3,
		enabled : false,
		x : 0,
		side : "bottom",
		size : 100,
	},
	{
		id:4,
		enabled : false,
		x : 0,
		side : "bottom",
		size : 100,
	},
	{
		id:5,
		enabled : false,
		x : 0,
		side : "bottom",
		size : 100,
	},
	{
		id:6,
		enabled : false,
		x : 0,
		side : "bottom",
		size : 100,
	},
	{
		id:7,
		enabled : false,
		x : 0,
		side : "bottom",
		size : 100,
	},
	{
		id:8,
		enabled : false,
		x : 0,
		side : "bottom",
		size : 100,
	},
	{
		id:9,
		enabled : false,
		x : 0,
		side : "bottom",
		size : 100,
	},
	],
	character : {
		side : "bottom",
		y:0,
		vy:0,
		jumping_count:0,
	},
	speed : 5,
	frame : 0,
	score :0,
	disable_restart : false,
	iga_log : [],
}

function addObstacle(size,side="bottom"){
	for(var ob of mini_game_data.obstacles){
		if(!ob.enabled){
			ob.enabled=true
			ob.x = 1200
			ob.size = size
			ob.side = side
			mini_game_data.iga_log.push({frame:mini_game_data.frame, size:size})
			$(mini_game_data.ob_dom[ob.id])
			.css({
				top : 161-size,
				"border-width" : ("0 "+(size/2)+"px "+size+"px "+(size/2)+"px"),
				opacity : 1
			})
			return
		}
	}
	//log("障害物置きすぎ")
}

function removeObsoletedObstacle(){
	var ob_dom = mini_game_data.ob_dom
	for(var ob of mini_game_data.obstacles){
		//まだ有効で、画面端まで到達したオブジェクト
		if(ob.enabled && ob.x <= -200){
			ob.enabled = false
			$(ob_dom[ob.id])
			.css({
				opacity:0
			})
		}
	}
}
function drawObstacle(){
	for(var ob of mini_game_data.obstacles){
		if(ob.enabled){
			$(mini_game_data.ob_dom[ob.id]).css({
				translateX : ob.x
			})			
		}
	}	
}

//障害物流れる
function flowObstacle(){
	for(var ob of mini_game_data.obstacles){
		if(ob.enabled){
			ob.x -= mini_game_data.speed
		}
	}
}

//当たり判定計算
function checkHit(){
	for(var ob of mini_game_data.obstacles){
		if(!ob.enabled){
			continue 
		}

		if(isHit(ob)){
			gameOver()
		}
	}	
}

//当たってる?
function isHit(obstacle){
	var chara = mini_game_data.character
	//下から生えてる場合
	if(obstacle.side=="bottom"){
		//十分に近づいたら判定
		if(chara.y < obstacle.size && obstacle.x < obstacle.size/4 && obstacle.x > -obstacle.size/4){
			return true
		}
	}
	return false
}

function calcScore(frame){
	return frame
}

//報酬
function calcReward(frame){
	var reward = Math.floor(frame*frame / 50000)+1
	if(frame > 2000){
		reward += 50
	}
	if(frame > 3000){
		reward += 1000
	}
	if(frame > 4000){
		reward += 4000
	}
	return reward
}

//判定的なゲームオーバー処理
function gameOver(){
	log("しんだ")
	mini_game_data.score = calcScore(mini_game_data.frame)
	if(mini_game_data.score >save.minigame.igaiga){
		save.minigame.igaiga = mini_game_data.score
	}
	mini_game_data.is_playing = false
	$("#charagter_image").css({
		translateY:25,
		width : 60,
		height : 39,
	})
	.attr({
		src:"images/neko/minigame/siro_dead.png"
	})

	$("#buee").css({
		opacity:1,
		translateX:0,
		translateY:0,
	})
	.animate({
		opacity:0,
		translateX:5,
		translateY:-10,		
	},2000,"linear")
	.queue(function(){
		//ぶえー消えたら再スタートを許す
		mini_game_data.disable_restart=false
		prepareGameStartAnimation()
		$(this).dequeue()
	})

	var reward = calcReward(mini_game_data.score)
	save.coin += reward
	save.total_coin_achieved += reward
	castMessage("イガイガヨケで"+reward+"枚コインを獲得した！")
	$("#earned_coin_value").text("+"+reward)

	$("#score_popup").css({
		opacity:1,
		translateY:10,
	})
	.delay(2000)
	.animate({
		opacity:0,
		translateY:0,
	})

	//エクストラダンジョン解放後はイガイガで粉出てくる
	if(save.dungeon_open[5] == 1){
		var reward_powder = Math.floor((reward+randInt(1,30)) / 5)
		save.powder +=  reward_powder
		$("#earned_powder_value").text("+"+reward_powder)
		castMessage("妖精の鱗粉を"+reward_powder+"獲得した！")
		$("#score_popup_powder")
		.delay(100)
		.queue(function(){
			$(this).css({
				opacity:1,
				translateY:10,
			}).dequeue()	
		})
		.delay(2000)
		.animate({
			opacity:0,
			translateY:0,
		})		
	}


	mini_game_data.disable_restart=true


	resetMiniGame()
}

//はじめるボタンをおした時
function startMiniGame(){
	if(mini_game_data.disable_restart){
		return
	}
	mini_game_data.is_playing = true
	mini_game_data.score = 0
	mini_game_data.frame=0
	mini_game_data.iga_log = []
	jump()
	miniGameStartAnimation()
}


function jump(){
	//3段目以降はジャンプさせない
	if(mini_game_data.character.jumping_count >= 2){
		return
	}

	mini_game_data.character.vy=12
	mini_game_data.character.jumping_count++
}


function prepareGameStartAnimation(){
	$("#mini_game_title").css({
		opacity:1,
		translateY:0
	})
	$("#score_area").css({
		opacity:0.2,
		translateY:-5,
	})
	$("#charagter_image").css({
		translateY:0,
		width : 40,
		height : 60,
	})
	.attr({
		src:"images/neko/minigame/siro.png"
	})
	$("#character").css({
		translateY : 0,
	})

	$("#score_popup").css({
		opacity:0,
		translateY:0,
	})
}

function miniGameStartAnimation(){
	prepareGameStartAnimation()
	$("#mini_game_title").animate({
		opacity:0,
		translateY:-20
	},400,"linear")
	$("#score_area").animate({
		opacity:1,
		translateY:0,
	},400,"linear")

	updateMiniGameStartButton()

}

function drawMiniGamePlayer(){
	$("#character").css({
		translateY : -mini_game_data.character.y,
	})
}

//ミニゲームのボタン更新
function updateMiniGameStartButton(){
	if(mini_game_data.is_playing){
		$("#jump").text("ジャンプ")
	}
	else{
		$("#jump").text("はじめる")		
	}
}

function updateMiniGameCharacter(){
	var chara = mini_game_data.character
	chara.y += chara.vy
	if(chara.y <=0){
		chara.jumping_count=0
		chara.y = 0
	}
	chara.vy-=1

}

//障害物全削除
function flushObstacle(){
	for(var ob of mini_game_data.obstacles){
		ob.enabled = false
		ob.x = -300
		ob.side = "bottom"
		ob.size = 100
		$(mini_game_data.ob_dom[ob.id])
		.css({
			opacity:0
		})
	}
}

//決定ボタンの挙動
function proceedMiniGame(){
	//プレイ中でないなら「はじめる」ボタン
	if(!mini_game_data.is_playing){
		resetMiniGame()
		startMiniGame()
		return
	}
	//それ以外はジャンプボタン
	jump()
}

function updateHighScore(){
	$("#high_score").text(save.minigame.igaiga)
}

function resetMiniGame(){
	flushObstacle()
	updateMiniGameStartButton()
	updateHighScore()
}

function updateScore(){
	$("#score").text(mini_game_data.frame)
	if(mini_game_data.frame > save.minigame.igaiga){
		$("#high_score").text(mini_game_data.frame)
	}
}

//フレームごとにランダムでさんかくだしてく
function appearObstacle(){

	if(mini_game_data.frame==1){
		addObstacle(randInt(20,50))
	}

	//最初は適当
	if(mini_game_data.frame < 1000){
		if(mini_game_data.frame % 50 == 0 && randInt(1,3)==1){
			addObstacle(randInt(17,45))
		}
		return
	}

	if(mini_game_data.frame %1000 == 200){
		addObstacle(60 + mini_game_data.frame/200)
		return
	}

	//それ以降は適当に出す
	if(mini_game_data.frame%10 == 0 && randInt(1,10000) < mini_game_data.frame){
		if(!tooManyIgasPoped(mini_game_data.iga_log,mini_game_data.frame)){
			addObstacle(randInt(17,30+(mini_game_data.frame/150)) + (mini_game_data.frame/250))
		}
	}

}

//直近でイガを出しすぎて理不尽配置になっていないか
function tooManyIgasPoped(logdata,frame){
	var count = 0
	for(var l of logdata){
		//最近50フレームのイガなら
		if(frame - l.frame < 100){
			count++;
		}
	}
	//if(count>=5){
	//	log("だしすぎー")
	//}
	return count >= 5
}

function updateMiniGame(){
	//プレイしていないならやんない
	if(!mini_game_data.is_playing){
		return
	}
	flowObstacle()
	removeObsoletedObstacle()
	updateMiniGameCharacter()
	checkHit()

	appearObstacle()

	drawObstacle()
	drawMiniGamePlayer()
	updateScore()
	mini_game_data.frame++
}

//背景のコントラストと合わせてイガイガの色変更
function updateIgaBaseColor(stage_id,landscape_id){
	if(stage_id==4){
		var floor = save.current_floor + 143
		stage_id  = (Math.floor(floor / 10)) % 5
		landscape_id = (Math.floor(floor / 50)) % 3		
	}
	var iga_color = {
		0 : ["#444444","#46494c","#33302f"],
		1 : ["#768772","#768772","#444444"],
		2 : ["#444444","#777777","#444444"],
		3 : ["#676767","#656565","#656565"],
		4 : ["#444444","#444444","#444444"],
		5 : ["#888888","#444444","#444444"],
	}
	var color = iga_color[stage_id][landscape_id]
	$(".floor").css("background-color" , color)
	$(".ceiling").css("background-color" , color)
	$(".obstacle").css("border-color" , "transparent transparent "+color+" transparent")
}


function loop(){
	updateMiniGame()
	window.requestAnimationFrame(loop)
}
loop()

window.onkeydown=jump