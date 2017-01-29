/*******************************************/
/* ゲームの状態 */
/*******************************************/
var data = {
	frame : 0,
	game_mode : "",
	siro : {
		x : 440,
		vx : 0
	},
	kuro : {
		x : 510,
		vx : 0
	}
}

/*******************************************/
/* 定数 */
/*******************************************/

//ウィンドウ読み込み時のゲームモード (リリース時titleにする)
var FIRST_GAME_MODE = "main"

//ログ保存件数
var MAX_MESSAGE_ITEM = 10

//メインループの更新間隔(ミリ秒)
var LOOP_FREQUENCY = 50

/*******************************************/
/* ユーティリティ・ヘルパー */
/*******************************************/

//ログを吐く
function log(o){
	console.log(o)
}

//ランダム
function randInt(min, max) {
	return Math.floor( Math.random() * (max - min + 1) ) + min;
}
/*******************************************/
/* 初期化系 */
/*******************************************/

function init(){
	changeGameMode(FIRST_GAME_MODE)
	castMessage("ここにログが流れます")
	castMessage("initされましたよん")
}

/*******************************************/
/* ロジック */
/*******************************************/

//メインループ(フレームごとに更新する項目)
function mainLoop(){
	loiteringSiro()
	loiteringKuro()
	data.frame += 1
}

//1秒ごとの更新で十分な項目
function mainLoop_1sec(){
	updateClock()
	updateNextEventTimer()

	//次イベントまでの時刻が0 == 次のイベントの時間になったなら
	if (getNextEventLastTime() == 0){
		event()
	}
}

//ゲームモードをmodeに変更
function changeGameMode(mode){
	//logicを更新
	data.game_mode=mode

	//viewを更新
	$("#title").addClass("hidden")
	$("#stage").addClass("hidden")
	$("#main").addClass("hidden")
	$("#battle").addClass("hidden")
	$("#"+mode).removeClass("hidden")
}

//画面内のログ表示エリアにデータを吐く
function castMessage(message){
	$("#message_logs").append('<li class="log">'+message+'</li>');
	if ($("#message_logs .log").length > MAX_MESSAGE_ITEM){
		$("#message_logs .log:first-child").remove()
	}
}

//しろがゆらゆら移動
function  loiteringSiro(){

	data.siro.x += data.siro.vx
	$("#character_siro").css("left",data.siro.x)

	//毎フレーム速度を更新するとカタカタ震えるだけになるので
	//10フレームに1回のみ更新する
	if (data.frame % 10 != 0){
		return
	}

	//[-0.25,0.25]
	var delta = (Math.random() -0.5)/2
	data.siro.vx += delta

	//両端に寄り過ぎてるときは逆向きに力を加える
	if (data.siro.x < 400 && data.siro.vx < 0){
		data.siro.vx += 0.2
	}
	if (data.siro.x > 800 && data.siro.vx > 0){
		data.siro.vx -= 0.2
	}

	if (data.siro.vx > 0){
		$("#character_siro").addClass("flip")
	}
	else{
		$("#character_siro").removeClass("flip")
	}
}

//くろがゆらゆら移動
function  loiteringKuro(){

	data.kuro.x += data.kuro.vx
	$("#character_kuro").css("left",data.kuro.x)

	//毎フレーム速度を更新するとカタカタ震えるだけになるので
	//10フレームに1回のみ更新する
	if (data.frame % 10 != 0){
		return
	}

	//[-0.25,0.25]
	var delta = (Math.random() -0.5)/2
	data.kuro.vx += delta/2

	//両端に寄り過ぎてるときは逆向きに力を加える
	if (data.kuro.x < 400 && data.kuro.vx < 0){
		data.kuro.vx += 0.2
	}
	if (data.kuro.x > 800 && data.kuro.vx > 0){
		data.kuro.vx -= 0.2
	}

	if (data.kuro.vx > 0){
		$("#character_kuro").addClass("flip")
	}
	else{
		$("#character_kuro").removeClass("flip")
	}
	
}

//時計を更新
function updateClock(){
	var now = new Date()
	$("#month").text(now.getMonth()+1)
	$("#day").text(now.getDate())
	$("#hour").text(now.getHours())
	$("#minute").text(now.getMinutes())
	$("#second").text(now.getSeconds())
}

//次のイベントまでの残り時間を返す
function getNextEventLastTime(){
	var now = new Date()

	// 5分刻みで次のイベントの時刻を返す
	var getNextEventMinute = (x) => {return (x - x % 5 + 5)}

	//あと○分
	var last_minutes = getNextEventMinute(now.getMinutes())-now.getMinutes() - 1

	//あと○秒
	var last_seconds = 60 - now.getSeconds()

	var sec = last_minutes*60 + last_seconds
	return sec
}

//次のイベントまでの時刻を表示しているところを更新
function updateNextEventTimer(){
	var sec = getNextEventLastTime()
	$("#next_event_sec").text(sec)
}

//イベントを発生させる
function event(){
	var event_type = randInt(1,3)
	switch(event_type){
		case 1:
			castMessage("アイテムを拾ったことにします")
			break
		case 2:
			castMessage("階段を降りたことにします")
			break
		case 3:
			castMessage("バトルが発生したことにします")
			break
		default:
			castMessage("これはでないはずなので気にしない")
			break
	}
}

/*******************************************/
/* イベントハンドラ */
/*******************************************/

//タイトルのクリックでステージ画面に遷移
$("#title").click(function(){
	changeGameMode("stage");
});

//ステージ画面のクリックでメイン画面に遷移
$("#stage").click(function(){
	changeGameMode("main");
});


/*******************************************/
/* 初期化とメインループ実行 */
/*******************************************/

$(document).ready(function(){
	init();
})
setInterval(mainLoop,LOOP_FREQUENCY);
setInterval(mainLoop_1sec,1000);








