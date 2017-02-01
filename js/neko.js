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
	},
	item_data:[
	{
		id:0,
		name:"空の剣",
		rarity:1,
		str:255,
		def:200,
		dex:300,
		agi:-255,
		pow:1000,
		caption:"誰も掴むことのできない、実体のない剣。"
	}
	]

}

var save = {
	equipment :{
		siro:{

		},
		kuro:{

		}
	},
	items:[]
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

//アイテムリストCSVの相対位置
var ITEM_LIST_LOCATION = "etc/itemlist.csv"

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

	loadItemList()

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

	//次イベント時刻がリセットされたら
	if (getNextEventLastTime() ==300){
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

//アイテムリストをcsvファイルから読み込む
function loadItemList(){
	$(function() {
		$.ajax({
			beforeSend: function(xhr){
				xhr.overrideMimeType('text/html;charset=Shift_JIS');
			},
			type: "GET",
			url: ITEM_LIST_LOCATION,
			timeout: 1000
		})
		.done(function(response, textStatus, jqXHR) {
			loadCSV(response)
			castMessage("CSVのロードに成功したよ！")
		})
		.fail(function(jqXHR, textStatus, errorThrown ) {
			castMessage("CSVのロードだめー(chromeのローカル環境を疑ってね)")
		});
	});
}

//文字列化したcsvをパースしてデータ内に収める
function loadCSV(csvtext){
	var lines = csvtext.split("\n")

	//最初の一行を見出しとして、アイテムデータのプロパティとする
	var csv_schema = lines.shift().split(",")

	//行ごとにデータを格納
	for (line of lines){
		var params = line.split(",")
		//CSVの最初のカラムをIDとする
		var item_id = params[0]

		//data.item_dataに対して
		//key : item_id
		//value : 残りのパラメータを見出し名をプロパティ名にしたobject
		//で格納する
		data.item_data[item_id]={}
		for(var i=1;i<csv_schema.length;++i){
			data.item_data[item_id][csv_schema[i]] = params[i]
		}
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
		spriteSlidein("item")
		castMessage("アイテムを拾いました！")
		break
		case 2:
		spriteSlidein("artifact")
		castMessage("階段を降りた！")
		break
		case 3:
		spriteSlidein("battle")
		castMessage("バトルが発生した！")
		break
		default:
		castMessage("これはでないはずなので気にしない")
		break
	}
}

//対応したスプライトがスライドインする
//imagename : image/neko/spriteにおいてあるファイル名
function spriteSlidein(imagename){
	$("#sprite_image")
	.attr("src","images/neko/sprite/"+imagename+".png")
	.removeClass("hidden")
	.animate({
		opacity:1,
		top:"120px"
	}, 500, "swing")
	.delay(3000)
	.animate({
		opacity	:0,
		top:"110px",
	},200,"swing")
	.queue(function () {
		$(this).addClass	("hidden").dequeue();
	})
}


/*******************************************/
/* イベントハンドラ */
/*******************************************/

//タイトルのクリックでステージ画面に遷移
$("#title").click(function(){
	changeGameMode("stage")
})

//ステージ画面のクリックでメイン画面に遷移
$("#stage").click(function(){
	changeGameMode("main")
})

//スプライト画像はクリックされたら消す
$("#sprite_image").click(function(){
	$("#sprite_image").addClass("hidden")
})


/*******************************************/
/* 初期化とメインループ実行 */
/*******************************************/

$(document).ready(function(){
	init();
})
setInterval(mainLoop,LOOP_FREQUENCY);
setInterval(mainLoop_1sec,1000);








