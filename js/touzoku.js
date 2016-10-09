
//jsoncookie対応用
$.cookie.json = true;

//
// 各種定数
//

//購入ごとに商品価格がどれだけ上昇するか
var VALUE_INCREASE_RATE = 1.2;

//何ミリ秒ごとに更新処理を行うか これを10にすると100FPS 50にすると20FPS
var UPDATE_FREQ_MS = 50;
var SAVE_FREQ_MS = 60000;

//何秒ごとに金クッキーを表示するか(期待値)
var FREQ_GOLDEN_COOKIE_SPAWN_SEC = 140;

//数値表記ルール
var NUMERAL_FORMAT = "000.00a";

//○秒メッセージが流れなかったらランダムつぶやきを投げる
var MESSAGE_CAST_FREQ = 60;

var character_data = {
	"character_biscla" : {
		cost : 100,
		sps  : 5,
		name : "ビスクラヴレット",
		detail : "クッキーを焼いてくれるかわいい人狼。おまんじゅう工場の副産物にどうぞ。",
		icon_location : "images/touzoku/icon/biscla.png",
		creates : "siso_cookie",
		lv1_hire_message : "ビスクラ「クッキーを焼くのよー！よろしくニャー！」",
		lv3_hire_message : "ビスクラ「強くなったニャ！」",
		lv20_hire_message : "ビスクラ「これで最強ニャ！やったニャー」",
	},
	"character_eater" : {
		cost : 700,
		sps  : 25,
		name : "擬人型ﾁｱﾘｰｲｰﾀｰ",
		detail : "たべちゃうぞー。鍵クエに押し込められて暇なのでバイトをはじめた。結構まじめなのでそこそこの生産効率を誇る。",
		icon_location : "images/touzoku/icon/gijinka_eater.png",
		creates : "siso_vanilla",
		lv1_hire_message : "チ「よろしくお願い...します」",
		lv3_hire_message : "チ「強くなった...」",
		lv20_hire_message : "チ「ありがとう...チーちゃんの籠、新しいの買うね...」",
	},
	"character_el" : {
		cost : 7600,
		sps  : 660,
		name : "エル",
		detail : "ちーっす。基本ちょっかいしか出さないが、高級なしそﾒﾛﾝｸﾘｰﾑまんじゅうをたまに作る。",
		icon_location : "images/touzoku/icon/el.png",
		creates : "siso_great",
		lv1_hire_message : "エル「ちーっす。ビスクラちゃんと働いてる？」",
		lv3_hire_message : "エル「オイ結構楽しいなオイ！やるなアーサー！」",
		lv20_hire_message : "エル「ありっと！これで最強だな！アリーナ初手感電死は任せな」",
	},
	"character_clucky" : {
		cost : 140000,
		sps  : 3100,
		name : "クラッキー",
		detail : "地下アイドルもそれ一本では食べていけない。イチゴ味のおまんじゅうを手で握って作る。もちろん大きなお友達に高く売れる。",
		icon_location : "images/touzoku/icon/clucky.png",
		creates : "siso_strawberry",
		lv1_hire_message : "クラ「よろしくねーっ！」",
		lv3_hire_message : "クラ「3lv到達ね！着実に頑張りましょ」",
		lv20_hire_message : "クラ「ありがとうねっ☆　これからも頑張って働くよ！」",
	},
	"character_ukokkei" : {
		cost : 4400000,
		sps  : 27900,
		name : "富豪っち",
		detail : "金のおまんじゅうを産む。　ｳｺｯ... ｳｺｺｺｯ...!",
		icon_location : "images/touzoku/icon/ukokkei.png",
		creates : "siso_golden",
		lv1_hire_message : "烏「ｺｺｺｺ...」",
		lv3_hire_message : "烏「ｺｺｺｺ...!!!」",
		lv20_hire_message : "烏「ｳｪｯ... ｳｪﾋｯ......ﾋｯ...!!」",
	},
	"character_etafle" : {
		cost : 245400000,
		sps  : 1511000,
		name : "エタフレちゃん",
		detail : "両手でこねておまんじゅうを作る。焦げないふしぎな素材で作るおまんじゅうは防火のお守りに人気。",
		icon_location : "images/touzoku/icon/etafle.png",
		creates : "siso_eta",
		lv1_hire_message : "エタフレ「消毒は任せて...」",
		lv3_hire_message : "エタフレ「強くなった...」",
		lv20_hire_message : "エタフレ「これでクルースニクにも鉄パイプにも負けない... ありがとう...」",
	},
	"character_domo" : {
		cost : 16666666666,
		sps  : 213000000,
		name : "ドモヴォーイ",
		detail : "天使パワーがすごい。富豪っちと同じく金のおまんじゅうを産む。最近1ドローがついた。",
		icon_location : "images/touzoku/icon/domo.png",
		creates : "siso_domo",
		lv1_hire_message : "ドモ「おまんじゅうを作りに来たぞ」",
		lv3_hire_message : "ドモ「おもったより難しいのう...」",
		lv20_hire_message : "ドモ「どうじゃ！　かなりこなれてきたぞ！」",
	},
	"character_puka" : {
		cost : 1.00E+13,
		sps  : 798400000000,
		name : "プーカ",
		detail : "かわいい。説明不要。その薄くてやわらかいおまんじゅうください。",
		icon_location : "images/touzoku/icon/puka.png",
		creates : "siso_puka",
		lv1_hire_message : "プーカ「アーサーがお菓子くれるって言うから来たけど... ここ、なに...?」",
		lv3_hire_message : "プーカ「ちょっと... たのしい...」",
		lv20_hire_message : "プーカ「えへへ...アーサー、どう？じょうず？」",
	},
	"character_utahime" : {
		cost : 1.61E+16,
		sps  : 2.11111E+14,
		name : "歌姫アーサー",
		detail : "嫁入り修行にと料理の勉強中。不慣れだが、誰よりも心のこもったおまんじゅうを作る。",
		icon_location : "images/touzoku/icon/utahime.png",
		creates : "siso_uta",
		lv1_hire_message : "歌「こんにちは、アーサー！えへへ、嫁入り修行しにきたよ」",
		lv3_hire_message : "歌「どうかしら？ 結構上手になってきた気がするのだけど！」",
		lv20_hire_message : "歌「あの、アーサー、実績ページの台詞も見てね...?」",
	},
	"character_enyde" : {
		cost : 1.35062E+19,
		sps  : 6.54E+17,
		name : "エニード",
		detail : "むーむー。むむむーむむー、むむぁっ。(アーサー様のためにおまんじゅうを作る練習中です。)",
		icon_location : "images/touzoku/icon/enyde.png",
		creates : "siso_eni",
		lv1_hire_message : "エニ「むむー。(よろしく、アーサー様)」",
		lv3_hire_message : "エニ「むむーむ(さすがです、アーサー様)」",
		lv20_hire_message : "エニ「だーいすきですよ、アーサー様っ。(むむぇー)」",
	},
	"character_ganeida" : {
		cost : 2.00E+22,
		sps  : 1.00E+20,
		name : "ガネイダ",
		detail : "錬金術に成功したところをスカアハに見つかって無限に金のおまんじゅうを作らされている。",
		icon_location : "images/touzoku/icon/ganeida.png",
		creates : "siso_gane",
		lv1_hire_message : "ガネ「あの......帰りたいです......」",
		lv3_hire_message : "ガネ「あっ...定時......ああ......」",
		lv20_hire_message : "ガネ「アーサー様のお役に立てているのはうれしいのですが...」",
	},
	"character_fede" : {
		cost : 7.56E+24,
		sps  : 2.32E+23,
		name : "フェデルマ",
		detail : "何故かサポート妖精として実装されない不遇キャラ。",
		icon_location : "images/touzoku/icon/fede.png",
		creates : "siso_fede",
		lv1_hire_message : "フェデ「よろしゅうなー！全力で作るで！」",
		lv3_hire_message : "フェデ「強くなったで！どやどや！」",
		lv20_hire_message : "フェデ「ここまで育ててくれるなんて、アーサーには感謝してもしきれへんわ...」",
	},
	"character_nimue" : {
		cost : 3E+29,
		sps  : 5E+28,
		name : "ニムエ",
		detail : "ニムエです。",
		icon_location : "images/touzoku/icon/nimue.png",
		creates : "siso_nimue",
		lv1_hire_message : "ニム「最後のキャラです。あと100キャラいます。」",
		lv3_hire_message : "ニム「バランス崩壊パワーです。nerfされました。」",
		lv20_hire_message : "ニム「これで完クリです。リセットしてもう一周です。」",
	},
}

