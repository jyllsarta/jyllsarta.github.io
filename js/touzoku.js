
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
var FREQ_GOLDEN_COOKIE_SPAWN_SEC = 300;

//数値表記ルール
var NUMERAL_FORMAT = "000.00a";

var character_data = {
	"character_biscla" : {
		cost : 100,
		sps : 5,
		name : "ビスクラヴレット",
		detail : "クッキーを焼いてくれるかわいい人狼。おまんじゅう工場の副産物にどうぞ。",
		icon_location : "images/touzoku/icon/biscla.png",
		creates : "siso_cookie",
	},
	"character_eater" : {
		cost : 700,
		sps : 30,
		name : "擬人型ﾁｱﾘｰｲｰﾀｰ",
		detail : "たべちゃうぞー。バイトをはじめた。仕事はする。",
		icon_location : "images/touzoku/icon/gijinka_eater.png",
		creates : "siso_vanilla",
	},
	"character_el" : {
		cost : 1000,
		sps : 230,
		name : "エル",
		detail : "ちーっす。基本ちょっかいしか出さないが、高級なしそﾒﾛﾝｸﾘｰﾑまんじゅうをたまに作る。",
		icon_location : "images/touzoku/icon/el.png",
		creates : "siso_great",
	},
	"character_clucky" : {
		cost : 1000,
		sps : 2400,
		name : "クラッキー",
		detail : "まじめに働くので生産効率が良い。イチゴ味のおまんじゅうを手で握って作る。もちろん大きなお友達に高く売れる。",
		icon_location : "images/touzoku/icon/clucky.png",
		creates : "siso_strawberry",
	},
	"character_ukokkei" : {
		cost : 1000,
		sps : 22222,
		name : "富豪っち",
		detail : "金のおまんじゅうを産む。",
		icon_location : "images/touzoku/icon/ukokkei.png",
		creates : "siso_golden",
	},
	"character_etafle" : {
		cost : 1000,
		sps : 22222,
		name : "エタフレちゃん",
		detail : "錬成する。",
		icon_location : "images/touzoku/icon/etafle.png",
		creates : "siso_golden",
	},
	"character_domo" : {
		cost : 1000,
		sps : 22222,
		name : "ドモヴォーイ",
		detail : "天使パワーがすごい",
		icon_location : "images/touzoku/icon/domo.png",
		creates : "siso_golden",
	},
	"character_puka" : {
		cost : 1000,
		sps : 22222,
		name : "プーカ",
		detail : "かわいい",
		icon_location : "images/touzoku/icon/puka.png",
		creates : "siso_golden",
	},
	"character_utahime" : {
		cost : 1000,
		sps : 22222,
		name : "歌姫アーサー",
		detail : "金のおまんじゅうを産む。",
		icon_location : "images/touzoku/icon/utahime.png",
		creates : "siso_golden",
	},
	"character_enyde" : {
		cost : 1000,
		sps : 22222,
		name : "エニード",
		detail : "金のおまんじゅうを産む。",
		icon_location : "images/touzoku/icon/enyde.png",
		creates : "siso_golden",
	},
	"character_ganeida" : {
		cost : 1000,
		sps : 22222,
		name : "ガネイダ",
		detail : "金のおまんじゅうを産む。",
		icon_location : "images/touzoku/icon/ganeida.png",
		creates : "siso_golden",
	},
}

var achievement_data = {
	totalclick100 : {
		title : "見習い卒業",
		description : "100個以上のおまんじゅうをクリックして作成する。",
		says : "「手が疲れたのでシフト上がらせてもらいますね！」",
	},
	bisclavret100 : {
		title : "百獣の王",
		description : "ビスクラをlv100にする。",
		says : "「やったニャー！就職先決まったニャー！」",
	},
	eater100 : {
		title : "がんばりやさん",
		description : "擬人型チアリーイーターをlv100にする。",
		says : "「食べちゃうぞー(つまみ食い)。」",
	},
	el100 : {
		title : "カンスト",
		description : "エルをlv100にする。",
		says : "「やったな！おめっとさん！」",
	},
	clucky100 : {
		title : "ファンクラブ入会",
		description : "クラッキーをlv100にする。",
		says : "「」",
	},
}

