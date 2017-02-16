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
	],
	equipment_menu : {
		current_page : 1,
		current_character : "siro"
	}
}

var save = {
	status:{
		siro:{
			hp:100,
		},
		kuro:{
			hp:100,
		}
	},
	current_dungeon_id:0,
	current_floor:1,
	equip :{
		siro:[],
		kuro:[],
	},
	item:[],
	dungeon_open:[1,0,0,0,0],
	dungeon_process:[0,0,0,0,0]
}

var dungeon_data=[
{
	name:"一つめのダンジョン",
	caption:"最初のダンジョン。",
	start_ir:0,
	depth:100
},
{
	name:"目黒オフィス",
	caption:"二つ目のダンジョン。ここでなんかちょっと世界観が披露され始める。",
	start_ir:50,	
	depth:400
},
{
	name:"氷っぽいところ",
	caption:"３つめのダンジョン。背景が幻想的できれいなやつにする。",
	start_ir:250,	
	depth:500
},
{
	name:"よっつめのだんじょん",
	caption:"よっつめ。敵が強くなる。",
	start_ir:500,	
	depth:1000
},
{
	name:"ごこめー",
	caption:"ラスダンっぽいところ。たいへん。クリア後はアイテム掘りに使うのでそこそこ背景がきれいなやつ",
	start_ir:1000,
	depth:2000,	
},
]

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

//自然につくプラス値の最大
var MAX_EQUIP_BUILD = 11

//アイテム抽選関係
//アイテムの出現比率
var LOT_FREQ_NORMAL = 5
var LOT_FREQ_RARE = 4
var LOT_FREQ_EPIC = 3
var LOT_FREQ_LEGENDARY = 2

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
	loadItemList()
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
	//とりあえず階段：アイテム：バトルは均等に割り振る
	var event_type = randInt(1,3)
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
		default:
		castMessage("これはでないはずなので気にしない")
		break
	}
}

//アイテムいっぱい取得
function __debugAquireItemIppai(){
	for(var i=0;i<200;++i){
		var rand = randInt(0,data.item_data.length)
		aquireItem(rand)
	}
	//viewの反映
	updateEquipList()
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

//指定したアイテムIDのアイテムを取得
function aquireItem(item_id){
	var after = (save.item[item_id] || 0) +1
	after = Math.min(after,MAX_EQUIP_BUILD)

	save.item[item_id] = after
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
function lotItem(){
	var dungeon_index = save.current_dungeon_id*10
	var floor_up = Math.floor(save.current_floor/2)
	var item_range = 10
	var min = dungeon_index+floor_up
	var max = dungeon_index+floor_up+item_range

	//アイテム抽選箱
	//こいつにレア度ごとに定めた個数アイテムをぶっこんで一個取り出す
	var lot_box = []
	for(var i=min;i<max;++i){
		var box_amount = getBoxAmount(data.item_data[i].rarity)
		for(var j=0;j<box_amount;++j){
			lot_box.push(i)
		}
	}
	var elected_item = lot_box[randInt(0,lot_box.length)]
	return  elected_item
}

function updateStairsArea(){
	$("#current_floor").text(save.current_floor)
}

//バトル処理を行う
function processBattle(){
	//とりあえずダンジョン使用決まってから
	save.status.siro.hp -= randInt(1,10)
	save.status.kuro.hp -= randInt(1,10)

	save.status.siro.hp < 0?save.status.siro.hp=0:false
	save.status.kuro.hp < 0?save.status.kuro.hp=0:false
}

//階段処理
function processStairs(){
	save.current_floor ++
	updateStairsArea()
}

//アイテム拾得イベントを起こす
function eventItem(){
	spriteSlidein("item")
	var item_id = lotItem()
	aquireItem(item_id)

	//新規取得ならレベル1になっているはず
	if(save.item[item_id] == 1){
		castMessage(data.item_data[item_id].name + "を拾った!")
	}
	else{
		castMessage(data.item_data[item_id].name+"を+"+(save.item[item_id]-1)+"に強化した!")		
	}

}

//階段降りイベントを起こす
function eventStairs(){
	spriteSlidein("artifact")
	processStairs()
	castMessage("階段を降りた！")
}

//バトルイベントを起こす
function eventBattle(){
	spriteSlidein("battle")
	processBattle()
	castMessage("バトルが発生した！")
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
	},800,"easeOutQuart")
	.queue(function () {
		$(this).addClass	("hidden").dequeue();
		//バトル結果の画面反映はスプライト消えたあと
		updateCurrentHP() 
	})
}