var achievement_data = {
	achievement_totalclick100 : {
		title : "見習い卒業",
		description : "100個以上のおまんじゅうをクリックして作成する。",
		says : "「手が疲れたのでシフト上がらせてもらいますね！」",
		icon_location : "images/touzoku/icon/touzoku.png",
	},
	achievement_goldenclick10 : {
		title : "ゴールデンマスター",
		description : "ゴールデンおまんじゅうを10個以上食べる。",
		says : "「おまーんじゅう！おまーんじゅう！」",
		icon_location : "images/touzoku/icon/golden.png",
	},
	achievement_biscla20 : {
		title : "百獣の王",
		description : "ビスクラをlv20にする。",
		says : "「やったニャー！就職先決まったニャー！」",
		icon_location : "images/touzoku/icon/biscla.png",
	},
	achievement_eater20 : {
		title : "がんばりやさん",
		description : "擬人型チアリーイーターをlv20にする。",
		says : "「食べちゃうぞー(つまみ食い)。」",
		icon_location : "images/touzoku/icon/gijinka_eater.png",
	},
	achievement_el20 : {
		title : "カンスト",
		description : "エルをlv20にする。",
		says : "「やったな！おめっとさん！」",
		icon_location : "images/touzoku/icon/el.png",
	},
	achievement_clucky20 : {
		title : "ファンクラブ入会",
		description : "クラッキーをlv20にする。",
		says : "「あ、ありがと...」",
		icon_location : "images/touzoku/icon/clucky.png",
	},
	achievement_ukokkei20 : {
		title : "大富豪",
		description : "富豪っちをlv20にする。",
		says : "「ｺｺｺｺｺｺｺｺｺｺｺｺ...!!!!」",
		icon_location : "images/touzoku/icon/ukokkei.png",
	},
	achievement_etafle20 : {
		title : "とけないこおり",
		description : "エタフレをlv20にする。",
		says : "(あの燃えないおまんじゅう結局何で作られてたんだろう...)",
		icon_location : "images/touzoku/icon/etafle.png",
	},
	achievement_domo20 : {
		title : "救済",
		description : "ドモヴォーイをlv20にする。",
		says : "「富豪」「計算を間違えたかね...」「富豪」「計算を間違えたかね...」",
		icon_location : "images/touzoku/icon/domo.png",
	},
	achievement_puka20 : {
		title : "ぺたんこ",
		description : "プーカをlv20にする。",
		says : "「アーサー...そっちじゃない...」",
		icon_location : "images/touzoku/icon/puka.png",
	},
	achievement_utahime20 : {
		title : "嫁入り",
		description : "歌姫アーサーをlv20にする。",
		says : "「あ、アーサー、今日はちょっと、お料理練習してきて...アーサーに食べて欲しいなって...」",
		icon_location : "images/touzoku/icon/utahime.png",
	},
	achievement_enyde20 : {
		title : "正妻",
		description : "エニードをlv20にする。",
		says : "「むむむーむ、むーむむ」",
		icon_location : "images/touzoku/icon/enyde.png",
	},
	achievement_ganeida20 : {
		title : "爆裂魔法",
		description : "ガネイダをlv20にする。",
		says : "「錬金術連打で得られた経験値全部火力に振ったらすごい火力手に入ったんですよ、どうですかアーサー様、え、いらない...?」",
		icon_location : "images/touzoku/icon/ganeida.png",
	},
	achievement_fede20 : {
		title : "フェデルマニア",
		description : "フェデルマをlv20にする。",
		says : "「おおきにー」",
		icon_location : "images/touzoku/icon/fede.png",
	},
	achievement_nimue20 : {
		title : "シュレーディンガー・ハート",
		description : "ニムエをlv20にする。",
		says : "「これで終わりです。ここからが本番です。」",
		icon_location : "images/touzoku/icon/nimue.png",
	},
	achievement_totallevel100 : {
		title : "ルーキー卒業",
		description : "全キャラの合計レベルが100を超える。",
		says : "「きゅいーん！(銅回転)」",
		icon_location : "images/touzoku/icon/lv100.png",
	},
	achievement_totallevel300 : {
		title : "弩級クリア",
		description : "全キャラの合計レベルが300を超える。",
		says : "「きゅいーん！(銀回転)」",
		icon_location : "images/touzoku/icon/lv300.png",
	},
	achievement_totallevel500 : {
		title : "プロアーサー",
		description : "全キャラの合計レベルが500を超える。",
		says : "「きゅいーん！(金回転)」",
		icon_location : "images/touzoku/icon/lv500.png",
	},
}

