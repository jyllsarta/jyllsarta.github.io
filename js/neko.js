
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

/*******************************************/
/* メイン画面 */
/*******************************************/


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

/*******************************************/
/* イベント関係 */
/*******************************************/

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
	// in battle.js
	processBattle()
	castMessage("バトルが発生した！")
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
	var lv = save.item[item_id]
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
	var max_page = Math.floor(data.item_data.length/10)+1
	var after_page = Math.min(data.equipment_menu.current_page+1,max_page)
	data.equipment_menu.current_page = after_page
	updatePagerCurrentPage()
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
}



/*******************************************/
/* ステータス画面 */
/*******************************************/

//ステータス画面のパラメータを整理
function prepareStatusParameters(){
	$("#status_siro .status .status_value")[0].textContent = save.status.siro.hp
	$("#status_siro .status .status_value")[1].textContent =  getTotalParameter("siro","str")
	$("#status_siro .status .status_value")[2].textContent =  getTotalParameter("siro","dex")
	$("#status_siro .status .status_value")[3].textContent =  getTotalParameter("siro","def")
	$("#status_siro .status .status_value")[4].textContent =  getTotalParameter("siro","agi")

	$("#status_kuro .status .status_value")[0].textContent = save.status.kuro.hp
	$("#status_kuro .status .status_value")[1].textContent =  getTotalParameter("kuro","str")
	$("#status_kuro .status .status_value")[2].textContent =  getTotalParameter("kuro","dex")
	$("#status_kuro .status .status_value")[3].textContent =  getTotalParameter("kuro","def")
	$("#status_kuro .status .status_value")[4].textContent =  getTotalParameter("kuro","agi")

	for(var i=0;i<4;++i){
		if(save.equip.siro[i]){
			$("#equip_siro .status_equip_item")[i].textContent = makeFullEquipName(save.equip.siro[i])
		}
		else{
			$("#equip_siro .status_equip_item")[i].textContent = "-"		
		}
	}

	for(var i=0;i<4;++i){
		if(save.equip.kuro[i]){
			$("#equip_kuro .status_equip_item")[i].textContent = makeFullEquipName(save.equip.kuro[i])
		}
		else{
			$("#equip_kuro .status_equip_item")[i].textContent = "-"		
		}
	}
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
	var stage_id = data.dungeon_select_menu.stage_id
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








