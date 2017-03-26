
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
function getCurrentTimeString(){
	var d = new Date()
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
 	$("#game_window").delay(1000).queue(function(){$(this).removeClass("hidden").dequeue()})

 	castMessage("ロード全部終わり")
 })

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
	if(isCharacterAlive()){
		//生きてる間はイベントタイマーが回る
		save.next_event_timer --
		if(save.next_event_timer <= 0){
			save.next_event_timer = getEventInterval()
			event()
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
	updateBackgroundImagePosition()
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

/*******************************************/
/* デバッグ用 */
/*******************************************/

//アイテムいっぱい取得
function __debugAquireItemIppai(){
	for(var i=0;i<200;++i){
		var rand = randInt(0,data.item_data.length-1)
		aquireItem(rand)
	}
	//viewの反映
	prepareEquipMenu()
}

//ダンジョンフルオープン
function __debugDungeonFullOpen(){
	for(var i=0;i<dungeon_data.length;++i){
		log(i)
		save.dungeon_open[i] = 1
		save.dungeon_process[i] = dungeon_data[i].depth
	}
	prepareDungeonList()
}

//バランス調整用光速イベントモード
//オート復活・イベント2秒おき
//スプライトの発生を抑制
function __debugHyperEventDashMode(){
	DEFAULT_EVENT_FREQ	 = 2
	AUTO_RESSURECT_TIME= 10
	data.__hypereventdashmode = true
	save.next_event_timer = 1
	save.auto_ressurect_timer = 10
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
			castMessage(item+"がセーブデータになかったので"+save[item]+"にしました。")
		}
	}
	for(var item in save.status.siro){
		log(item)
		if(savedata.status.siro[item] === undefined){
			savedata.status.siro[item] = save.status.siro[item]
			castMessage("save.status.siro."+item+"がセーブデータになかったので"+save.status.siro[item]+"にしました。")
		}
	}
	for(var item in save.status.kuro){
		if(savedata.status.kuro[item] === undefined){
			savedata.status.kuro[item] = save.status.kuro[item]
			castMessage("save.status.kuro."+item+"がセーブデータになかったので"+save.status.kuro[item]+"にしました。")
		}
	}
}

//セーブ
function makesave(){
	var savestring = JSON.stringify(save)
	var base64save = Base64.encode(savestring)

	$.cookie("savedata", base64save, { expires: 10000 });

	saveAnimation()
}

//ロード
function load(){
	var cookie = $.cookie("savedata")
	if(cookie === undefined){
		castMessage("セーブデータが見つかりませんでした！")
		return
	}

	var savestring = Base64.decode(cookie)
	var savedata = JSON.parse(savestring)

	validateSave(savedata)

	save = savedata

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
 	return DEFAULT_EVENT_FREQ
 }

//生きてるキャラは居る?
function isCharacterAlive(){
	return save.status.siro.hp > 0 || save.status.kuro.hp > 0
}

//イベントの抽選を行い、イベントIDを返す
function lotEvent(){
	var event_box = []
	for(var i=0;i<EVENT_FREQ_ITEM;++i){
		event_box.push(1)
	}
	for(var i=0;i<EVENT_FREQ_STAIRS;++i){
		event_box.push(2)
	}
	for(var i=0;i<EVENT_FREQ_BATTLE;++i){
		event_box.push(3)
	}
	for(var i=0;i<EVENT_FREQ_ITEM_FLOOD;++i){
		event_box.push(4)
	}
	return event_box[randInt(0,event_box.length-1)]

}