var siso_data = {
	siso_plain : {
		value : 1,
		image_location : "images/touzoku/sisos/siso.png",
	},
	siso_cookie : {
		value : 20,
		image_location : "images/touzoku/sisos/cookie.png",
	},
	siso_vanilla : {
		value : 70,
		image_location : "images/touzoku/sisos/vanilla.png",
	},
	siso_great : {
		value : 2300,
		image_location : "images/touzoku/sisos/great.png",
	},
	siso_strawberry : {
		value : 20000,
		image_location : "images/touzoku/sisos/strawberry.png",
	},
	siso_golden : {
		value : 2000000,
		image_location : "images/touzoku/sisos/golden.png",
	},
	siso_eta : {
		value : 4511000,
		image_location : "images/touzoku/sisos/golden.png",
	},
	siso_domo : {
		value : 1013000000,
		image_location : "images/touzoku/sisos/golden.png",
	},
	siso_puka : {
		value : 3798400000000,
		image_location : "images/touzoku/sisos/golden.png",
	},
	siso_uta : {
		value : 711111322300000,
		image_location : "images/touzoku/sisos/golden.png",
	},
	siso_eni : {
		value : 1654000000000000000,
		image_location : "images/touzoku/sisos/golden.png",
	},
	siso_gane : {
		value : 500000000000000000000,
		image_location : "images/touzoku/sisos/golden.png",
	},
	siso_fede : {
		value : 8.324324324322E+23,
		image_location : "images/touzoku/sisos/golden.png",
	},
	siso_nimue : {
		value : 2E+29,
		image_location : "images/touzoku/sisos/golden.png",
	},
}

