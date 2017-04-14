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
		sort_order : 1,
	},
	dungeon_select_menu : {
		depth : 1,
		stage_id : 0
	},
	background_image_scroll_position : 1000,
	current_build_item_id : 0,
	disable_gacha_button : false,
	hyper_event_dash_mode : false,
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
	total_coin_achieved : 0,
	achievement_clear : [0,0,0,0,0,0,0,0,0,0],
	playtime : 0,
	total_death : 0,
	total_2kill : 0,
	total_treasurebox_open : 0,
	options : {
		enable_event_animation : true,
		enable_loitering : true,
		enable_scroll_background : true,
	},
	free_spin_last_take : 0,
	last_login : null,
	extra_event_time_remain : 0,
		notify : {
		enabled : false,
		working_mode : false,
		onDeath : true,
		onClearDungeon : true,
		onFreeSpin : true,
		jihou : true
	},
	tutorial : {
		notify : false,
	},
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
	depth:9999,
},
]

/*******************************************/
/* 実績 */
/*******************************************/
var achievement_data = [
{
	name : "灰色魔女",
	detail : "灰泥の尾根を踏破する。",
	max : 400
},
{
	name : "木登上手",
	detail : "蜜樹の臨界を踏破する。",
	max : 800
},
{
	name : "雪山登頂",
	detail : "氷雪と春風の小路を踏破する。",
	max : 1200
},
{
	name : "夜目覚醒",
	detail : "アスモネア地下道を踏破する。",
	max :1600
},
{
	name : "時空制覇",
	detail : "次元の界面2000Fのボスを撃破する。",
	max : 2000
},
{
	name : "鍛冶親父",
	detail : "50種類の武器を+10まで強化する。",
	max : 50
},
{
	name : "死屍累々",
	detail : "100回全滅する。",
	max : 100
},
{
	name : "疾風迅雷",
	detail : "2ターンキル(最速撃破)を1000回行う。",
	max : 1000
},
{
	name : "金玉漂流",
	detail : "宝箱を100回開封する。",
	max : 100
},
{
	name : "感謝感激",
	detail : "48時間以上遊ぶ。(PCつけっぱでOK)",
	max : 48
},
]

var stage_data=[
{
	number : "第一次元層",
	title : "灰泥の尾根",
	description: "",
	back : "st0.png",
	last_color : "#cdf4f4"
},
{
	number : "第二次元層",
	title : "蜜樹の臨界",
	description: "",
	back : "st1.png",
	last_color : "#3ad17e"
},
{
	number : "第三次元層",
	title : "氷雪と春風の小路",
	description: "密林を抜けると果ての見えない吹き抜けに出た。<br>僅かに上空から風が吹いているのを感じる。<br>空間の歪んだ塔内部では外界の空気を吸う術などないと諦めていたが、<br>この次元はどうやら外部と物理的につながっている領域もあるようだ。<br>外に繋がる窓を見つけたら手紙を落としてみよう、と、<br>久しく抱くことのなかった気楽な冒険気分を抱きつつ、一行は塔を登り続ける。",
	back : "st2.png",
	last_color : "#74d4f2"
},
{
	number : "第四次元層",
	title : "アスモネア地下道",
	description: "",
	back : "st3.png",
	last_color : "#d86213"
},
{
	number : "最終次元層",
	title : "次元の界面",
	description: "",
	back : "st4.png",
	last_color : "#fc3535"
},
]

var tips_data=[
"STRとDEXはバランスが大切です。それぞれの値が近いほど効率よく攻撃力が上がります。",
"「このあたりの敵の攻撃力」よりも守備力が下回っていると、差額分のダメージを喰らい非常に危険です。",
"実績は一つ達成するごとにイベント間隔が1秒短縮されます。",
"武器は「装備画面で右クリック」でも外せます。一気に組み直すときには右クリック4連打がおすすめです。",
"ダンジョンの本来の深さよりも深いところを探索しても大したものは落ちていません。",
"通常武器は+10までしか強化できませんが、おみくじではそれ以上に強化されたアイテムを引ける可能性があります。",
"おみくじで引いた武器がすでに持っているものよりも弱かった場合、武器は捨てられますが50コイン返却されます。",
"ボスキャラの攻撃力は標準的な敵の1.2倍程度あるようです。",
]

var jiho_data = [
"0時！こんな時間に寝るなんて雑魚よ！",
"1時です。くろこはゲームしてるけどもう寝ます...",
"2時っ... そろそろ限界か...",
"(3時。ふたりとも寝付いた。)",
"(4時だ。ふたりとも寝ている...)",
"5時です！はやおきですね！",
"6時。んー...もうちょいねる...",
"7時ですっ！朝ごはん作りますよー！",
"8時... しろこに朝ごはんねだるか...",
"9時！そろそろ下の人たちはお仕事かな...",
"10時... 朝......の一番眠い時間......(くかー)",
"11時ですね。くろこは寝かしてアイテム拾いです。",
"12時！再起動成功！お昼！休憩！",
"13時です。......15分だけお昼寝させてください...",
"14時だね。けだるい午後のひとときだー...",
"15時ですよー！ちょっとしたらおやつ出しますね！",
"16時！しろこケーキまだー？",
"ただいま17時ですね！そろそろねぐら探しをしましょう",
"18時。おゆはんーおゆはんー。めしをーさがせー。",
"19時です。もう暗いので今日はここまでにしましょう。",
"20時っ！お湯沸かすよー！",
"...21時ですーっ。のーんびりお風呂で疲れを取りますっ。",
"22時！！！ちょっと時間余ったしゲームするよ！",
"23時。ご主人はそろそろ寝ないで良いんです？",
]

var tutorial_data = {
	notify : {
		title : "↖通知機能",
		description : "旅の合間合間にしろこたちがお手紙を出してくれます。<br>別の作業を始めてもこれで大丈夫！<br>(オプションからいつでも設定ができます。)",
		x : 20,
		y : 20
	}
}


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
var EVENT_FREQ_STAIRS = 35
var EVENT_FREQ_ITEM = 13
var EVENT_FREQ_ITEM_FLOOD = 2
var EVENT_FREQ_BATTLE = 50

//イベント抽選関係
//ランダムアイテムエリアの出現比率
var EVENT_FREQ_EXD_STAIRS = 40
var EVENT_FREQ_EXD_ITEM = 9
var EVENT_FREQ_EXD_ITEM_FLOOD = 1
var EVENT_FREQ_EXD_BATTLE = 50

//デフォルトのイベント発生間隔(秒)
var DEFAULT_EVENT_FREQ = 40

//復活タイマー(秒)
var AUTO_RESSURECT_TIME = 5000

//フリーおみくじの間隔(分)
var FREE_GACHA_INTERVAL = 600