//イベントを発生させる
function event(){
	//イベントの抽選を行う	
	var event_type = lotEvent()

	switch(event_type){
		case 1:
		eventItem()
		break
		case 2:
		eventStairs()
		break
		case 3:
		eventBattle()
		break
		case 4:
		eventItemFlood()
		break
		default:
		castMessage("これはでないはずなので気にしない")
		break
	}
	//イベントごとにセーブしとく
	makesave()
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

//指定したアイテムIDのアイテムを取得
function aquireItem(item_id){
	var before =  (save.item[item_id] || 0)
	var after = before+1
	after = Math.min(after,MAX_EQUIP_BUILD)
	save.item[item_id] = after

	var item_name = getRaritySymbol(data.item_data[item_id].rarity) + data.item_data[item_id].name

	//新規取得ならレベル1になっているはず
	if(save.item[item_id] == 1){
		castMessage(item_name + "を拾った!")
	}
	else if(before == MAX_EQUIP_BUILD){
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

//レアリティの数値から出現比率を計算
function getBoxAmount(rarity){
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
	var max = dungeon_index+floor_up+item_range

	//アイテム抽選箱
	//こいつにレア度ごとに定めた個数アイテムをぶっこんで一個取り出す
	var lot_box = []
	for(var i=min;i<max;++i){
		var box_amount = getBoxAmount(data.item_data[i].rarity)
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
}

//階段降りイベントを起こす
function eventStairs(){

	if(save.current_floor % 100 === 99){
		castMessage((save.current_floor+1)+"Fのボスだ！")
		showBossBattleSprite()
		processBattle(bossBattle=true)
		//生き残っていれば次の階に進む
		if(isCharacterAlive()){
			save.current_floor ++
			if(save.dungeon_process[save.current_dungeon_id] <= save.current_floor ){
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
			if(save.dungeon_open[save.current_dungeon_id+1] == 0 && save.current_floor == dungeon_data[save.current_dungeon_id].depth){
				save.dungeon_open[save.current_dungeon_id+1] = 1
				save.dungeon_process[save.current_dungeon_id+1] = 1
			}
			updateCurrentFloorText()
			fadeOutAndFadeInStairs()
		}
	}
	else{
		showStairsSprite()
		processStairs()
		castMessage("◆階段を降りた！")
	}
}

//バトルイベントを起こす
function eventBattle(){
	showBattleSprite()
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

function ressurect(){
	//fadeouterを掴んでいるのは完全に適当
	$("#fadeouter").queue(function(){
		ressurectAnimation()	
		castMessage("全回復！")
		$(this).dequeue();
	})
	.delay(500)
	.queue(function(){
		save.auto_ressurect_timer = AUTO_RESSURECT_TIME
		save.status.siro.hp = save.status.siro.max_hp
		save.status.kuro.hp = save.status.kuro.max_hp
		$(this).dequeue();
	})

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

//プラス値を考慮して総パラメータを更新する
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

//プラス値を考慮したパラメータを返す
function getBuildedParameter(item_id,paramName){
	var lv = save.item[item_id] || 0
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

//charanameのatkを返す
function calcAttack(charaname){
	var str = getTotalParameter(charaname,"str")	
	var dex = getTotalParameter(charaname,"dex")
	return Math.floor((str + dex)/2 + Math.min(str,dex))
}

//charanameのatkを返す
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
function equipListPrevPage(){
	var after_page = Math.max(data.equipment_menu.current_page-1,1)
	data.equipment_menu.current_page = after_page
	updatePagerCurrentPage()
	prepareEquipMenu()
}

//ページャー次のページに移動
function equipListNextPage(){
	var max_page =  findLatestEquipPageIndex()
	var after_page = Math.min(data.equipment_menu.current_page+1,max_page)
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
	for(charaname in save.equip ){
		for(var equip of save.equip[charaname]){
			if (equip == item_id){
				return true
			}
		}
	}
	return false
}

//装備を試みる
function equip(domobject){
	var item_id = $(domobject).parent().attr("item_id")
	var current_chara_name = data.equipment_menu.current_character
	var equip_num = save.equip[current_chara_name].length
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
	save.equip[current_chara_name].push(item_id)

	//viewの反映
	updateCurrentEquipListArea()
	updateCurrentTotalParameter()
	updateEquipList()
	updateEquipDetailATKDEF()
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
		if(item_id == save.equip[current_chara_name][i]){
			unEquip(i)
		}
	}
}

//装備を外す
function unEquip(slice=false){
	var current_chara_name = data.equipment_menu.current_character
	//既に装備してないなら何もしない
	if(save.equip[current_chara_name].length == 0){
		return
	}	
	if(slice===false){
		save.equip[current_chara_name].pop()
	}
	else{
		save.equip[current_chara_name].splice(slice,1)		
	}
	//viewの反映
	updateCurrentEquipListArea()
	updateCurrentTotalParameter()
	updateEquipList()
	updateEquipDetailATKDEF()
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
}

//現在の装備のページのインデックスを返す
function findLatestEquipPageIndex(){
	return Math.floor(save.item.length / 10)+1
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
function toggleSortOrder(){
	if(data.equipment_menu.sort_order === 5){
		data.equipment_menu.sort_order = 0
	}
	else{
		data.equipment_menu.sort_order++
	}
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
		if(save.item[i] == MAX_EQUIP_BUILD){
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

/*******************************************/
/* ダンジョン選択画面 */
/*******************************************/

//ステージの切り替え
function changeStageTo(stage_id,depth){
	save.current_dungeon_id = stage_id
	save.current_floor = depth
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
/* 初期化とメインループ実行 */
/*******************************************/

$(document).ready(function(){
	init();
})



setInterval(mainLoop,50);
setInterval(mainLoop_1sec,1000);