var random_message = [
"少しねむくなってきました...",
"おまんじゅうはちゃんと箱詰めされてブリテン全域に出荷していますよ！",
"実績はちゃんと埋めてます？5個埋めれば効率100%上昇ですよ！",
"リセットするときにはお使いのブラウザのcookieを消してくださいね！",
"スマホで遊ぶと6~7キャラくらいで重くなってきて辛いですよ、PC推奨です！",
"ときたま金のおまんじゅうが浮かんできます！一気に稼げるので見つけたら即タップです！",
"金のおまんじゅうは、完全に消えない限りいつ取っても同じだけ稼げますよー！",
"衛生管理とか何も考えてないんですが、大丈夫なのかな...",
]

//生産の進捗 (おまんじゅう作るパワー)を記録
var siso_progress = {}

//前回のお知らせ掲載から何秒経過したか
var no_message_count = 0;

//次に優先して喋らせたい言葉
var message_queue = [];

//ランダム用
function getRandomInt(min, max) {
	return Math.floor( Math.random() * (max - min + 1) ) + min;
}

//大きすぎる数値は略記する
//自作略記エンジン
// 999→999 , 1234→1.234k , 65432→65.43k , 10^9→1g
function formatNumeral(num, roundto){

	//IEだと実引数に初期値を与えたら死んだので一旦固定
	var roundto=3;


	//キロ、メガ、ギガ... aa,bb,cc は仮表記
	var SUFFIXES = ["","k","m","g","t","p","e","z","y","aa","bb","cc","dd","ee","ff","gg","hh"]

	//10^x 9999→3, 10000→4
	var digit = Math.floor(Math.log(num) * Math.LOG10E);

	//どの接尾辞になるかのインデックス
	var index = Math.floor(digit/3);

	//23000 → (2.3 * 10) * k としたい 1000単位で丸めたあまりの指数 
	var mod = digit % 3;

	// 切り捨て丸め計算 + modぶんの乗算
	// 123456 → 123 にしたい("k"はこれまでに計算済)
	// 123456 → 1.23456 → 123.456 → 123
	// 浮動小数の計算誤差を回避するために指数計算をいっぺんに行っているので読みにくい
	var app = Math.floor(num*Math.pow(10,roundto) / Math.pow(10,digit)) / Math.pow(10,roundto-mod); 

	// 123 + "k" → "123k" にフォーマットして返す
	return  app+ SUFFIXES[index];
}


//
// 変数(セーブデータ)
//
var save_data = {
	level : {
		character_biscla : 1,
		character_eater : 0,
		character_el : 0,
		character_clucky : 0,
		character_ukokkei : 0,
		character_etafle : 0,
		character_domo : 0,
		character_puka : 0,
		character_utahime : 0,
		character_enyde : 0,
		character_ganeida : 0,
		character_fede : 0,
		character_nimue : 0,
	},
	tutorial_message_state : 0,
	score : 0,
	total_click : 0,
	golden_total_click : 0,
	achievements : {
		achievement_biscla20 : 0,
		achievement_eater20 : 0,
		achievement_el20 : 0,
		achievement_clucky20 : 0,
		achievement_ukokkei20 : 0,
		achievement_etafle20 : 0,
		achievement_domo20 : 0,
		achievement_puka20 : 0,
		achievement_utahime20 : 0,
		achievement_enyde20 : 0,
		achievement_ganeida20 : 0,
		achievement_fede20 : 0,
		achievement_nimue20 : 0,
		achievement_totalclick100 : 0,
		achievement_goldenclick10 : 0,
		achievement_totallevel100 : 0,
		achievement_totallevel300 : 0,
		achievement_totallevel500 : 0,
	},
}


//
// 状態を変化させる関数
//

//金クッキーを表示
function spawn_golden_cookie(){
	var rand_top = getRandomInt(1,500);
	var rand_left = getRandomInt(1,270);
	$("#golden_cookie").css({"top":rand_top,"left":rand_left,"opacity":1})
	$("#golden_cookie").removeClass("hide");
}

//金クッキー表示判定
function golden_cookie_check(){
	var rand = Math.random();
	var threshold = 1 / FREQ_GOLDEN_COOKIE_SPAWN_SEC;
	if(rand < threshold){
		spawn_golden_cookie();
	}
}

//今雇うボタンを押すことができるか?
function can_hire(){
	var character_name = 	$("#item_detail_area").attr("selecting");
	var character_info = character_data[character_name];
	var current_character_level = save_data.level[character_name];
	var cost = Math.floor(character_info.cost * Math.pow(VALUE_INCREASE_RATE, (current_character_level)));

	return save_data.score >= cost;
}

//雇うボタンが押せるかどうかによって状態遷移
function check_button_state(){
	//雇うボタンの可否を確認
	if(can_hire()){
		$("#item_detail_hire_button").addClass("available");
	}
	else{		
		$("#item_detail_hire_button").removeClass("available");
	}
}