//HPの表記反映
function updateCurrentHP(){
	$("#hp_siro").text(save.status.siro.hp)
	$("#hp_kuro").text(save.status.kuro.hp)
}


//ダンジョン選択画面のメニューを展開
function showDungeonSelectMenu(){
	prepareDungeonList()
	$("#dungeon_select_menu")
	.removeClass("hidden")
	.animate({
		opacity:0.98,
		top:"50px",
	},200,"easeOutQuart")	
}

//ステータス画面のメニューを展開
function showStatusMenu(){
	$("#status_menu")
	.removeClass("hidden")
	.animate({
		opacity:0.98,
		top:"50px",
	},200,"easeOutQuart")
}

//装備メニューの展開
function showEquipmentMenu(){
	prepareEquipMenu()

	$("#equipment_menu")
	.removeClass("hidden")
	.animate({
		opacity:0.98,
		top:"50px",
	},200,"easeOutQuart")
}

//装備メニューの開放
function fadeEquipmentMenu(){
	$("#equipment_menu")
	.animate({
		opacity:0,
		top:"30px",
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass	("hidden").dequeue();
	})
}

//ダンジョン選択メニューの開放
function fadeDungeonSelectMenu(){
	$("#dungeon_select_menu")
	.animate({
		opacity:0,
		top:"30px",
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass	("hidden").dequeue();
	})
}

//ダンジョン選択メニューの開放
function fadeStatusMenu(){
	$("#status_menu")
	.animate({
		opacity:0,
		top:"30px",
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass	("hidden").dequeue();
	})
}

//装備メニューの準備
function prepareEquipMenu(){

	updatePagerTotalPage()
	updateEquipList()
	updatePagerButtonState()

}

//ページャーの総ページ数を反映
function updatePagerTotalPage(){
	var max_page = Math.floor(data.item_data.length/10)+1
	$("#total_page").text(max_page)
}

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

		//レアリティのやつ
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
		var builded = orig_params.map(x=>Math.floor(x*(lv-1+5)/5))

		//全部足し合わせる
		var sum = builded.reduce((x,y)=>x+y)

		return sum
	}

//装備リストのパラメータ部分を更新
function updateEquipListParam(){
	var equip_name_list = $("#equipment_list .equip_item").children(".equip_list_param")
	var current_page = data.equipment_menu.current_page

	//表示項目の更新
	for(var i=0;i<equip_name_list.length;++i){

		var target_item_id = (current_page-1)*10 + i
		var target_item_lv = save.item[target_item_id] || 0

		if(!data.item_data[target_item_id]){
			equip_name_list[i].innerText = "-"
			continue
		}

		if(!target_item_lv){
			equip_name_list[i].innerText = "-"
			continue
		}

		var full_score = calcTotalItemParam(target_item_id)
		equip_name_list[i].innerText = full_score
	}
}

