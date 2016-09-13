//
// 各種定数
//

//購入ごとに商品価格がどれだけ上昇するか
var VALUE_INCREASE_RATE = 1.2;

var character_data = {
	"character_biscla" : {
		cost : 100,
		sps : 10,
		name : "ビスクラヴレット",
		detail : "クッキーを焼いてくれるかわいい人狼。おまんじゅう工場の副産物にどうぞ。",
		icon_location : "images/touzoku/icon/biscla.png",
		creates : "siso_cookie",
	},
	"character_scathach" : {
		cost : 700,
		sps : 60,
		name : "スカアハ",
		detail : "CV:坂本真綾。バニラ味のおまんじゅうを蒸してくれる。珍しいので少し高く売れる。",
		icon_location : "images/touzoku/icon/scathach.png",
		creates : "siso_vanilla",
	},
	"character_el" : {
		cost : 12000,
		sps : 800,
		name : "エル",
		detail : "ちーっす。基本ちょっかいしか出さないが、高級なしそﾒﾛﾝｸﾘｰﾑまんじゅうをたまに作る。",
		icon_location : "images/touzoku/icon/biscla.png",
		creates : "siso_great",
	},
	"character_clucky" : {
		cost : 460000,
		sps : 7000,
		name : "クラッキー",
		detail : "まじめに働くので生産効率が良い。イチゴ味のおまんじゅうを手で握って作る。もちろん大きなお友達に高く売れる。",
		icon_location : "images/touzoku/icon/scathach.png",
		creates : "siso_strawberry",
	},
	"character_ukokkei" : {
		cost : 10000000,
		sps : 200000,
		name : "富豪っち",
		detail : "金のおまんじゅうを産む。",
		icon_location : "images/touzoku/icon/biscla.png",
		creates : "siso_golden",
	}
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

//
// 変数(セーブデータ)
//
var save_data = {
	level : {
		character_biscla : 1,
		character_scathach : 0,
		character_el : 0,
		character_clucky : 0,
		character_ukokkei : 0,
	}
}


//
// 状態を変化させる関数
//

//今雇うボタンを押すことができるか?
function can_hire(){
	var character_name = 	$("#item_detail_area").attr("selecting");
	var character_info = character_data[character_name];
	var current_character_level = save_data.level[character_name];
	var cost = Math.floor(character_info.cost * Math.pow(VALUE_INCREASE_RATE, (current_character_level)));

	var current_siso_value = parseFloat($("#score").text());

	return current_siso_value >= cost;
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

//キャラ詳細エリアの画面更新 target_id のものに切り替える
function update_detail_area(target_id){
	var character_name = target_id;
	var character_info = character_data[character_name];
	var current_character_level = save_data.level[character_name];
	var cost = Math.floor(character_info.cost * Math.pow(VALUE_INCREASE_RATE, (current_character_level)));

	//選択中のキャラの名前を記憶しておく
	$("#item_detail_area").attr("selecting",character_name);

	$("#item_detail_character_name").text(character_info.name);
	$("#item_detail_sps").text(character_info.sps);
	$("#item_detail_character_image").attr("src", character_info.icon_location);
	$("#item_detail_character_text").text(character_info.detail);
	$("#item_detail_character_cost").text(cost);

	//lv0なら - と表示
	var lv_text = current_character_level==0?"-":current_character_level;
	$("#item_detail_character_level").text(lv_text);
}

//スコアを加算する
var add_score = function(value){
	var now = parseFloat($("#score").text());
	$("#score").text(now + value);
}

//まんじゅうの移動関連
var move_siso = function(){
	$(".siso").each(function(){
		var now_left = parseFloat($(this).css("left").slice(0,-2));
		var now_top = parseFloat($(this).css("top").slice(0,-2));
		$(this).css("left",now_left-2+"px");
		$(this).css("top",now_top+0.41+"px");

		if(now_left < 10){
			//ギリギリになると消え始める
			var now_opacity = parseFloat($(this).css("opacity"));
			//console.log(now_opacity)
			$(this).css("opacity",now_opacity-0.1);

			//消えきったまんじゅうはDOMから削除する
			if(now_opacity <= 0){
				var value = parseFloat($(this).attr("value"));
				add_score(value);
				$(this).remove();
			}
		}
	});
}

//まんじゅうを制作
function create_siso(name,level){
	console.log("create siso(" + name + "), lv="+level);

	siso_info = siso_data[name];
	value = siso_info.value * level;
	im_location = siso_info.image_location;

	$("#siso_list").append('<li class="siso" value="'+value+'"><img class="siso_image" src="'+im_location+'"></li>');
	//今追加したアイテムの初期位置をいじる
	$(".siso:last").css("top", getRandomInt(-20,30)+"px");
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

		var add_value = character_data[c].sps /100 ;
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

//毎フレームの更新
function update(){
	check_button_state();
	move_siso();
	update_siso_progress();
}

//10ミリ秒ごとに少しずつ動かす
window.setInterval(update,10);


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
$("#lever").click(function(){
	create_siso("siso_plain",1);
});

//選択中のキャラクター切り替え
$(".hire_character").click(function(){
	update_detail_area(this.id);
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

	var current_siso_value = parseFloat($("#score").text());

	var after_siso_value = current_siso_value - cost;
	save_data.level[character_name] ++;

	$("#score").text(after_siso_value);

	update_detail_area(character_name);
	calc_sps();
});

//
// 画面初期表示
//

$(document).ready(function(){
	update_detail_area("character_biscla");
	calc_sps();
});