//画面上にどのレベルまでのキャラを表示するかチェックし、更新
//実績表示も同時に開放する
function update_character_show_state(){
	for(s in save_data.level){
		if(save_data.level[s] > 0){
			//クソなのはわかってる
			var chara_name = s.split("_")[1];
			$("#frame_"+chara_name).removeClass("hide");
			$("#achievement_"+chara_name+"20").removeClass("hide");
		}
	}
}

//画面上のキャラレベルを更新する
function update_menu_character_level(){
	for(s in save_data.level){
		var lv = save_data.level[s];
		if(lv > 0){
			$("#"+s).removeClass("hide_from_character_list")
			$("#"+s).find(".hire_item_level").text(lv);
		}
		else{
			$("#"+s).addClass("hide_from_character_list")
		}
	}
	//次のLv0キャラクターは表示する
	$(".hide_from_character_list:first").removeClass("hide_from_character_list");
}

//キャラ詳細エリアの画面更新 target_id のものに切り替える
function update_detail_area(target_id){
	var character_name = target_id;
	var character_info = character_data[character_name];
	var current_character_level = save_data.level[character_name];
	var cost = Math.floor(character_info.cost * Math.pow(VALUE_INCREASE_RATE, (current_character_level)));

	//選択中のキャラの名前を記憶しておく
	$("#item_detail_area").attr("selecting",character_name);

	$("#item_detail_character_name").text(character_info.name);
	$("#item_detail_sps").text(formatNumeral(character_info.sps));
	$("#item_detail_character_image").attr("src", character_info.icon_location);
	$("#item_detail_character_text").text(character_info.detail);
	$("#item_detail_character_cost").text(formatNumeral(cost));

	//lv0なら - と表示
	var lv_text = current_character_level==0?"-":current_character_level;
	$("#item_detail_character_level").text(lv_text);
}

function get_cleared_achievement_amount(){
	var cleared_num = 0;
	for(a in save_data.achievements){
		if(save_data.achievements[a] ==1){
			cleared_num += 1;
		}
	}
	return cleared_num;
}

 //実績の詳細を表示切り替え
function update_achievement_detail_area(target_id){
	var achievement_name = target_id;
	var detail = achievement_data[achievement_name];

	$("#achievement_title").text(detail.title);
	$("#achievement_description").text(detail.description);
	$("#achievement_says").text(detail.says);
	$("#achievement_icon").attr("src", detail.icon_location);

	if(save_data.achievements[achievement_name] == 1){
		$("#achievement_iscleared").text("達成！");
	}
	else{
		$("#achievement_iscleared").text("未達成");
	}

	//実績クリア率チェック
	var cleared_num = get_cleared_achievement_amount();

	$("#cleared_achievements").text(cleared_num);
	$("#production_multiplier").text(cleared_num * 20);

}


//実績のクリア状況を画面に反映する
function update_achievement_clear_state(){
	for(s in save_data.achievements){
		if(save_data.achievements[s] > 0){
			$("#"+s).addClass("cleared_achievement");
		}
	}
}

//各実績のクリアチェックを行う
function check_achievement_clear(){
	//20lv系, 合計レベル
	var total_lv = 0;
	for(s in save_data.level){
		total_lv += save_data.level[s];
		if(save_data.level[s] >= 20){
			var character_name = s.split("_")[1];
			save_data.achievements["achievement_"+character_name+"20"] = 1;
		}
	} 

	//合計レベル
	if(total_lv >= 100 && save_data.achievements.achievement_totallevel100 == 0){
		save_data.achievements.achievement_totallevel100 = 1;
	}
	if(total_lv >= 300 && save_data.achievements.achievement_totallevel300 == 0){
		save_data.achievements.achievement_totallevel300 = 1;
	}
	if(total_lv >= 500 && save_data.achievements.achievement_totallevel500 == 0){
		save_data.achievements.achievement_totallevel500 = 1;
	}

	//トータルクリック
	if(save_data.achievements.achievement_totalclick100 ==0 && save_data.total_click >= 100){
		save_data.achievements.achievement_totalclick100 = 1;		
	}

	//金クッキー回収
	if(save_data.achievements.achievement_goldenclick10 ==0 && save_data.golden_total_click >= 10){
		save_data.achievements.achievement_goldenclick10 = 1;		
	}
}

//トータルレベル系実績の表示制御
function update_totallevel_achievement_show(){
	if(save_data.achievements.achievement_totallevel100 == 1 && $("#achievement_totallevel300").hasClass("hide")){
		$("#achievement_totallevel300").removeClass("hide")
	}
	if(save_data.achievements.achievement_totallevel300 == 1 && $("#achievement_totallevel500").hasClass("hide")){
		$("#achievement_totallevel500").removeClass("hide")
	}
}


