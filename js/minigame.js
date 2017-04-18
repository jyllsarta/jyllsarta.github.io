/* ミニゲーム関連 */

// 三角の障害物はDOMツリーの更新を抑えるために要素を使いまわす
// enabledのときのみ描画し、新しく作る際にはenabledでないものを拾って移動させる
//enabled=falseになる瞬間にopacity:0になるように調整するのでenabled=falseのものの更新・描画は一切行わない

var mini_game_data={
	is_playing : true,
   ob_dom : $(".obstacle"),
	obstacles : [
	{
		id:0,
		enabled : true,
		x : 0,
		side : "bottom",
		size : 100,
	},
	{
		id:1,
		enabled : true,
		x : 100,
		side : "bottom",
		size : 150,
	},
	{
		id:2,
		enabled : true,
		x : 100,
		side : "top",
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

	},
	speed : 5,

}

//
function addObstacle(size,side="bottom"){
	for(ob of mini_game_data.obstacles){
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
	for(ob of mini_game_data.obstacles){
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
function drawObstacles(){
	for(ob of mini_game_data.obstacles){
		if(ob.enabled){
			$(mini_game_data.ob_dom[ob.id]).css({
				translateX : ob.x
			})			
		}
	}	
}

//障害物流れる
function flowObstacle(){
	for(ob of mini_game_data.obstacles){
		if(ob.enabled){
			ob.x -= mini_game_data.speed
		}
	}
}

function updateMiniGame(){
	//プレイしていないならやんない
	if(!mini_game_data.is_playing){
		return
	}
	flowObstacle()
	drawObstacles()
	removeObsoletedObstacle()
}


function loop(){
	updateMiniGame()
	window.requestAnimationFrame(loop)
}
loop()