//装備リストの装備名部分を更新
function updateEquipListName(){
	var equip_name_list = $("#equipment_list .equip_item").children(".equip_list_text")
	var current_page = data.equipment_menu.current_page

	//li にアイテムIDを埋め込み
	var lists =  $("#equipment_list").children()
	for(var i=0;i<lists.length;++i){
		lists[i].setAttribute("item_id",(current_page-1)*10+i)
	} 

	//表示項目の更新
	for(var i=0;i<equip_name_list.length;++i){

		var target_item_id = (current_page-1)*10 + i
		var target_item_lv = save.item[target_item_id] || 0

		var item_full_name = makeFullEquipName(target_item_id)

		//一旦クラスリセット
		equip_name_list[i].setAttribute("class","equip_list_text")

		//一旦アイコンをデフォのやつに
		$(".equip_list_icon")[i].setAttribute("src","images/neko/icons/unachieved.png")

		//レアリティ・装備済反映
		if(data.item_data[target_item_id]){
			var rarity = data.item_data[target_item_id].rarity
			var additional_class_name = ""

			if(target_item_lv){
				additional_class_name = getRarityClassName(rarity)
				//アイコン反映
				var icon_name = getItemIconNameFromTypeID(data.item_data[target_item_id].category)
				$(".equip_list_icon")[i].setAttribute("src","images/neko/icons/"+icon_name+".png")
			}	

			//装備済反映
			if(isAlreadyEquipped(target_item_id)){
				additional_class_name += " equipped"
			}


		}
		equip_name_list[i].setAttribute("class","equip_list_text "+additional_class_name)
		equip_name_list[i].innerText = item_full_name
	}	
	
}

//装備リストの表示項目を反映
function updateEquipList(){
	updateEquipListName()
	updateEquipListParam()
}

//プラス値を考慮したパラメータを返す
function getBuildedParameter(item_id,paramName){
	var lv = save.item[item_id]
	var param = Math.floor(parseInt(data.item_data[item_id][paramName]) * (lv-1+5)/5)
	return param
}


//ページャーのボタンの活性不活性を反映
function updatePagerButtonState(){
	var current_page = data.equipment_menu.current_page
	var max_page = Math.floor(data.item_data.length/10)+1
	$("#pager_button_prev").removeClass("disabled")
	$("#pager_button_next").removeClass("disabled")

	if(current_page == 1){
		$("#pager_button_prev").addClass("disabled")		
	}
	if(current_page == max_page){
		$("#pager_button_next").addClass("disabled")		
	}
}

//詳細エリアのフラッシュ
function resetDetailArea(){
	$("#equip_detail_name").text("----")
	$("#status_detail_str").text("-")
	$("#status_detail_dex").text("-")
	$("#status_detail_def").text("-")
	$("#status_detail_agi").text("-")
	$("#flavor_text").text("-")

	$("#status_diff_str").text("-")
	$("#status_diff_dex").text("-")
	$("#status_diff_def").text("-")
	$("#status_diff_agi").text("-")

	$("#status_diff_str").removeClass("decrease")
	$("#status_diff_dex").removeClass("decrease")
	$("#status_diff_def").removeClass("decrease")
	$("#status_diff_agi").removeClass("decrease")
}

//該当キャラの{str,dex,def,agi}の合計値を計算
function getTotalParameter(charaname,paramName){
	var total = 10
	for(var equip of save.equip[charaname]){
		total += getBuildedParameter(equip,paramName)
	}
	return total
}

//現在のキャラのパラメータを反映
function updateCurrentTotalParameter(){
	var current_chara_name = data.equipment_menu.current_character

	var str = getTotalParameter(current_chara_name,"str")
	var dex = getTotalParameter(current_chara_name,"dex")
	var def = getTotalParameter(current_chara_name,"def")
	var agi = getTotalParameter(current_chara_name,"agi")

	$("#status_total_str").text(str)
	$("#status_total_dex").text(dex)
	$("#status_total_def").text(def)
	$("#status_total_agi").text(agi)
}