//スコアを加算する
function add_score(value){
	//実績ボーナスで倍率をかける
	var production_multiplier = 1 + (get_cleared_achievement_amount()*0.2);

	save_data.score += Math.floor(value * production_multiplier);
	$('#score').text(formatNumeral(save_data.score))
}

//まんじゅうの移動関連
function move_siso(){
	$(".siso").each(function(){
		var now_left = parseFloat($(this).css("left").slice(0,-2));
		var now_top = parseFloat($(this).css("top").slice(0,-2));

		var mv_left = 200 * UPDATE_FREQ_MS/1000;
		var mv_top = 73 * UPDATE_FREQ_MS/1000;

		$(this).css("left",now_left-mv_left+"px");
		$(this).css("top",now_top+mv_top+"px");

		if(now_left < 10){
			//ギリギリになると消え始める
			var now_opacity = parseFloat($(this).css("opacity"));
			//console.log(now_opacity)
			$(this).css("opacity",now_opacity-0.3);

			//消えきったまんじゅうはDOMから削除する
			if(now_opacity <= 0){
				var value = parseFloat($(this).attr("value"));				
				add_score(value);
				$(this).remove();
			}
		}
	});
}

//ふきだしにメッセージを追加
function cast_message(sentence){
	console.log(sentence);
	$("#message_area").text(sentence);
	message_show();
	no_message_count = 0;
}

//1文字ずつ文字を流す
function message_show(){
// ここで文字を<span></span>で囲む
$('#message_area').children().andSelf().contents().each(function() {
	if (this.nodeType == 3) {
		$(this).replaceWith($(this).text().replace(/(\S)/g, '<span>$1</span>'));
	}
});
// 一文字ずつフェードインさせる
$('#message_area').css({'opacity':1});
for (var i = 0; i <= $('#message_area').children().size(); i++) {
	$('#message_area').children('span:eq('+i+')').delay(30*i).animate({'opacity':1},50);
};
}

//メッセージが規定時間流れなかったら表示する
function message_check(){

	no_message_count++;

	//まだだったら返す
	if(no_message_count < MESSAGE_CAST_FREQ){
		return;
	}
	//回数をインクリメントしながらメッセージを流す
	switch(save_data.tutorial_message_state++){
		case 0:
			cast_message("左上の「menu▷」ボタンを押すと工場に新しい仲間を呼べます！");
			break;
		case 1:
			cast_message("「1分経つ」か「誰かをレベルアップさせる」とセーブします！安心してくださいねっ");
			break;
		case 2:
			cast_message("「sps」は平均で1秒あたりに増える在庫です！どんどんレベルアップして効率を上げてくださいね");
			break;
		case 3:
			cast_message("キャラによってはなかなか生産しない子もいますが、その分一度にたくさん在庫が増えますよ");
			break;
		case 4:
			cast_message("メニュー内の実績タブも要チェックです！クリア数によってspsにボーナスがかかりますよ");
			break;
		case 5:
			cast_message("それでは、がんばってくださいね、アーサー！");
			break;
		default:
			cast_random();
			break;
	}

}

//ランダムメッセージを放流、キューに何かあったらその内容を喋る
function cast_random(){
	//もしキューに何かあればそれを喋って終わる
	if(message_queue.length > 0){
		cast_message(message_queue.shift());
		return;
	}

	//10%で在庫に関するセリフ
	if(Math.random() < 0.2){
		cast_message(get_message_for_stock());
		return;
	}

	//のこりの90%中11% = 全体としてだいたい10%でSPSに関するセリフ
	if(Math.random() < 0.25){
		cast_message(get_message_for_sps());
		return;
	}

	//完全に何もない場合のランダムメッセージ
	var message = random_message[getRandomInt(0,random_message.length-1)];
	cast_message(message);

}

//現在の在庫数に関してコメントを返す
function get_message_for_stock(){
	var digit = Math.floor(Math.log(save_data.score) * Math.LOG10E);

	switch(true){
		case digit<3:
			return "工場内に収まりきるくらいの在庫ですね！もっともっと作りましょう！";
		case digit<6:
			return "工場らしい生産量になりましたねー！";
		case digit<9:
			return "ブリテン全域に配っても余るくらいですかね? 結構たくさん作りました！";
		case digit<12:
			return "なんというか、ここまで在庫が増えると意味がわからなくなってきますね...";
		case digit<15:
			return "おまんじゅうとは、おまんじゅうとは何なんですかね...";
		case digit<20:
			return "きっとウチが今世界で一番大きなおまんじゅう工場ですよ！";
		case digit<30:
			return "にぎやかになりましたねー... 遊んでくれて、本当にありがとうございます！";
		default:
			return "え、あれ?何でそんなに持ってるんですか?今の設計だと持ちようがない数なんですが...";
	}
}

