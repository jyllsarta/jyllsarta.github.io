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
	background_image_scroll_position : 0,
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
	current_floor:1,
	equip :{
		siro:[],
		kuro:[],
	},
	item:[1,1,1,1],
	dungeon_open:[1,0,0,0,0],
	dungeon_process:[0,0,0,0,0],
	next_event_timer : 120,
	auto_ressurect_timer : 5000,
	coin : 0,
	total_coin_achieved : 0
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
	start_ir:25,
	depth:400
},
{
	name:"氷っぽいところ",
	caption:"３つめのダンジョン。背景が幻想的できれいなやつにする。",
	start_ir:125,	
	depth:500
},
{
	name:"よっつめのだんじょん",
	caption:"よっつめ。敵が強くなる。",
	start_ir:250,	
	depth:1000
},
{
	name:"ごこめー",
	caption:"ラスダンっぽいところ。たいへん。クリア後はアイテム掘りに使うのでそこそこ背景がきれいなやつ",
	start_ir:500,
	depth:2000,	
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
var DEFAULT_EVENT_FREQ = 120