//詳細画面に表示する項目を item_id にする
function updateEquipDetailAreaTo(item_id){
	var item = data.item_data[item_id]

	var lv = save.item[item_id] || 0
	if(lv == 0){
		resetDetailArea()
		return
	}

	//詳細エリアの反映
	var str = getBuildedParameter(item_id,"str")
	var dex = getBuildedParameter(item_id,"dex")
	var def = getBuildedParameter(item_id,"def")
	var agi = getBuildedParameter(item_id,"agi")

	$("#equip_detail_name").text(item.name)
	$("#status_detail_str").text(str)
	$("#status_detail_dex").text(dex)
	$("#status_detail_def").text(def)
	$("#status_detail_agi").text(agi)
	$("#flavor_text").text(item.caption)

	//パラメータ関連の反映
	$("#status_diff_str").text(str)
	$("#status_diff_dex").text(dex)
	$("#status_diff_def").text(def)
	$("#status_diff_agi").text(agi)

	$("#status_diff_str").removeClass("decrease")
	$("#status_diff_dex").removeClass("decrease")
	$("#status_diff_def").removeClass("decrease")
	$("#status_diff_agi").removeClass("decrease")

	if(str<0){
		$("#status_diff_str").addClass("decrease")
	}	
	if(dex<0){
		$("#status_diff_dex").addClass("decrease")
	}	
	if(def<0){
		$("#status_diff_def").addClass("decrease")
	}	
	if(agi<0){
		$("#status_diff_agi").addClass("decrease")
	}	
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
	$("#current_page").text(after_page)

	prepareEquipMenu()
}

