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
	},
	speed : 5,
	frame : 0,
	score :0,
	disable_restart : false,
}

function addObstacle(size,side="bottom"){
	for(var ob of mini_game_data.obstacles){
		if(!ob.enabled){
			ob.enabled=true
			ob.x = 1200
			ob.size = size
			ob.side = side
			$(mini_game_data.ob_dom[ob.id])
			.css({
				top : 160-size,
				"border-width" : ("0 "+(size/2)+"px "+size+"px "+(size/2)+"px"),
				opacity : 1
			})
			return
		}
	}
	log("障害物置きすぎ")
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

//判定的なゲームオーバー処理
function gameOver(){
	log("しんだ")
	mini_game_data.score = calcScore(mini_game_data.frame)
	log(mini_game_data.score)
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
}

//フレームごとにランダムでさんかくだしてく
function appearObstacle(){
	//最初は適当
	if(mini_game_data.frame < 1000){
		if(mini_game_data.frame % 50 == 0 && randInt(1,3)==1){
			addObstacle(randInt(20,30))
		}
		return
	}

	if(mini_game_data.frame %1000 == 200){
		addObstacle(60 + mini_game_data.frame/200)
		return
	}

	//それ以降は適当に出す
	if(mini_game_data.frame%10 == 0 && randInt(1,10000) < mini_game_data.frame){
		addObstacle(randInt(0,30) + (mini_game_data.frame/100))
	}

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


function loop(){
	updateMiniGame()
	window.requestAnimationFrame(loop)
}
loop()