//現在のSPSに関してコメントを返す
function get_message_for_sps(){
	var sps = calc_sps();
	var digit = Math.floor(Math.log(sps) * Math.LOG10E);
	switch(true){
		case digit<3:
			return "じゃんじゃん作りますよー！";
		case digit<6:
			return "大型工場ならこれくらいは作らないと満足できませんよねー！";
		case digit<9:
			return "もはやブリテンいちの工場ですね！";
		case digit<12:
			return "カップヌードルが累計で400m食販売したそうですよ！もう私達のほうが上ですね！";
		case digit<15:
			return "バイトじゃなければ私も大儲けしていたんだろうなあ...";
		case digit<20:
			return "もうこれは宇宙一の工場ですね！";
		case digit<30:
			return "(自動でヨタ単位のおまんじゅうを生成できるのに何で私がここに...?)";
		default:
			return "え、あれ?何でそんなに生産できるんです?天文学的な時間をかけないと到達できませんよね?";
	}

}


//次のメッセージ更新タイミングで喋ってもらう
function queue_message(message){
	message_queue.push(message);
}


//まんじゅうを制作
function create_siso(name,level){
	//console.log("create siso(" + name + "), lv="+level);

	siso_info = siso_data[name];
	value = siso_info.value * level;
	im_location = siso_info.image_location;

	$("#siso_list").append('<li class="siso" value="'+value+'"><img class="siso_image" src="'+im_location+'"></li>');
	//今追加したアイテムの初期位置をいじる
	$(".siso:last").css("top", getRandomInt(-13,10)+"px");
}

function update_siso_progress(){
	//おまんじゅう作るパワーを加算
	for(c in character_data){
		//ないなら初期化
		if(typeof siso_progress[c] === "undefined" ){
			siso_progress[c] = 0;
		}

		if(save_data.level[c] == 0){
			continue;
		}

		var add_value = character_data[c].sps  * UPDATE_FREQ_MS/1000 ;
		siso_progress[c] += add_value;
	}	

	//パワーが溜まったキャラがいたら消費しておまんじゅうを生産
	for(c in character_data){

		var siso_cost = siso_data[character_data[c].creates].value;
		while(siso_progress[c] > siso_cost){
			//レベル分だけ価値を増幅しておまんじゅうを生産
			create_siso(character_data[c].creates,save_data.level[c]);
			siso_progress[c] -= siso_cost;
		}
	}
}

//sps値の更新・反映
function calc_sps(){

	check_achievement_clear();

	var sps = 0;
	for(c in character_data){
		sps += character_data[c].sps * save_data.level[c];
	}

	//実績ボーナス
	var production_multiplier = 1 + (get_cleared_achievement_amount() * 0.2);

	var total_sps =Math.floor(sps *  production_multiplier);

	$("#sps").text(formatNumeral(total_sps));
	return total_sps;
}

function get_sps(){
	var sps = 0;
	for(c in character_data){
		sps += character_data[c].sps * save_data.level[c];
	}

	//実績ボーナス
	var production_multiplier = 1 + (get_cleared_achievement_amount() * 0.2);

	var total_sps =Math.floor(sps *  production_multiplier);

	return total_sps;
}

function decay_golden_cookie(){
	//見えてないときは処理しない
	if($("#golden_cookie").hasClass("hide")){
		return;
	}

	var opacity = $("#golden_cookie").css("opacity");
	$("#golden_cookie").css("opacity",opacity - 0.001);

	if(opacity <= 0){
		$("#golden_cookie").addClass("hide");
	}
}

//毎フレームの更新
function update(){
	check_button_state();
	move_siso();
	update_siso_progress();
	decay_golden_cookie();
	update_achievement_clear_state();
}

//クッキーに記憶
function save(){
	$.cookie("save",save_data);
	console.log($.cookie("save"))
}

//各レコードNaNチェックを入れる
function is_valid_save(savefile){
	//不正値チェック
	for(lv in savefile.level){
		if(isNaN(savefile.level[lv])){
			cast_message(lv + " : "+ savefile.level[lv] + "が不正でしたー")
			return false;
		}
	}
	if(isNaN(savefile.score)){
		cast_message("おまんじゅう在庫が不正でしたー")
		return false;
	}
	return true;
}

//クッキーから呼び出し(ないなら初期化)
function load_save(){
	var savefile = $.cookie("save");
	if(typeof savefile === "undefined"){
		cast_message("はじめまして、こんにちは！私の手元のボタンを押すとおまんじゅうを作れますよ！");
	}
	else{
		if(is_valid_save	(savefile)){
			save_data = savefile;
			cast_message("セーブデータ読み込みに成功！おかえりなさい、アーサー！");
		}
		else{
			cast_message("セーブデータがなんかダメっぽいですねー... クッキー消してやり直してください");
		}
		console.log(savefile);
	}
}

//10ミリ秒ごとに少しずつ動かす
window.setInterval(update,UPDATE_FREQ_MS);
window.setInterval(save,SAVE_FREQ_MS);
window.setInterval(golden_cookie_check,1000);
window.setInterval(message_check,1000);

//
// ボタンに対する反応
//