var siso_data = {
	siso_plain : {
		value : 1,
		image_location : "images/touzoku/sisos/siso.png",
	},
	siso_cookie : {
		value : 4,
		image_location : "images/touzoku/sisos/cookie.png",
	},
	siso_vanilla : {
		value : 30,
		image_location : "images/touzoku/sisos/vanilla.png",
	},
	siso_great : {
		value : 600,
		image_location : "images/touzoku/sisos/great.png",
	},
	siso_strawberry : {
		value : 5000,
		image_location : "images/touzoku/sisos/strawberry.png",
	},
	siso_golden : {
		value : 1000000,
		image_location : "images/touzoku/sisos/golden.png",
	},
}

//ランダム用
function getRandomInt(min, max) {
	return Math.floor( Math.random() * (max - min + 1) ) + min;
}

//大きすぎる数値は略記する
function formatNumeral(num){
	var digits = Math.log(num)*Math.LOG10E;
	if(digits > 4){
		return numeral(num).format(NUMERAL_FORMAT);
	}
	else{
		return num;
	}
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
	},
	score : 0,
	total_click : 0,
	achievements : {
		bicalavlet100 : 0,
	},
}


//
// 状態を変化させる関数
//

//金クッキーを表示
function spawn_golden_cookie(){
	var rand_top = getRandomInt(1,600);
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
function update_character_show_state(){
	for(s in save_data.level){
		if(save_data.level[s] > 0){
			//クソなのはわかってる
			var chara_name = s.split("_")[1];
			$("#frame_"+chara_name).removeClass("hide");
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


//スコアを加算する
var add_score = function(value){
	save_data.score += value;

	$('#score').text(formatNumeral(save_data.score))
}

//まんじゅうの移動関連
var move_siso = function(){
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
	$("#message_list").append('<li class="message">'+ sentence +'</li>');

	while($(".message").length > 2){
		$(".message")[0].remove();
	}
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


//生産の進捗 (おまんじゅう作るパワー)を記録
var siso_progress = {}

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
	var sps = 0;
	for(c in character_data){
		sps += character_data[c].sps * save_data.level[c];
	}

	$("#sps").text(sps);
}

function decay_golden_cookie(){
	//見えてないときは処理しない
	if($("#golden_cookie").hasClass("hide")){
		return;
	}

	var opacity = $("#golden_cookie").css("opacity");
	$("#golden_cookie").css("opacity",opacity - 0.005);

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

//各実績クリア状況を上から順にチェック
function achievement_clear_check(){
	//なかみをあとでかく
}


//クッキーから呼び出し(ないなら初期化)
function load_save(){
	var savefile = $.cookie("save");
	if(typeof savefile === "undefined"){
		cast_message("セーブデータの読み込みに失敗しました... chromeのローカル環境でしょうか?");
	}
	else{
		if(is_valid_save	(savefile)){
			save_data = savefile;
			cast_message("セーブ読み込みに成功！");
		}
		else{
			cast_message("セーブデータがなんかダメっぽいので初めからにしますー");
		}
		console.log(savefile);
	}

}

//10ミリ秒ごとに少しずつ動かす
window.setInterval(update,UPDATE_FREQ_MS);
window.setInterval(save,SAVE_FREQ_MS);
window.setInterval(golden_cookie_check,1000);

//
// ボタンに対する反応
//

//メニューを開く
$("#menu_button").click(function(){
	console.log("menu open");	
	$("#menu").removeClass("collapse");
});

//メニューを閉じる
$("#menu_collapse_button").click(function(){
	console.log("menu close");	
	$("#menu").addClass("collapse");
});

//レバークリックでまんじゅうを生産
$("#make_button").click(function(){
	create_siso("siso_plain",1);
});

//選択中のキャラクター切り替え
$(".hire_character").click(function(){
	update_detail_area(this.id);
});

//選択中のキャラクター切り替え
$("#golden_cookie").click(function(){
	var sps = parseFloat($("#sps").text());
	var value = sps * getRandomInt(200,300) + getRandomInt(1,1000)

	//お金二倍
	cast_message("金クッキー！" + value +" 個のおまんじゅうを手に入れましたよ！");
	add_score(value);
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

	$('#score').text(formatNumeral(save_data.score));

	update_detail_area(character_name);

	update_character_show_state();
	update_menu_character_level();
	calc_sps();

	save();
});

//レベルアップタブと実績タブ切り替え
$("#achievement_tab_button").click(function(){
	$("#achievement_menu").removeClass("hide");
	$("#hire_menu").addClass("hide");
});
$("#hire_tab_button").click(function(){
	$("#achievement_menu").addClass("hide");
	$("#hire_menu").removeClass("hide");
});

//キャラゆらゆら
/*
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

});		
*/

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

	cast_message("<br><br><br>");
	cast_message("私の手元のボタンを押すとおまんじゅうを作れます！");
});

