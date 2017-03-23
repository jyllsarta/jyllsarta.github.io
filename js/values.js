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
		current_character : "siro",
		sort_order : 0,
	},
	dungeon_select_menu : {
		depth : 1,
		stage_id : 0
	},
	background_image_scroll_position : 1000,
	current_build_item_id : 0
}


//セーブデータ
//status以外を入れ子にする場合ValidateSave()を更新すること
var save = {
	status:{
		siro:{
			hp:100,
			max_hp:100,
			lv:0,
			exp:0
		},
		kuro:{
			hp:100,
			max_hp:100,
			lv:0,
			exp:0
		}
	},
	current_dungeon_id:0,
	current_landscape_id:0,
	current_floor:1,
	equip :{
		siro:[],
		kuro:[],
	},
	item:[1,1,1,1],
	dungeon_open:[1,0,0,0,0],
	dungeon_process:[1,0,0,0,0],
	next_event_timer : 40,
	auto_ressurect_timer : 5000,
	coin : 0,
	total_coin_achieved : 0
}

var dungeon_data=[
{
	name:"灰泥の尾根",
	caption:"最初に出会った次元層。なだらかな湖畔のようだ。",
	start_ir:0,
	depth:400
},
{
	name:"蜜樹の臨界",
	caption:"息苦しい湿気に覆われた密林の次元。夜は蔦が一斉に光りだす。",
	start_ir:50,
	depth:800
},
{
	name:"氷雪と春風の小路",
	caption:"クリスタルの階段でできた空中橋で構成される次元。",
	start_ir:150,	
	depth:1200
},
{
	name:"アスモネア地下道",
	caption:"くらーい地下道。",
	start_ir:300,	
	depth:1600
},
{
	name:"次元の界面",
	caption:"幾つもの次元が混濁する塔の最上層。空間が安定せず、絶えず構成が変化し続ける。",
	start_ir:500,
	depth:4000,
},
]

/*******************************************/
/* 定数 */
/*******************************************/

//ウィンドウ読み込み時のゲームモード (リリース時titleにする)
var FIRST_GAME_MODE = "main"

//ログ保存件数
var MAX_MESSAGE_ITEM = 200

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

//イベント抽選関係
//イベントの出現比率
var EVENT_FREQ_STAIRS = 25
var EVENT_FREQ_ITEM = 23
var EVENT_FREQ_ITEM_FLOOD = 2
var EVENT_FREQ_BATTLE = 50

//デフォルトのイベント発生間隔(秒)
var DEFAULT_EVENT_FREQ = 40