//メニューを開く
$("#menu_button").click(function(){
	$("#menu").removeClass("collapse");
});

//メニューを閉じる
$("#menu_collapse_button").click(function(){
	$("#menu").addClass("collapse");
});

//レバークリックでまんじゅうを生産
$("#make_button").click(function(){
	//クリック数インクリメント
	save_data.total_click += 1;

	//クリック数上昇で実績達成→SPS上昇があり得るので再計算
	calc_sps();

	create_siso("siso_plain",1);
});

//選択中のキャラクター切り替え
$(".hire_character").click(function(){
	update_detail_area(this.id);
});

//金クッキー回収
$("#golden_cookie").click(function(){
	check_achievement_clear();

	var sps =get_sps();
	var value = sps * getRandomInt(80,220) + getRandomInt(1,1000)
	var formatted = formatNumeral(value)

	//お金二倍
	cast_message("金のおまんじゅうを拾いました！" + formatted +" 個のおまんじゅうを手に入れましたよ！");
	add_score(value);
	save_data.golden_total_click += 1;
	$(this).addClass("hide");
});

//雇うボタンを押した際の処理
$("#item_detail_hire_button").click(function(){
	//無効なら何もしない
	if(!can_hire()){
		return;
	}

	var character_name = 	$("#item_detail_area").attr("selecting");
	var character_info = character_data[character_name];
	var current_character_level = save_data.level[character_name];
	var cost = Math.floor(character_info.cost * Math.pow(VALUE_INCREASE_RATE, (current_character_level)));

	save_data.score -= cost;
	save_data.level[character_name] ++;

	//初回、20lv到達時には専用セリフをqueueに入れる
	if(save_data.level[character_name] ==1){
		queue_message(character_data[character_name].lv1_hire_message);
	}
	if(save_data.level[character_name] ==3){
		queue_message(character_data[character_name].lv3_hire_message);
	}
	if(save_data.level[character_name] ==20){
		queue_message(character_data[character_name].lv20_hire_message);
	}

	$('#score').text(formatNumeral(save_data.score));

	update_detail_area(character_name);

	update_character_show_state();
	update_menu_character_level();
	calc_sps();

	save();
});

//レベルアップタブと実績タブ切り替え
$("#achievement_tab_button").click(function(){
	check_achievement_clear();
	update_achievement_detail_area("achievement_biscla20");
	update_totallevel_achievement_show();
	$("#achievement_menu").removeClass("hide");
	$("#hire_menu").addClass("hide");
});

$("#hire_tab_button").click(function(){
	$("#achievement_menu").addClass("hide");
	$("#hire_menu").removeClass("hide");
});

//実績タブの詳細表示切り替え
$(".achievements").click(function(){
	update_achievement_detail_area(this.id)
});

//キャラゆらゆら

$(function(){
	$('#frame_touzoku').yurayura( {
		'move' : 2,
		'delay' : 400,
		'duration' : 1300
	} );
	$('#frame_biscla').yurayura( {
		'move' : 1,
		'delay' : 200,
		'duration' : 400
	} );
	$('#frame_el').yurayura( {
		'move' : 5,
		'delay' : 800,
		'duration' : 3000
	} );
	$('#frame_ukokkei').yurayura( {
		'move' : 2,
		'delay' : 100,
		'duration' : 500
	} );
	$('#frame_clucky').yurayura( {
		'move' : 1,
		'delay' : 400,
		'duration' : 1300
	} );
	$('#frame_eater').yurayura( {
		'move' : 2,
		'delay' : 700,
		'duration' : 1300
	} );
	$('#frame_etafle').yurayura( {
		'move' : 2,
		'delay' : 700,
		'duration' : 1600
	} );
	$('#frame_domo').yurayura( {
		'move' : 2,
		'delay' : 700,
		'duration' : 2000
	} );
	$('#frame_puka').yurayura( {
		'move' : 1,
		'delay' : 2000,
		'duration' : 1300
	} );
	$('#frame_utahime').yurayura( {
		'move' : 3,
		'delay' : 200,
		'duration' : 1000
	} );
	$('#frame_enyde').yurayura( {
		'move' : 2,
		'delay' : 700,
		'duration' : 1300
	} );
	$('#frame_ganeida').yurayura( {
		'move' : 1,
		'delay' : 700,
		'duration' : 3300
	} );
	$('#frame_fede').yurayura( {
		'move' : 5,
		'delay' : 700,
		'duration' : 3100
	} );
	$('#frame_nimue').yurayura( {
		'move' : 3,
		'delay' : 100,
		'duration' : 5300
	} );
});		


//
// 画面初期表示
//

$(document).ready(function(){
	//セーブ読み込み
	load_save();

	//表示を初期化
	update_detail_area("character_biscla");
	calc_sps();
	update_character_show_state();
	update_menu_character_level();
	update_achievement_detail_area("achievement_biscla20");
	update_totallevel_achievement_show();
});

