
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

//現在時刻をhh:mm:ddの形式の文字列で返す
function getCurrentTimeString(offset=0){
	var date = new Date().getTime() - offset*1000
	var d = new Date()
	d.setTime(date)
	var time = d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0"+d.getSeconds()).slice(-2)
	return time
}

//ソート(qiitaからコピペ)
//data : ソートしたい配列
//key : data内オブジェクトのソートキー
function object_array_sort(data,key){
	data = data.sort(function(a, b){
		var x = a[key];
		var y = b[key];
		if (x > y) return -1;
		if (x < y) return 1;
		return 0;
	});
	return data
}


/*******************************************/
/* 初期化系 */
/*******************************************/

function init(){
	changeGameMode(FIRST_GAME_MODE)
	loadItemList()
	load()
	initView()
}

//画像ロードで恥を晒さない
$(window).load(function(){
	$("#loading_splash").delay(1000).queue(function(){$(this).remove().dequeue()})
	$("#game_window").delay(1000).queue(function(){$(this).removeClass("none").dequeue()})

	castMessage("ロード全部終わり")
})

/*******************************************/
/* ロジック */
/*******************************************/

//メインループ(フレームごとに更新する項目)
function mainLoop(){
	//セーブデータ読み込み前は処理をしない
	if(save===undefined){
		return
	}
	loiteringSiro()
	loiteringKuro()
	data.frame += 1

	//最終ログイン後のイベント再生
	playExtraEvent()
}

//1秒ごとの更新で十分な項目
function mainLoop_1sec(){

	//プレイ時間をインクリメント
	save.playtime++


	//アイテムデータ読み込み前にlast_loginが更新されると積めなくなる
	if(data.is_item_data_ready){
		//スリープから復帰していきなり1secが発火する可能性があるので更新
		if(!save.rest_now){
			//休憩中は不在時イベント処理を行わない
			addExtraEventTime(calcSecondsPassedFromLastLogin())
		}
		//最終ログイン時刻を更新
		save.last_login = new Date().getTime()
	}

	//生きてて休憩中じゃないならイベントタイマーを減らす
	if(isCharacterAlive() && !save.rest_now){
		//生きてる間はイベントタイマーが回る
		save.next_event_timer --
		if(save.next_event_timer <= 0){
			//アイテムデータ読み込みが出来ている場合のみ処理
			if(data.is_item_data_ready){
				save.next_event_timer = getEventInterval()
				event()
				return
			}
		}
	}
	else{
		//死んでたらリザレクトタイマーが回る
		save.auto_ressurect_timer --

		//死んでるときは100秒ごとにセーブ
		if(save.auto_ressurect_timer % 100 == 0){
			makesave()
		}

		if(save.auto_ressurect_timer == 0){
			ressurect()
		}
		updateAutoRessurectionCount()
	}
	updateClock()
	updateNextEventTimer()
	scrollBackgroundImage()
	updatePlaytimeArea()
	updateNextFreeGachaTime()
	updateMenuFreeSpinAvailable()
	updateTimeRemainAreaShowState()


	//背景をスクロールするのはオプションが指定されている場合かつ休憩中でない場合のみ
	if(save.options.enable_scroll_background && !save.rest_now){
		updateBackgroundImagePosition()
	}

	//200秒くらい遊んだところで通知要求を投げる
	if(save.playtime == 200){
		showTutorial("notify")
		promise()
	}

	checkJihou()
	checkFreeSpinNotification()
	updateShopButtonShowState()
	updateLoiteringCharactersState()

}

//休憩モードの切替
function toggleRestMode(){

	if(!save.tutorial.rest){
		showTutorial("rest")
	}

	save.rest_now = !save.rest_now
	updateRestMode()
}