//ページャー次のページに移動
function equipListNextPage(){
	var max_page = Math.floor(data.item_data.length/10)+1
	var after_page = Math.min(data.equipment_menu.current_page+1,max_page)
	data.equipment_menu.current_page = after_page
	$("#current_page").text(after_page)

	prepareEquipMenu()
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
	var item_id = domobject.attributes.item_id.textContent
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

//現在装備エリアの表示反映を行う
function  updateCurrentEquipListArea(){
	var current_chara_name = data.equipment_menu.current_character
	var equip_num = save.equip[current_chara_name].length

	for(var i=0;i<4;++i){
		$("#current_equip_list").children()[i].innerText = "-"
	}

	for(var i=0;i<equip_num;++i){
		var item_id = save.equip[current_chara_name][i]
		var item_name = data.item_data[item_id]
		$("#current_equip_list").children()[i].innerText = makeFullEquipName(item_id)
	}

	//アイテムIDのリセット
	for(var i=0;i<4;++i){
		$("#current_equip_list").children()[i].setAttribute("item_id","")
	}

	//アイテムIDの埋め込み
	for(var i=0;i<equip_num;++i){
		var item_id = save.equip[current_chara_name][i]
		$("#current_equip_list").children()[i].setAttribute("item_id",item_id)
	}
}

//装備キャラの切り替え
function toggleEquipEditCharacter(){
	var current_chara_name = data.equipment_menu.current_character

	//変更後キャラ名
	var after = current_chara_name=="siro"?"kuro":"siro"

	//データ上も反映
	data.equipment_menu.current_character = after	

	//キャラの切り替え
	$("#equip_charagter_image").attr("src","images/neko/chara/"+after+"_active.png")
	.css("left","-40px")
	.css("opacity",.7)
	.animate({
		opacity:1,
		left:"-30px"
	},300,"easeOutQuart")

	updateCurrentEquipListArea()
	updateCurrentTotalParameter()
	updateEquipList()

}

//ステージの切り替え
function changeStageTo(stage_id,depth){
	save.current_dungeon_id = stage_id
	save.current_floor = depth
	$("#fadeouter")
	.css("display","block")
	.animate({
		opacity:1
	},300,"easeOutQuart")
	.queue(function(){
		$("#background_image").attr("src","images/neko/bg/st"+stage_id+".png")	
		$(".dungeon_name").text(dungeon_data[stage_id].name)
		$("#current_floor").text(save.current_floor)
		$(".max_floor").text(dungeon_data[stage_id].depth)
		$(this).dequeue();
	})
	.delay(1000)
	.animate({
		opacity:0
	},200,"easeOutQuart")
	.queue(	function(){
		$(this).css("display","none")
		$(this).dequeue();
	})

	$("#kirikae_animation")
	.css("left","400px")
	.css("opacity",0.7)
	.animate({
		opacity:1,
		left:"600px",
	},500,"linear")
	.delay(300)
	.animate({
		top:480
	},30,"swing")
	.animate({
		top:500
	},30,"linear")

	$("#kirikae_text")
	.text("少女移動中 ")
	.delay(200)
	.queue(	function(){
		$(this).append(".")
		$(this).dequeue();
	})
	.delay(250)
	.queue(	function(){
		$(this).append(".")
		$(this).dequeue();
	})
	.delay(300)
	.queue(	function(){
		$(this).append(".")
		$(this).dequeue();
	})

}

//ダンジョン選択画面の詳細表示をdungeon_idのものに切り替える
function updateDungeonDetailTo(dungeon_id){
	$("#dungeon_select_preview_image")
	.animate({
		opacity:0.6,
	},50,"easeOutQuart")
	.queue(function(){
		$(this).attr("src","images/neko/bg/st"+dungeon_id+".png")
		$(this).dequeue();
	})
	.animate({
		opacity:1,
	},30,"easeOutQuart")

	$("#dungeon_detail_name").text(dungeon_data[dungeon_id].name)
	$("#dungeon_detail_text").text(dungeon_data[dungeon_id].caption)
}

//クリックされたオブジェクトからステージIDを取り出して詳細画面を切り替える
function updateDungeonDetailClick(domobject){
	var stage_id = domobject.attributes.stage_id.textContent
	updateDungeonDetailTo(stage_id)
}

//ダンジョンの開放状況に合わせてリストを用意する
function prepareDungeonList(){
	//いったんフラッシュ
	$("#dungeon_list").text("")

	//開放済のダンジョンを見せる
	for(var i=0;i<save.dungeon_process.length;++i){
		var stage_id = i
		var name = dungeon_data[stage_id].name
		var item = '<li class="dungeon_item" stage_id="'+stage_id+'">'+name+'</li>'
		if(save.dungeon_open[stage_id]){
			$("#dungeon_list").append(item)
		}
	}

	//新しく付与した要素をクリックした際の挙動を定義しておく
	$(".dungeon_item").click(function(){
		updateDungeonDetailClick(this)
	})

}

/*******************************************/
/* イベントハンドラ */
/* ロジックはここに書かない */
/* ボタンの挙動は個別の関数に分離する*/
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

//ダンジョンリスト画面に戻るメニューを表示
$("#dungeon_list_show_button").click(function(){
	showDungeonSelectMenu()
})

//ステータス画面を開く
$("#status_show_button").click(function(){
	showStatusMenu()
})

//メニューボタンクリックでメニューを開く
$("#menu_equip_button").click(function(){
	showEquipmentMenu()
})

//装備メニュー戻るボタンクリックでメニュー閉じる
$("#dungeon_select_back_button").click(function(){
	fadeDungeonSelectMenu()
})

//ステータスメニュー戻るボタンクリックでメニュー閉じる
$("#status_back_button").click(function(){
	fadeStatusMenu()
})

//装備メニュー戻るボタンクリックでメニュー閉じる
$("#equipment_back_button").click(function(){
	fadeEquipmentMenu()
})

//装備リストページャの操作:次のページ
$("#pager_button_prev").click(function(){
	equipListPrevPage()
})

//装備リストページャの操作:前のページ
$("#pager_button_next").click(function(){
	equipListNextPage()
})

//各装備マウスオーバーで詳細画面に対応したものを表示
$(".equip_item").mouseover(function(){
	equipDetailMouseOver(this)
})

//各装備マウスオーバーで詳細画面に対応したものを表示
$(".equip_item").click(function(){
	equip(this)
})

//装備ウィンドウ右クリで装備を外す
$("#equipment_menu").bind("contextmenu",function(){
	unEquip()
	return false
})

//装備詳細にマウスオーバーでも詳細を表示
$(".current_equip_item").mouseover(function(){
	equipDetailMouseOver(this)
})

//装備詳細クリックは装備を外す
$(".current_equip_item").click(function(){
	unEquipClick(this)
})

//装備キャラ切り替えボタンでトグル
$("#equip_character_toggle_button").click(function(){
	toggleEquipEditCharacter()
})


/*******************************************/
/* 初期化とメインループ実行 */
/*******************************************/

$(document).ready(function(){
	init();
})
setInterval(mainLoop,LOOP_FREQUENCY);
setInterval(mainLoop_1sec,1000);