//ゲームモードをmodeに変更
function changeGameMode(mode){
	//logicを更新
	data.game_mode = mode
	updateGameModeTo(mode)
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
			timeout: 10000
		})
		.done(function(response, textStatus, jqXHR) {
			loadCSV(response)
			data.is_item_data_ready = true
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

//スクリーンショットを撮って別タブで開く
function takeScreenshot(){
	removeOldLog()
	html2canvas($("#game_window"),{
		proxy:"",
		onrendered: function(canvas) {
			window.open( canvas.toDataURL("image/png"))
		}
	})
}

//イベント間隔
function getEventFreq(){

	if(data.__debughypereventdashmode){
		return 1
	}

	//実績のクリア数だけイベント間隔を減らす
	var reduced = save.achievement_clear.reduce((x,y)=>x+y)

	return DEFAULT_EVENT_FREQ - reduced
}

//前回イベント発生時刻からの経過時間を計算
function calcSecondsPassedFromLastLogin(){
	//初期セーブの場合特になし
	if(save.last_login === null){
		return 0
	}

	var time_passed = Math.floor((new Date().getTime() - save.last_login)/1000)

	//40秒以下なら無視
	if(time_passed < 40){
		return 0
	}
	return time_passed
}

function addExtraEventTime(seconds){
	//イベント加速秒数を積む
	save.extra_event_time_remain += seconds
	//一日ぶん以上は再生しない
	save.extra_event_time_remain = Math.min(save.extra_event_time_remain,86400)
}

function checkJihou(){

	if(!save.notify.jihou){
		return
	}

	//毎時の通知
	if(new Date().getMinutes() == 0 && new Date().getSeconds() == 0){
		var title =  new Date().getHours() + "時ですよー！"
		notify(title=title,body=jiho_data[new Date().getHours()],icon="jiho") 
	}
}

function checkFreeSpinNotification(){
	if(!save.notify.onFreeSpin){
		return
	}
	var current = new Date().getTime()
	var last = save.free_spin_last_take
	//経過時刻差秒がフリーおみくじインターバル(分)*60=秒にちょうど一致したら通知を行う
	if( Math.floor((current-last)/1000) == FREE_GACHA_INTERVAL*60){
		notify(title="フリーおみくじが引けます",body="引いて引いてー！",icon="omikuji") 
	}

}


/*******************************************/
/* デバッグ用 */
/*******************************************/

//アイテムいっぱい取得
function __debugAquireItemIppai(){
	var prev_mode = data.__debughypereventdashmode
	data.__debughypereventdashmode = true
	for(var i=0;i<500;++i){
		var rand = randInt(0,data.item_data.length-1)
		aquireItem(rand)
	}
	//viewの反映
	prepareEquipMenu()
	data.__debughypereventdashmode = prev_mode
}

//現在の階層 or 指定したランクに合わせた武器をいっぱい取得
function __debugAquireItemExcursion(rank){
	var prev_mode = data.__debughypereventdashmode
	data.__debughypereventdashmode = true
	if(!rank){
		rank = getCurrentEnemyRank()
	}
	for(var i=0;i<100;++i){
		aquireItem(rank)
	}
	prepareEquipMenu()
	data.__debughypereventdashmode = prev_mode
}

//ダンジョンフルオープン
function __debugDungeonFullOpen(){
	for(var i=0;i<dungeon_data.length;++i){
		save.dungeon_open[i] = 1
		save.dungeon_process[i] = dungeon_data[i].depth
	}
	updateOmakeButtonShowState()
	updateEpilogueButtonShowState()
	prepareDungeonList()
}

//バランス調整用光速イベントモード
//オート復活・イベント2秒おき
//スプライトの発生を抑制
function __debugHyperEventDashMode(){
	AUTO_RESSURECT_TIME= 1000
	data.__debughypereventdashmode = true
	save.next_event_timer = 1
	save.auto_ressurect_timer = 1000
	save.options.enable_event_animation = false
}

//光速イベントモードでも足りないあなたのために120イベント実施
function __debugTake120Events(){
	for(var i=0;i<120;++i){
		event()
	}
}

/*******************************************/
/* セーブ・ロード */
/*******************************************/

var Base64 = {
	encode: function(str) {
		return btoa(unescape(encodeURIComponent(str)));
	},
	decode: function(str) {
		return decodeURIComponent(escape(atob(str)));
	}
};

//セーブデータの足りないパラメータを探す
function validateSave(savedata){
	for(var item in save){
		if(savedata[item] === undefined){
			savedata[item] = save[item]
			log(item+"がセーブデータになかったので"+save[item]+"にしました。")
		}
	}
	for(var item in save.status.siro){
		if(savedata.status.siro[item] === undefined){
			savedata.status.siro[item] = save.status.siro[item]
			log("save.status.siro."+item+"がセーブデータになかったので"+save.status.siro[item]+"にしました。")
		}
	}
	for(var item in save.status.kuro){
		if(savedata.status.kuro[item] === undefined){
			savedata.status.kuro[item] = save.status.kuro[item]
			log("save.status.kuro."+item+"がセーブデータになかったので"+save.status.kuro[item]+"にしました。")
		}
	}

	//エクストラダンジョンの開放状況をfix
	if(savedata.dungeon_process[4] > 9999 && !savedata.dungeon_open[5]){
		savedata.dungeon_open[5] = 1
		savedata.dungeon_process[5] = 1
		log("エクストラダンジョンをこっそり開放しました！")
	}

}

//セーブ
function makesave(){
	var savestring = JSON.stringify(save)
	var base64save = Base64.encode(savestring)

	//cookieは4000文字までなので
	//base64のデータを4000文字で切る
	var base64save_1 = base64save.slice(0,4000)
	var base64save_2 = base64save.slice(4000,8000)
	var base64save_3 = base64save.slice(8000,12000)

	$.cookie("savedata_v2_1", base64save_1, { expires: 10000 });
	$.cookie("savedata_v2_2", base64save_2, { expires: 10000 });
	$.cookie("savedata_v2_3", base64save_3, { expires: 10000 });

	saveAnimation()
}

//qiitaから拾ってきた適当な日付フォーマッタ
var dateFormat = {
	fmt : {
		"yyyy": function(date) { return date.getFullYear() + ''; },
		"MM": function(date) { return ('0' + (date.getMonth() + 1)).slice(-2); },
		"dd": function(date) { return ('0' + date.getDate()).slice(-2); },
		"hh": function(date) { return ('0' + date.getHours()).slice(-2); },
		"mm": function(date) { return ('0' + date.getMinutes()).slice(-2); },
		"ss": function(date) { return ('0' + date.getSeconds()).slice(-2); }
	},
	format:function dateFormat (date, format) {
		var result = format;
		for (var key in this.fmt)
			result = result.replace(key, this.fmt[key](date));
		return result;
	}
};

//ロード
function load(){
	var cookie_v1 = $.cookie("savedata")
	var cookie_v2_1 = $.cookie("savedata_v2_1")
	var cookie_v2_2 = $.cookie("savedata_v2_2")
	var cookie_v2_3 = $.cookie("savedata_v2_3")

	//まっさらな状態
	if(cookie_v2_1 === undefined && cookie_v1 === undefined){
		castMessage("セーブデータが見つかりませんでした！")
		return
	}

	//古いデータだけある場合
	if(cookie_v2_1 === undefined && cookie_v1 !== undefined){
		var savestring = Base64.decode(cookie_v1)
		var savedata = JSON.parse(savestring)
		validateSave(savedata)
		save = savedata
		castMessage("セーブデータ構造が古かったのでアップデートしました！")
		return	
	}

	var savestring = Base64.decode(cookie_v2_1+cookie_v2_2+cookie_v2_3)
	var savedata = JSON.parse(savestring)
	validateSave(savedata)
	save = savedata
	castMessage("セーブデータを読み込みました！")
	return	



}


/*******************************************/
/* メイン画面 */
/*******************************************/

//画面を1pxだけ右にスクロールさせる
function scrollBackgroundImage(){
	//死んでたら歩かない
	if(isCharacterAlive()){
		data.background_image_scroll_position ++	
	}
}

//背景画面をpositionの位置にする
function scrollBackgroundImageTo(position){
	data.background_image_scroll_position = position
}

 //現在のイベント更新間隔はいくら?
 function getEventInterval(){
 	return getEventFreq()
 }

//生きてるキャラは居る?
function isCharacterAlive(){
	return save.status.siro.hp > 0 || save.status.kuro.hp > 0
}

//イベントの抽選を行い、イベントIDを返す
function lotEvent(){

	//99Fのときは必ずボス戦を発生させる
	if(save.current_floor % 100 == 99 ){
		return 1 //1=階段
	}

	//アイテム、階段、バトル、宝箱、粉
	var events = [EVENT_FREQ_ITEM, EVENT_FREQ_STAIRS, EVENT_FREQ_BATTLE, EVENT_FREQ_ITEM_FLOOD, 0]

	//ランダムアイテムエリアに入ったらイベント抽選比率を変更
	if(getCurrentEnemyRank() >= data.item_data.length){
		events = [EVENT_FREQ_EXD_ITEM, EVENT_FREQ_EXD_STAIRS, EVENT_FREQ_EXD_BATTLE, EVENT_FREQ_EXD_ITEM_FLOOD, 0]
	}

	//エクストラダンジョンはまた別の比で抽選
	if(save.current_dungeon_id == 5){
		events = [EVENT_FREQ_EXTRA_ITEM, EVENT_FREQ_EXTRA_STAIRS, EVENT_FREQ_EXTRA_BATTLE, EVENT_FREQ_EXTRA_ITEM_FLOOD, EVENT_FREQ_EXTRA_POWDER]
	}

	var event_box = []
	for(var event_kind=0; event_kind<events.length;++event_kind){
		for(var i=0;i<events[event_kind];++i){
			event_box.push(event_kind)
		}
	}
	return event_box[randInt(0,event_box.length-1)]

}

//イベントを発生させる
function event(){
	//イベントの抽選を行う	
	var event_type = lotEvent()

	switch(event_type){
		case 0:
		eventItem()
		break
		case 1:
		eventStairs()
		break
		case 2:
		eventBattle()
		break
		case 3:
		eventItemFlood()
		break
		case 4:
		eventPowder()
		break
		default:
		castMessage("これはでないはずなので気にしない")
		break
	}
	//イベントごとにセーブしとく
	makesave()
}

//開いていない間に起こったイベントを再計算する
function playExtraEvent(){

	//アイテムデータ読み込みがまだなら処理しない
	if(!data.is_item_data_ready){
		return
	}

	//残り時間が40秒以下まで削れたらならおわり
	if(save.extra_event_time_remain <= 40){
		save.extra_event_time_remain = 0
		data.hyper_event_dash_mode = false
		return
	}

	data.hyper_event_dash_mode = true

	//生きてるならイベントを起こす
	if(isCharacterAlive()){
		save.extra_event_time_remain -= getEventFreq()
		save.extra_event_time_remain = Math.max(save.extra_event_time_remain,0)
		event()
	}
	//死んでるなら回復
	else{
		save.extra_event_time_remain -= AUTO_RESSURECT_TIME
		save.extra_event_time_remain = Math.max(save.extra_event_time_remain,0)
		ressurect()
	}

	if(save.extra_event_time_remain <= 0){
		initView()
		castMessage("************************************")
		castMessage("不在時のイベント再生を終了しました。")
		castMessage("************************************")
	}

	updateTimeRemainArea()

}

//ダンジョンIDごとに一番上のレイヤーでどんな加工をするかスイッチする
function getBackgroundImageOverlayType(dungeon_id){
	switch(dungeon_id){
		case 0:
		return "overlay"
		break
		case 1: //1と2は意図的に一緒にしてる
		case 2:
		return "screen"
		break
		case 3:
		return "normal"
		break
		default:
		return "screen"
		break
	}

}

/*******************************************/
/* イベント関係 */
/*******************************************/

//アイテムID : rank の武器の標準的な総パラメータを返す
function getStandardItemParameter(rank){
	//ランク40までの武器はブレ幅が大きすぎるので固定値
	if(rank < 40){
		return 70
	}
	return Math.floor(Math.pow(rank,1.8)/10)
}

//実装されているアイテムからランダムにひとつ、rank相当の強化を施したアイテムを獲得する
function aquireRandomItemRank(rank){

	//ランクには1~10のブレをもたせる
	rank += randInt(1,10)

	var target_power = getStandardItemParameter(rank)
	var aquired_item = randInt(0,data.item_data.length-1)
	var base_power = getStandardItemParameter(aquired_item)

	//そのランクでの標準の強さ * 1.1(1.1倍ぶんだけ余裕をちょっと持たせる)
	var build_rank = Math.floor(10* target_power *1.1 /  base_power)

	//該当アイテムが既にそれより強かったら何もしない
	if(save.item[aquired_item] > build_rank){
		castMessage(data.item_data[aquired_item].name+"はもう強いものを持ってるので捨てた...")
		return
	}
	//該当アイテムを取得
	save.item[aquired_item]  = build_rank
	castMessage(data.item_data[aquired_item].name+"+"+(build_rank-1)+"を拾った！")
}

//指定したアイテムIDのアイテムを取得
//実装しているぶんより大きなアイテムIDが指定された場合
//該当ランク相当に強化されたランダムアイテムを取得する
function aquireItem(item_id){

	//エクストラダンジョンは基準値の10%増し+120ランクの超強いアイテムを拾う
	if(save.current_dungeon_id == 5){
		aquireRandomItemRank(item_id *1.1 +120 )
		return
	}

	//実装アイテム以上に強化されたアイテムIDを指定された場合
	if(item_id >= data.item_data.length){
		aquireRandomItemRank(item_id)
		return
	}

	//存在するアイテムIDを指定された場合
	var before =  (save.item[item_id] || 0)
	var after = before
	if(before < MAX_EQUIP_BUILD){
		after++
	}
	save.item[item_id] = after

	var item_name = getRaritySymbol(data.item_data[item_id].rarity) + data.item_data[item_id].name

	//新規取得ならレベル1になっているはず
	if(save.item[item_id] == 1){
		castMessage(item_name + "を拾った!")
	}
	else if(before >= MAX_EQUIP_BUILD){
		//もうすでに最大強化されてた場合
		save.coin ++
		save.total_coin_achieved ++
		castMessage(item_name + "を拾った!")
		castMessage("("+item_name+"は既に+10なのでコインに変換しました)")
	}
	else{
		castMessage(item_name+"を+"+(save.item[item_id]-1)+"に強化した!")		
	}
}


//item_idのアイテムをratget_rank相当に強化したものを取得
function aquireItemBuilded(item_id, target_rank){
	var target_power = getStandardItemParameter(target_rank)
	var aquired_item = item_id
	var base_power = getStandardItemParameter(aquired_item)

	//そのランクでの標準の強さ * 1.1(1.1倍ぶんだけ余裕をちょっと持たせる)
	var build_rank = Math.floor(10* target_power *1.1 /  base_power)

	//該当アイテムが既にそれより強かったら残念売却
	if(save.item[aquired_item] > build_rank){
		castMessage(data.item_data[aquired_item].name+"はもう強いものを持ってるので50コインで売却した...")
		save.coin+=50
		save.total_coin_achieved+=50
		return
	}
	//該当アイテムを取得
	save.item[aquired_item]  = build_rank
	castMessage(data.item_data[aquired_item].name+"+"+(build_rank-1)+"を引き当てた！")
}

//アイテムIDごとのレアリティの数値から出現比率を計算
function getBoxAmount(item_id){
	//大きすぎるアイテムIDには常にレジェ相当のサイズを返す
	if(item_id >= data.item_data.length){
		return LOT_FREQ_LEGENDARY
	}

	var rarity = data.item_data[item_id].rarity

	switch(rarity){
		case "0":
		return LOT_FREQ_NORMAL
		break
		case "1":
		return LOT_FREQ_RARE
		break
		case "2":
		return LOT_FREQ_EPIC
		break
		case "3":
		return LOT_FREQ_LEGENDARY
		break
		default:
		log("変なレアリティ")
		break
	}
}

//現在ダンジョンなどを考慮して何を拾うのか抽選を行う
//抽選結果のアイテムIDを返す
//flatten=trueで重み付けを行わない
function lotItem(flatten=false){
	var dungeon_index = dungeon_data[save.current_dungeon_id].start_ir
	//現在の階より深いところにいるときは階の深さに合わせた値にする
	var floor_up = Math.floor(Math.min(save.current_floor,dungeon_data[save.current_dungeon_id].depth)/8)
	var item_range = 10
	var min = dungeon_index+floor_up
	var max = min+item_range

	//アイテム抽選箱
	//こいつにレア度ごとに定めた個数アイテムをぶっこんで一個取り出す
	var lot_box = []
	for(var i=min;i<max;++i){
		var box_amount = getBoxAmount(i)
		if(flatten){
			//平滑化モードオンの場合どのアイテムも箱に一個しか入れない
			box_amount = 1
		}
		for(var j=0;j<box_amount;++j){
			lot_box.push(i)
		}
	}
	var elected_item = lot_box[randInt(0,lot_box.length-1)]
	return  elected_item
}

//全アイテムからレアリティの合致するアイテムをランダムに拾う
function getRandomItemID(rarity=0){
	var box =[]
	for(var i=0;i<data.item_data.length-1;++i){
		if(data.item_data[i].rarity==rarity){
			box.push(i)
		}
	}	
	return box[randInt(0,box.length-1)]
}

//レア度指定アイテムID抽出
//rarity : [0123] →対応するレア度
//IR:offset件目からlimit個のIDをチェックするが、
//offsetが実装されているアイテムID以上のものを指定されている場合、全アイテムから完全ランダムで選択を行う
function extractItemList(rarity=0,offset=50, limit=50){
	var box = []
	for(var i=offset;i<offset+limit;++i){

		//実装アイテムID以上ならレアリティの合致するランダムなアイテムをボックスに突っ込む
		//これ実はelse節:確率でboxに入れないかも/if節:確実に入れる なのでランダムアイテムエリア入りかけの部分で
		//抽選箱の公平性が大きく変わるけど気にしないことにした
		if(i > data.item_data.length-1){
			box.push(getRandomItemID(rarity=rarity))
		}
		//存在しているアイテムIDが指定された場合、レアリティが合致していれば箱に入れる
		else{
			var item_rarity =data.item_data[i % data.item_data.length].rarity
			if(rarity == item_rarity){
				box.push(i% data.item_data.length)
			}
		}
	}
	return box
}




//階段処理
function processStairs(){
	save.current_floor ++
	if(save.dungeon_process[save.current_dungeon_id] <= save.current_floor ){
		save.dungeon_process[save.current_dungeon_id] = save.current_floor
	}

	//50Fごとに landscapeidを0,1,2,0,1,2,...,0,1,2とループさせる
	save.current_landscape_id = (Math.floor(save.current_floor/50))%3

	updateCurrentEnemyRankArea()
	fadeOutAndFadeInStairs()
	updateCurrentFloorText()
}

//アイテム拾得イベントを起こす
function eventItem(){
	castMessage("◆何か落ちている！")
	showItemSprite()
	var item_id = lotItem()
	aquireItem(item_id)
}

//アイテム拾得イベントを起こす
function eventItemFlood(){
	castMessage("◆ラッキーだ！宝箱を見つけた！")
	showItemSprite()
	for(var i=0;i<5;++i){
		var item_id = lotItem()
		aquireItem(item_id)
	}
	save.total_treasurebox_open ++
}

//階段降りイベントを起こす
function eventStairs(){

	if(save.current_floor % 100 === 99){
		castMessage("◆◆◆"+(save.current_floor+1)+"Fのボスだ！◆◆◆")
		//ここでshowBossBattleSpriteを呼んでいたけど戦闘結果によって表示が変わるのでbattle.jsに移動

		//エクストラダンジョンならユニークボスが出る
		var unique_boss_id = null 
		if(save.current_dungeon_id==5 && save.current_floor < dungeon_data[5].depth){
			unique_boss_id = Math.floor(save.current_floor /100)
		}
		processBattle(bossBattle=true,unique_boss_id=unique_boss_id)
		//生き残っていれば次の階に進む
		if(isCharacterAlive()){
			save.current_floor ++
			if(save.dungeon_process[save.current_dungeon_id] < save.current_floor ){
				castMessage("ボスの初回討伐ボーナス！")
				var coinEarned = getCurrentEnemyRank()  + randInt(1,20)
				save.coin += coinEarned
				save.total_coin_achieved += coinEarned
				castMessage(coinEarned+"枚のコインを獲得！")
				castMessage("ボスの隠し持っていた宝箱を見つけた！")
				castMessage("(通常よりレア装備が出やすくなります)")
				for(var i=0;i<10;++i){
					var item_id = lotItem(flatten=true)
					aquireItem(item_id)
				}
				save.dungeon_process[save.current_dungeon_id] = save.current_floor
			}
			//次ダンジョン未開放かつその階層のラスボスを倒したら次ダンジョンを開放する
			if(!save.dungeon_open[save.current_dungeon_id+1] && save.current_floor >= dungeon_data[save.current_dungeon_id].depth && dungeon_data[save.current_dungeon_id+1]){
				save.dungeon_open[save.current_dungeon_id+1] = 1
				save.dungeon_process[save.current_dungeon_id+1] = 1

				if(save.notify.onClearDungeon){
					notify(title="次元層踏破！",body=(dungeon_data[save.current_dungeon_id].name+"を踏破した！"),icon="clear")
				}
			}
			updateCurrentFloorText()
			fadeOutAndFadeInStairs()
		}
	}
	else{
		showStairsSprite()
		processStairs()
		castMessage("◆階段を見つけた！")
	}
}

//バトルイベントを起こす
function eventBattle(){
	//ここでshowBattleSpriteを呼んでいたけど戦闘結果によって表示が変わるのでbattle.jsに移動
	castMessage("◆バトルが発生した！")
	// in battle.js
	processBattle()

	//しろことくろこの死亡判定
	updateLoiteringCharactersState()
}

//次イベントまでの時間をsecond秒短縮する
function reduceNextEventTime(second){
	save.next_event_timer = Math.max(save.next_event_timer - second,0)
	reduceNextEventTimerAnimation(second)
}

//復活ボタンを押した時の挙動
function ressurectClick(){
	//不在時イベント再生時に回復されるとちょっとお得なので潰す
	if(save.extra_event_time_remain >0){
		return
	}
	ressurect()
}

function ressurect(){
	ressurectAnimation()	
	castMessage("全回復！")
	save.auto_ressurect_timer = AUTO_RESSURECT_TIME
	save.status.siro.hp = save.status.siro.max_hp
	save.status.kuro.hp = save.status.kuro.max_hp

}

//エクストライベント
function eventPowder(){
	showPowderSprite()
	var gained = randInt(2,50)

	//10%の確率でどばっとあげる
	//分布を察されたくないので*9+7としておく
	//超運が良いと 500くらいかな
	if(randInt(1,10) == 10){
		gained *= 9
		gained += 7
	}


	save.powder += gained
	castMessage("野良妖精から鱗粉を"+gained+"もらった！")
}

/*******************************************/
/* 装備画面 */
/*******************************************/



//レアリティに応じた記号を返す
function getRaritySymbol(rarity){
	switch(rarity){
		case "0":
		return ""
		break
		case "1":
		return "*"
		break
		case "2":
		return "☆"
		break
		case "3":
		return "★"
		break
		default:
		log(rarity)
		log("なんか変なレアリティ投げられた.")
		break
	}
}

//レアリティに応じたクラス名を返す
function getRarityClassName(rarity){
	switch(rarity){
		case "0":
		return ""
		break
		case "1":
		return "rare"
		break
		case "2":
		return "epic"
		break
		case "3":
		return "legendary"
		break
		default:
		log(rarity)
		log("なんか変なレアリティ投げられた.")
		break
	}	
}

//プラス値、レア度を反映した装備のフルネームを返す
function makeFullEquipName(item_id){
		//アイテムがないなら？？？？？を表示させる
		if(!data.item_data[item_id]){
			return "？？？？？"
		}
		//まだもってないなら？？？？？を返す
		if(!save.item[item_id]){
			return "？？？？？"
		}
		//レアリティを反映
		var rarity = data.item_data[item_id].rarity
		var rarity_symbol = ""
		if(rarity){
			rarity_symbol = getRaritySymbol(rarity)
		}
		var item_lv = save.item[item_id]
		var plus_lv = item_lv==1?"":"+"+(item_lv-1)
		return rarity_symbol + data.item_data[item_id].name + plus_lv
	}

//プラス値を考慮して総パラメータを計算する
function calcTotalItemParam(item_id){
	var lv = save.item[item_id] || 0
	var {str, dex, def, agi} = data.item_data[item_id]
	var orig_params = [str, dex, def, agi].map(x=>parseInt(x,10))
	//プラス補正の反映
	var builded = orig_params.map(x=>Math.floor(x*(lv-1+10)/10))
	//全部足し合わせる
	var sum = builded.reduce((x,y)=>x+y)
	return sum
}

//プラス値を考慮して総パラメータを計算する
function calcItemATK(item_id){
	var lv = save.item[item_id] || 0
	var {str, dex, def, agi} = data.item_data[item_id]
	var orig_params = [str, dex, def, agi].map(x=>parseInt(x,10))
	//プラス補正の反映
	var builded = orig_params.map(x=>Math.floor(x*(lv-1+10)/10))

	//0->str, 1->dex
	var atk = (builded[0] + builded[1]) /2 + Math.min(builded[0],builded[1])
	return atk
}

//プラス値を考慮して総パラメータを計算する
function calcItemSLD(item_id){
	var lv = save.item[item_id] || 0
	var {str, dex, def, agi} = data.item_data[item_id]
	var orig_params = [str, dex, def, agi].map(x=>parseInt(x,10))
	//プラス補正の反映
	var builded = orig_params.map(x=>Math.floor(x*(lv-1+10)/10))

	//2->def, 3->agi
	var sld = (builded[2] + builded[3]) /2 + Math.min(builded[2],builded[3])
	return sld
}

//プラス値を考慮したパラメータを返す
function getBuildedParameter(item_id,paramName){
	var lv = save.item[item_id] || 0
	var param = Math.floor(parseInt(data.item_data[item_id][paramName]) * (lv-1+10)/10)
	return param
}

//item_idのparamnameをrankに強化した際のパラメータはいくつ
function getParameterBuildTo(item_id,paramName,rank){
	var lv = rank
	var param = Math.floor(parseInt(data.item_data[item_id][paramName]) * (lv-1+10)/10)
	return param
}

//該当キャラの{str,dex,def,agi}の合計値を計算
function getTotalParameter(charaname,paramName){
	var total = 10
	for(var equip of save.equip[charaname]){
		total += getBuildedParameter(equip,paramName)
	}
	return total
}

//該当キャラの<<<装備ドラフトにおいての>>>{str,dex,def,agi}の合計値を計算
function getTotalParameterEquipMenuDraft(charaname,paramName){
	var total = 10
	for(var equip of data.equipment_menu.editing_equip[charaname]){
		total += getBuildedParameter(equip,paramName)
	}
	return total
}

//charanameの<装備ドラフトにおいての>atkを返す
function calcAttackEquipMenuDraft(charaname){
	var str = getTotalParameterEquipMenuDraft(charaname,"str")	
	var dex = getTotalParameterEquipMenuDraft(charaname,"dex")
	return Math.floor((str + dex)/2 + Math.min(str,dex))
}
//charanameの<装備ドラフトにおいての>sldを返す
function calcDefenceEquipMenuDraft(charaname){
	var def = getTotalParameterEquipMenuDraft(charaname,"def")	
	var agi = getTotalParameterEquipMenuDraft(charaname,"agi")
	return Math.floor((def + agi)/2 + Math.min(def,agi))
}

//charanameのatkを返す
function calcAttack(charaname){
	var str = getTotalParameter(charaname,"str")	
	var dex = getTotalParameter(charaname,"dex")
	return Math.floor((str + dex)/2 + Math.min(str,dex))
}

//charanameのsldを返す
function calcDefence(charaname){
	var def = getTotalParameter(charaname,"def")	
	var agi = getTotalParameter(charaname,"agi")
	return Math.floor((def + agi)/2 + Math.min(def,agi))
}

//マウスオーバー時
function equipDetailMouseOver(domobject){
	var item_id = domobject.attributes.item_id.textContent
	updateEquipDetailAreaTo(item_id)
}

//ページャー前のページにもどる
function equipListPrevPage(amount=1){
	var after_page = Math.max(data.equipment_menu.current_page-amount,1)
	data.equipment_menu.current_page = after_page
	updatePagerCurrentPage()
	prepareEquipMenu()
}

//ページャー次のページに移動
function equipListNextPage(amount=1){
	var max_page =  findLatestEquipPageIndex()
	var after_page = Math.min(data.equipment_menu.current_page+amount,max_page)
	data.equipment_menu.current_page = after_page
	updatePagerCurrentPage()
	prepareEquipMenu()
}

//装備ボタンのページをpage目にする
function updateEquipPageTo(page){
	data.equipment_menu.current_page = page
	updatePagerCurrentPage()
}

//既に装備してたら装備できない
function isAlreadyEquipped(item_id){
	for(charaname in data.equipment_menu.editing_equip){
		for(var equip of data.equipment_menu.editing_equip[charaname]){
			if (equip == item_id){
				return true
			}
		}
	}
	return false
}

//装備を試みる
function equip(domobject){

	//はじめて装備したら外し方を解説
	if(save.tutorial["equip"] == false){
		showTutorial("equip")
	}

	var item_id = $(domobject).parent().attr("item_id")
	var current_chara_name = data.equipment_menu.current_character
	var equip_num = data.equipment_menu.editing_equip[current_chara_name].length
	//すでに4つ以上装備していたら装備できない
	if(equip_num >= 4){
		log("装備しすぎ")
		return
	}
	//既に誰かが装備していたら装備できない
	if(isAlreadyEquipped(item_id)){
		log("それもう装備してるわ")
		return
	}
	//未開放の装備は装備できない
	if(!save.item[item_id]){
		log("未開放の装備だよね")
		return
	}
	//装備処理
	data.equipment_menu.editing_equip[current_chara_name].push(item_id)
	data.equipment_menu.changed = true

	//viewの反映
	updateEquipBackButton()
	updateCurrentEquipListArea()
	updateCurrentTotalParameter()
	updateEquipList()
	updateEquipDetailATKDEF()
	updateEquipListParameterIndexCurrentEquipArea()
}

//クリック経由で装備を外す のdompbjectからスライスを取り出して処理
function unEquipClick(domobject){
	var item_id = domobject.attributes.item_id.textContent
	var current_chara_name = data.equipment_menu.current_character
	//アイテムIDが埋まってないやつは未装備の装備欄なので処理しない
	if(!item_id){
		return
	}
	for(var i=0;i<4;++i){
		if(item_id == data.equipment_menu.editing_equip[current_chara_name][i]){
			unEquip(i)
		}
	}
}

//装備を外す
function unEquip(slice=false){
	var current_chara_name = data.equipment_menu.current_character
	//既に装備してないなら何もしない
	if(data.equipment_menu.editing_equip[current_chara_name].length == 0){
		return
	}	
	if(slice===false){
		data.equipment_menu.editing_equip[current_chara_name].pop()
	}
	else{
		data.equipment_menu.editing_equip[current_chara_name].splice(slice,1)		
	}
	data.equipment_menu.changed = true
	//viewの反映
	updateEquipBackButton()
	updateCurrentEquipListArea()
	updateCurrentTotalParameter()
	updateEquipList()
	updateEquipDetailATKDEF()
	updateEquipListParameterIndexCurrentEquipArea()
}

function getItemIconNameFromTypeID(type_id){
	switch(type_id){
		case "0":
		return "unachieved"
		break
		case "1":
		return "weapon"
		break
		case "2":
		return "shield"
		break
		case "3":
		return "other"
		break
		case "4":
		return "meal"
		break
		default:
		log(type_id)
		log("なんか変なタイプ名投げられた.")
		break
	}
}

//装備キャラの切り替え
function toggleEquipEditCharacter(){
	var current_chara_name = data.equipment_menu.current_character
	//変更後キャラ名
	var after = current_chara_name=="siro"?"kuro":"siro"
	//データ上も反映
	data.equipment_menu.current_character = after	
	toggleEquipEditCharacterViewTo(after)
	updateCurrentEquipListArea()
	updateCurrentTotalParameter()
	updateEquipList()
	updateEquipDetailATKDEF()
	updateEquipListParameterIndexCurrentEquipArea()
}

//現在の装備のページのインデックスを返す
function findLatestEquipPageIndex(){
	return Math.floor((save.item.length-1) / 10)+1
}

//クリック結果を受取り該当の装備内容で装備強化メニューを開く
function showEquipBuildMenu(domobject){
	var item_id = $(domobject).parent().attr("item_id")
	data.current_build_item_id = item_id
	showEquipBuildMenuView(item_id)
}


//強化コストを返す
function getBuildCost(item_id){
	var lv = save.item[item_id]
	if(!lv){
			//未開放装備開放コストは一律100
			return 100
		}
		var rarity = parseInt(data.item_data[item_id].rarity)
		var cost = (lv+2) * (rarity+1) + Math.floor(item_id /10)
		return cost
	}

//item_idの強化を試みる
function build(item_id){
	var cost = getBuildCost(item_id)
	if(cost > save.coin){
		log("お金が足りないよ")
		return
	}

	if(save.item[item_id] >= MAX_EQUIP_BUILD){
		log("すでに最大強化済だよ")
		return
	}

	save.coin -= cost
	save.item[item_id] = (save.item[item_id]||0) + 1
	prepareEquipBuildMenu(item_id)
	updateEquipListCoinAmount()
	updateEquipList()
	updateEquipDetailATKDEF()
	updateEquipDetailAreaTo(item_id)
	updateCurrentTotalParameter()
}

//強化を実行するボタンを押したときの挙動
function buildButtonHandle(){
	//ウィンドウを開くときに記憶しておいた「その時操作中のアイテムID」で強化を行う
	build(data.current_build_item_id) 
}


//装備を合計パラメータ順にソートして10個アイテムIDを返す
function getItemIDListOrderByTotalParameter(page){

	var power_list = []
	//IDとパラメータ合計値を持ったオブジェクトを作成
	for(var i=0;i<data.item_data.length;++i){
		if(save.item[i] > 0){
			power_list.push({id:i, power:calcTotalItemParam(i)})
		}
	}
	//今作ったオブジェクトをソート
	var sorted = object_array_sort(power_list,"power")

	//ソート済オブジェクトから指定された10個を抜き出して返す
	var sliced = sorted.splice((page-1)*10,10)

	var result = []
	for(var s of sliced){
		result.push(s.id)
	}
	return result

}

//ATK順にソートして10個アイテムIDを返す
function getItemIDListOrderByATK(page){
	var power_list = []
	//IDとパラメータ合計値を持ったオブジェクトを作成
	for(var i=0;i<data.item_data.length;++i){
		if(save.item[i] > 0){
			power_list.push({id:i, power:calcItemATK(i)})
		}
	}
	//今作ったオブジェクトをソート
	var sorted = object_array_sort(power_list,"power")

	//ソート済オブジェクトから指定された10個を抜き出して返す
	var sliced = sorted.splice((page-1)*10,10)

	var result = []
	for(var s of sliced){
		result.push(s.id)
	}
	return result
}

//ATK順にソートして10個アイテムIDを返す
function getItemIDListOrderBySLD(page){
	var power_list = []
	//IDとパラメータ合計値を持ったオブジェクトを作成
	for(var i=0;i<data.item_data.length;++i){
		if(save.item[i] > 0){
			power_list.push({id:i, power:calcItemSLD(i)})
		}
	}
	//今作ったオブジェクトをソート
	var sorted = object_array_sort(power_list,"power")

	//ソート済オブジェクトから指定された10個を抜き出して返す
	var sliced = sorted.splice((page-1)*10,10)

	var result = []
	for(var s of sliced){
		result.push(s.id)
	}
	return result
}


//装備をparam順にソートして10個アイテムIDを返す
//param : {str,dex,def,agi,total}
//page : 1,2,3, ... (1はトップ10、 3は21-30個目を返す)
function getItemIDListOrderBy(page, param){
	var compareFunction = null
	switch(param){
		case "total":
		compareFunction = calcTotalItemParam
		break	
		case "str":
		case "dex":
		case "def":
		case "agi":
			//比較用関数
			compareFunction = (x)=>getBuildedParameter(x,param)
			break
		}

		var power_list = []
	//IDとパラメータ合計値を持ったオブジェクトを作成
	for(var i=0;i<data.item_data.length;++i){
		if(save.item[i] > 0){
			power_list.push({id:i, power:compareFunction(i)})
		}
	}
	//今作ったオブジェクトをソート
	var sorted = object_array_sort(power_list,"power")

	//ソート済オブジェクトから指定された10個を抜き出して返す
	var sliced = sorted.splice((page-1)*10,10)

	var result = []
	for(var s of sliced){
		result.push(s.id)
	}
	return result

}

//ソート順を切り替える
function changeSortOrderTo(sort_id){
	data.equipment_menu.sort_order=sort_id
	updateSortOrderText()
	updateEquipList()
}

//これまで手に入れたなかで一番新しい武器のIRを返す
function getMaxItemRankPlayerGot(){
	var max = 0
	for(var i in save.item){
		if(parseInt(i) > 0){
			max = parseInt(i)
		}
	}
	return max
}

//指定武器の現在の強さと、指定ランクの該当武器の標準的な強さとの比を返す
function getEquipmentPowerRatio(item_id,rank,parameterName){
	//標準パラメータの4分の1
	var standard_parameter = getStandardItemParameter(rank) / 4
	var that_parameter = getBuildedParameter(item_id,parameterName)
	return that_parameter / standard_parameter
}

//現在のセーブデータにある装備を編集中ドラフトにコピーする
function copyCurrentEquipToDraft(){
	data.equipment_menu.changed = false
	data.equipment_menu.canceled = false
	data.equipment_menu.editing_equip.siro=[]
	data.equipment_menu.editing_equip.kuro=[]

	for(var i=0;i<save.equip.siro.length;++i){
		data.equipment_menu.editing_equip.siro[i] = save.equip.siro[i]
	}
	for(var i=0;i<save.equip.kuro.length;++i){
		data.equipment_menu.editing_equip.kuro[i] = save.equip.kuro[i]
	}
}

function completeEditEquip(){
	save.equip.siro=[]
	save.equip.kuro=[]

	for(var i=0;i<data.equipment_menu.editing_equip.siro.length;++i){
		save.equip.siro[i] = data.equipment_menu.editing_equip.siro[i]
	}
	for(var i=0;i<data.equipment_menu.editing_equip.kuro.length;++i){
		save.equip.kuro[i] = data.equipment_menu.editing_equip.kuro[i]
	}
	castMessage("装備を編集しました！")
}

//パラメータの比を取得
function getParameterDiffRatio(charactername="siro"){
	var max = 0
	var min = Infinity
	var params = ["str","dex","def","agi"]
	for(var param of params){
		if(getTotalParameter(charactername,param) >= max){
			max = getTotalParameter(charactername,param)
		}
		if(getTotalParameter(charactername,param) <= min){
			min = getTotalParameter(charactername,param)
		}
	}
	return max / min

}

//ピリカちゃん装備かどうか
//フレーバーかな前にピリカって書いてあればピリカ装備だよ
function isPirikaEquip(item_id){
	if(data.item_data[item_id].caption.match(/ピリカ/)){
		return true
	}
	if(data.item_data[item_id].name.match(/ピリカ/)){
		return true
	}
}

//文字列から漢字数をカウント
function countKanji(string){
	var count = 0
	for(var letter of string.split("")){
		if(letter.match(/[一-龠]/)){
			count ++
		}
	}
	return count
}

//文字列から非漢字文字数をカウント
function countNotKanji(string){
	var count = 0
	for(var letter of string.split("")){
		if(!letter.match(/[一-龠]/)){
			count ++
		}
	}
	return count
}


//ピリカちゃん装備の数を数える
function countPirikaWeaponEquipped(charactername="siro"){
	var count = 0
	for(var equip of save.equip[charactername]){
		if(isPirikaEquip(equip)){
			count ++
		}
	}
	return count
}

//漢字カウント
function countKanjiWeaponEquipped(charactername="siro"){
	var count = 0
	for(var equip of save.equip[charactername]){
			count += countKanji(data.item_data[equip].name)
	}
	return count
}

//非漢字文字の総数をカウント
function countNotKanjiStringsEquipped(charactername="siro"){
	var count = 0
	for(var equip of save.equip[charactername]){
			count += countNotKanji(data.item_data[equip].name)
	}
	return count
}

//指定レア度の武器装備数を数える
function countWeaponEquippedRarityIs(charactername="siro",rarity=0){
	var count = 0
	for(var equip of save.equip[charactername]){
		if(data.item_data[equip].rarity == rarity){
			count ++
		}
	}
	return count	
}

//指定武器種類の武器装備数を数える
function countWeaponEquippedCategoryIs(charactername="siro",category=1){
	var count = 0
	for(var equip of save.equip[charactername]){
		if(parseInt(data.item_data[equip].category) == category){
			count ++
		}
	}
	return count	
}

//指定レア度の武器装備数を数える
function countWeaponEquippedTotalRarity(charactername="siro"){
	var count = 0
	for(var equip of save.equip[charactername]){
		count += parseInt(data.item_data[equip].rarity)
	}
	return count	
}

function isCharacterEquipsNoDuplicateRarity(charactername="siro"){
	return (
		countWeaponEquippedRarityIs(charactername,0) <= 1 && 
		countWeaponEquippedRarityIs(charactername,1) <= 1 && 
		countWeaponEquippedRarityIs(charactername,2) <= 1 && 
		countWeaponEquippedRarityIs(charactername,3) <= 1
		)
}

function countCharacterEquipKindsOfRarity(charactername="siro"){
		return [
		countWeaponEquippedRarityIs(charactername,0) >= 1,
		countWeaponEquippedRarityIs(charactername,1) >= 1,
		countWeaponEquippedRarityIs(charactername,2) >= 1,
		countWeaponEquippedRarityIs(charactername,3) >= 1
		].filter(x=>x).length

}

//ティターニア戦限定、全9妖精のバフを同時チェック
function  getFailyBattleAllBuff(){
	//エクリテの<パラ均一バフ> 
	//(各々基礎パラの範囲が50%以内で発動)
	//ピリカの<自社商品宣伝> 
	//(誰かがピリカ装備を持てば発動)
	//ラストの<吸精霊力還元> 
	//(二人とも攻撃力400k達成で発動)
	//ミミカの<ひらがなバースト> 
	//(二人で非漢字文字計15文字で発動)
	//コレットの<苗木支援> 
	//(二人とも守備力400k達成で発動)
	//サクラの<カラフルブースト> 
	//(誰かが3色以上装備に所持で発動)
	//シールの<防壁増幅> 
	//(誰かがDEF500k達成で発動)
	//超然的<漢字爆発> 
	//(一人装備漢字含拾弐文字発動)
	//アリスの<低レア戦略> 
	//(★=3,✰=2,*=1として二人の合計が15以下で発動)

	var results =[0,0,0,0,0,0,0,0,0]

	//エクリテ・パラ均一バフ
	if(Math.abs(getParameterDiffRatio("siro")) <= 1.5  && Math.abs(getParameterDiffRatio("kuro")) <= 1.5){
		results[0] = 1
	}

	//ピリカ・自社商品宣伝
	if(countPirikaWeaponEquipped("siro") >= 1  || countPirikaWeaponEquipped("kuro") >= 1){
		results[1] = 1
	}

	//ラスト・吸精霊力還元
	if(calcAttack("siro") >= 400000 && calcAttack("kuro") >= 400000){
		results[2] = 1
	}

	//ミミカ・ひらがなバースト
	if(countNotKanjiStringsEquipped("siro") + countNotKanjiStringsEquipped("kuro") >= 15){
		results[3] = 1
	}

	//コレット・菓子要求
	if(countWeaponEquippedCategoryIs("siro",4) >=1 || countWeaponEquippedCategoryIs("kuro",4)>=1 ){
		results[4] = 1
	}

	//サクラ・カラフルブースト
	if(countCharacterEquipKindsOfRarity("siro") >= 3  || countCharacterEquipKindsOfRarity("kuro") >= 3){
		results[5] = 1
	}

	//シール・防壁増幅
	if(getTotalParameter("siro","def") >= 500000  || getTotalParameter("kuro","def") >= 500000){
		results[6] = 1
	}

	//チョウゼン・漢字爆発
	if(countKanjiWeaponEquipped("siro") >= 12  || countKanjiWeaponEquipped("kuro") >= 12){
		results[7] = 1
	}

	//アリス・低レア戦略
	if(countWeaponEquippedTotalRarity("siro") + countWeaponEquippedTotalRarity("kuro") <= 15){
		results[8] = 1
	}

	return results
}

/*******************************************/
/* ステータス画面 */
/*******************************************/


//発見アイテム数を返す
function getSumItemFounded(){
	var total = 0
	for(var i=0;i<data.item_data.length;++i){
		if(save.item[i] > 0){
			total ++
		}
	}
	return total
}

// +10まで強化したアイテム数を返す
function getSumItemFoundedFullBuilded(){
	var total = 0
	for(var i=0;i<data.item_data.length;++i){
		if(save.item[i] >= MAX_EQUIP_BUILD){
			total ++
		}
	}
	return total
}

//潜った最も深いところ
function getDeepestDepthCrawled(){
	var max = 0
	for(var dep of save.dungeon_process){
		if(dep > max){
			max = dep
		}
	}
	return max
}

//実績の進捗を返す
function getAchievementProgress(achievement_id){
	switch(achievement_id){
		case 0:
		return save.dungeon_process[0]
		break;
		case 1:
		return save.dungeon_process[1]
		break;
		case 2:
		return save.dungeon_process[2]
		break;
		case 3:
		return save.dungeon_process[3]
		break;
		case 4:
		return save.dungeon_process[4]
		break;
		case 5:
		return getSumItemFoundedFullBuilded()
		break;
		case 6:
		return save.total_death
		break;
		case 7:
		return save.total_2kill
		break;		
		case  8:
		return save.total_treasurebox_open
		break;		
		case 9:
			//プレイ秒 /60/60 → プレイ時間
			return Math.floor(save.playtime / 60 / 60) 
			break;		
		}
	}

//実績のクリア状況をデータ上に反映する
function checkAchievementCleared(){
	for(var i=0;i<10;++i){
		if(getAchievementProgress(i) >= achievement_data[i].max){
			save.achievement_clear[i] = 1
		}
	}
}

//実績のアイコンファイルと実績IDの対応
function getAchievementIconImageFileName(achievement_id){
	//実績ID[0-4]は未開放の場合表示させない
	if(!save.dungeon_open[achievement_id] && achievement_id < 5){
		return "images/neko/achievement/no.png"
	}
	return "images/neko/achievement/"+achievement_id+".png"

}

/*******************************************/
/* ダンジョン選択画面 */
/*******************************************/

//ステージの切り替え
function changeStageTo(stage_id,depth){
	save.current_dungeon_id = stage_id
	save.current_floor = depth
	if(stage_id == 5 && save.visited_extra_dungeon==false){
		save.visited_extra_dungeon = true
	}
	changeStageToView(stage_id,depth)
}

//クリックされたオブジェクトからステージIDを取り出して詳細画面を切り替える
function updateDungeonDetailClick(domobject){
	var stage_id = domobject.attributes.stage_id.textContent

	data.dungeon_select_menu.stage_id = stage_id
	data.dungeon_select_menu.depth = save.dungeon_process[stage_id]

	updateDungeonSelectFloorData()
	updateDungeonDetailTo(stage_id)
}

//ステージ切り替えボタンの挙動
function changeStageButton(){
	var stage_id = parseInt(data.dungeon_select_menu.stage_id)
	var depth = data.dungeon_select_menu.depth
	changeStageTo(stage_id,depth)
}

//深さを変えようとする
function changeDepth(difference){
	var target_dungeon_id = data.dungeon_select_menu.stage_id
	var current = data.dungeon_select_menu.depth
	var max = save.dungeon_process[target_dungeon_id]
	//1F以上現在攻略済階までが移動対象
	var after = Math.max(Math.min(current+difference,max),1)
	data.dungeon_select_menu.depth = after

	updateDungeonSelectFloorData()
}

/*******************************************/
/* ガチャ関連 */
/*******************************************/

//フリーおみくじができるか
function isFreeSpinAvailable(){
	var current = new Date().getTime()
	var last = save.free_spin_last_take
	//経過時刻差ミリ秒がフリーおみくじインターバル(分)を超えていれば引ける
	return (current-last)/1000/60 > FREE_GACHA_INTERVAL
}

//ガチャを回す処理
function spinGacha(times=1){

	//ガチャは連続で引けない
	if(data.disable_gacha_button){
		return
	}

	//フリースピンできて単発ならフリー枠で回す
	if(isFreeSpinAvailable() && times==1){
		save.free_spin_last_take = new Date().getTime()
		data.disable_gacha_button = true
		takeGacha(1)
		return
	}

	if(times * GACHA_COST > save.coin){
		log("予算オーバーだよ")
		return
	}

	save.coin -= times * GACHA_COST
	data.disable_gacha_button = true
	takeGacha(times)
	makesave()

}

//次のフリーおみくじまでの時刻を表示
function updateNextFreeGachaTime(){
	var current = new Date().getTime()
	var last = save.free_spin_last_take
	var diff_ms = FREE_GACHA_INTERVAL*1000*60 - (current-last)
	var diff_s = Math.max(Math.floor(diff_ms / 1000 % 60),0)
	var diff_m = Math.max(Math.floor(diff_ms /1000 / 60 % 60),0)
	var diff_h = Math.max(Math.floor(diff_ms /1000 / 60 /60),0)
	$("#next_free_gacha_time").text(diff_h+":"+diff_m+":"+diff_s)
}

//レアリティの抽選
function lotGachaRarity(){
	var rand = randInt(0,99)
	if(rand < 7){
		return 3
	}
	if(rand < 22){
		return 2
	}
	if(rand < 45){
		return 1
	}
	return 0
}



//times回ガチャ引いてアイテムを取得する処理
//コインの減算処理などはspin
function takeGacha(times=1){

	resetMikujiStick()
	takeGachaSprite()
	var aquiredItemList = []
	for(var i=0;i<times;++i){
		var rarity = lotGachaRarity()
		var rank = getMaxEnemyRank() * 1.25  +randInt(1,20)

		//エクストラダンジョンで引けるおみくじアイテムは弱い、そのへんのアイテム並み
		if(save.dungeon_open[5] == 1){
			rank = getMaxEnemyRank() +randInt(-200,250)
		}

		var baseItemId = getCurrentEnemyRank()
		var itemList = extractItemList(rarity,baseItemId,50)
		var aquiredItem = itemList[randInt(0,itemList.length-1)]
		aquiredItemList.push(aquiredItem)

		addMikujiStick(rarity=["n","r","e","l"][rarity])
		aquireItemBuilded(aquiredItem,rank)
	}
	showAquiredItemList(aquiredItemList)
	updateGachaMenu()
}


/*******************************************/
/* セーブ管理 */
/*******************************************/

function copySaveToClipBoard(){
	$("#save_data_area").val(getReversedSaveString())
	$("#save_data_area").select();
	document.execCommand("copy");
	showCopiedTicker()
}

//セーブデータ出力用の反転文字列を取得
function getReversedSaveString(){
	var savestring = JSON.stringify(save)
	var base64save = Base64.encode(savestring)
	//見栄えのために日付情報を埋め込んだる
	var dateInfo = "<"+dateFormat.format(new Date(), 'yyyy/MM/dd_hh:mm:ss')+">"
	return dateInfo + base64save.split("").reverse().join("")
}

function showImportSaveMenu(){
	var inputtedString = $("#save_read_area").val()
	var saveString = ""
	var raw_save =""

	//そもそも何も入力されてないならボタンは反応しない
	if(inputtedString.replace("\n","").replace(" ","") == ""){
		return
	}

	//変な文字列なら">"の検出、base64のデコード、JSONのパースの何処かで引っかかる
	try{
		saveString =  inputtedString.split(">")[1].replace("\n","").split("").reverse().join("")
		raw_save = Base64.decode(saveString)
		raw_save = JSON.parse(raw_save)
	}
	catch(e){
		showSaveDataLoadErrorPopup()
		return
	}

	//適当にlast_loginが中にあればまあ正しいセーブだろうと推測
	//なければエラー出す ... が last_loginの初期値はnullなのでそれだけは許容する
	if(raw_save.last_login!==null   && !raw_save.last_login){
		showSaveDataLoadErrorPopup()
		return
	}

	//last_loginがあるなら正しいセーブっぽいので確認ウィンドウを出す
	showSaveConfirmMenu(siro_lv=raw_save.status.siro.lv,kuro_lv=raw_save.status.kuro.lv,playtime=raw_save.playtime)

	//ロード候補に記録
	data.save_importing = raw_save
}

//セーブの読み込みを実際に行う
function importSave(){

	importSaveAnimation()	
	validateSave(data.save_importing)
	save = data.save_importing
}

/*******************************************/
/* 設定変更 */
/*******************************************/


function toggleEnableEventAnimationOption(){
	save.options.enable_event_animation = !save.options.enable_event_animation
	prepareOptionMenu()
}

function toggleEnableLoiteringOption(){
	save.options.enable_loitering = !save.options.enable_loitering
	prepareOptionMenu()
}

function toggleEnableScrollBackgroundOption(){
	save.options.enable_scroll_background = !save.options.enable_scroll_background
	prepareOptionMenu()
}

function toggleNotification(){
	save.notify.enabled = !save.notify.enabled
	prepareOptionMenu()
}

function toggleNotificationDeath(){
	save.notify.onDeath = !save.notify.onDeath
	prepareOptionMenu()
}

function toggleNotificationClear(){
	save.notify.onClearDungeon = !save.notify.onClearDungeon
	prepareOptionMenu()
}

function toggleNotificationFreeSpin(){
	save.notify.onFreeSpin = !save.notify.onFreeSpin
	prepareOptionMenu()
}

function toggleNotificationJihou(){
	save.notify.jihou = !save.notify.jihou
	prepareOptionMenu()
}


/*******************************************/
/* ショップ関連 */
/*******************************************/

//xorshiftのseededrandomのコピペ
var xors = {
	x: 123456789,
	y: 362436069,
	z: 521288629,
	w: 88675123
};

xors.rand = function() {
	var t = xors.x ^ (xors.x << 11);
	xors.x = xors.y;
	xors.y = xors.z;
	xors.z = xors.w;
	return xors.w = (xors.w^(xors.w>>>19))^(t^(t>>>8));
}

function setSeed(seed){
	xors.x = 123456789
	xors.y = 362436069
	xors.z =  521288629
	xors.w = seed 

	//初期値依存性を捨てるために10000回まわす
	for(var i=0;i<10000;++i){
		xors.rand()
	}
}

//setSeedでシード値を指定した乱数を[min,max]で整えて返す
function seededRandomInt(min,max){
	var rand = Math.abs(xors.rand())
	var INT_MAX = 2147483647
	var result = rand / (INT_MAX/(max+1))+min
	return Math.floor(result)
}



function isRecentlyOpenedShop(){
	var current = new Date()
	var last_time_opened = new Date(save.last_time_shop_open)

	//いま現在の日付と最終メニュー開閉日時が一致するなら今日は引いている
	if(last_time_opened.getDay() == current.getDay()){
		return true
	}
	//それ以外なら今日は引いてない
	return false
}

//本日のアイテムリスト
// [{id:アイテムID, rank:アイテムランク}] のリストを返す
//baserank : 武器の強さの基準ランク (現在の最高の敵の強さを基準にしたい)
function getShopItemListToday(date=null, baserank=0){
	if(date == null){
		date = new Date().getTime()
	}
	setSeed(date)
	var items = []
	//適当なアイテムを5個詰める
	//適当に線形合同でいいや
	for(var i=0;i<5;++i){
		var id = seededRandomInt(0,data.item_data.length-1)
		var rank = baserank*1.06 + 450
		var bonus_rank = seededRandomInt(0,300)
		var cost = data.item_data[id].rarity * 4000 + seededRandomInt(0,2000) + 1000 + bonus_rank *30

		var target_power = getStandardItemParameter(rank+bonus_rank)
		var base_power = getStandardItemParameter(id)
		//そのランクでの標準の強さ * 1.1(1.1倍ぶんだけ余裕をちょっと持たせる)
		var build_rank = Math.floor(10* target_power *1.1 /  base_power) +1

		items.push({rank:build_rank, id: id, cost:cost})
	}
	return items
}

//セーブ欄の本日のアイテムを更新する
function updateShopItemList(){
	var current = new Date()
	var savedata_date = new Date(save.shop.date)

	//日付情報が入っていない = 初めて開く
	if(save.shop.date == null){
		save.shop.times_item_refresh_today = 0
		save.shop.items = getShopItemListToday(time=new Date().getTime(), rank=getMaxEnemyRank())
	}
	//いま現在の日付と最終メニュー開閉日時が一致しない = 日付が変わっている場合はショップリストの更新を行う
	else if(savedata_date.getDay() !== current.getDay()){
		save.shop.times_item_refresh_today = 0
		save.shop.items = getShopItemListToday(time=save.shop.date, rank=getMaxEnemyRank())
	}
	//日付が入ってて、今日の日付の場合には何もしない
	else{
	}

	//日付の更新
	save.shop.date = current.getTime()

}


function buyShopItem(domobject){
	var shop_item_index = $(domobject).parent().attr("id").slice(-1)
	var shop_item = save.shop.items[shop_item_index]

	//お金足りない
	if(save.item[shop_item.id] >= shop_item.rank){
		talkPirika("あれー、お客さんもうこれより強いの持ってないっす？嬉しいけど、無理して買うことはないっすよー")
		 return		
	}
	if(shop_item.cost > save.powder){
		talkPirika("妖精の鱗粉が足りないっすよー！ もーうすこしだけ稼いできてね？　ねっ？")
		 return
	}


	save.powder -= shop_item.cost
	talkPirika("まいどまいどー！またいっぱい作ってくるから、よろしくっすよーっ！それじゃ、探索がんばってね！")

	jumpPirika()
	save.item[shop_item.id] = shop_item.rank

	numerateCurrentPowderAmount()
	prepareShopMenu()

}

function refreshShopItemList(){

	//連打対策にアニメーション中は動かない
	if($(".shop_item").is(":animated")){
		return
	}

	if(save.coin < 2000){
		talkPirika("あー...コインがちょっとばかし足んないっす！申し訳ないけど、2000コイン用意してほしいっす～")
		return
	}

	if(save.shop.times_item_refresh_today >= 10){
		talkPirika("今日持ってきた在庫分はこれで全部だよー！また明日ごっそり持ってくるから待っててね！")
		return		
	}
	save.shop.items = getShopItemListToday(date=new Date().getTime(),rank=getMaxEnemyRank())
	save.coin -= 2000
	save.shop.times_item_refresh_today++
	makesave()
	refreshShopItemListAnimation()
}


/*******************************************/
/* 初期化とメインループ実行 */
/*******************************************/

$(document).ready(function(){
	init();
})

setInterval(mainLoop_1sec,1000);

function  ra(){
	mainLoop()
	window.requestAnimationFrame(ra)
}
ra()





