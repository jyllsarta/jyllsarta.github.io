
//初期化必要系オブジェクトを一斉に攫って更新しておく
function prepareAllView(){
	updateLoiteringCharactersState()
}

/*******************************************/
/* メイン画面 */
/*******************************************/

//画面の初期表示
function initView(){
	var stage_id = save.current_dungeon_id
	$(".dungeon_name").text(dungeon_data[stage_id].name)
	$("#next_event_sec").text(save.next_event_timer)
	$("#character_siro").css("translateX", data.siro.x)
	$("#character_kuro").css("translateX", data.kuro.x)


	updateCurrentHP()
	updateCurrentLVEXP()
	updateLoiteringCharactersState()
	updateCurrentFloorText()
	updateBackgroundImage()
	updateBackgroundImagePosition()
	updateEpilogueButtonShowState()
	updateOmakeButtonShowState()
	updateIgaBaseColor(save.current_dungeon_id,save.current_landscape_id)
	updateHighScore()
	updateRestMode()
	updateShopButtonShowState()
	updateExtraStageVisitedState()
}

//ゲームモードの切り替え
function updateGameModeTo(game_mode){
	//viewを更新
	$("#title").addClass("hidden")
	$("#stage").addClass("hidden")
	$("#main").addClass("hidden")
	$("#battle").addClass("hidden")
	$("#"+game_mode).removeClass("hidden")
}


function updateCurrentFloorText(){

	var depth = dungeon_data[save.current_dungeon_id].depth

	//最終ダンジョンのぶつ切り感を抑えるために踏破までは2000を見せとく
	if(save.current_dungeon_id ==4 && !save.seen_epilogue){
		depth = 2000
	}

	$("#current_floor").text(save.current_floor)
	$("#max_floor").text(depth)
	///潜り過ぎならoverdepthedをつける
	if(save.current_floor >= depth){
		$("#current_floor").addClass("overdepthed")
	}	
	else{
		$("#current_floor").removeClass("overdepthed")
	}
}

//不在時イベントエリアの残り時間を更新
function updateTimeRemainArea(){
	var hh = Math.floor(save.extra_event_time_remain / 60 / 60)
	var mm = Math.floor(save.extra_event_time_remain / 60 % 60)
	var ss = Math.floor(save.extra_event_time_remain % 60)

	$("#time_remain").text(hh+":"+mm+":"+ss)

}

//不在時イベント残り時間エリアの表示するかどうかを更新
function updateTimeRemainAreaShowState(){
	if(save.extra_event_time_remain == 0){
		$("#extra_event_area").addClass("hidden")
	}
	else{
		$("#extra_event_area").removeClass("hidden")		
	}

}

//次のイベントまでの時刻を表示しているところを更新
function updateNextEventTimer(){
	var sec = save.next_event_timer
	$("#next_event_sec").text(sec)
}

//画面上の数値をreduceValueだけチャリチャリ減らす
function reduceNextEventTimerAnimation(reduceValue){
	var to = Math.max(save.next_event_timer,0)
	$("#next_event_sec").numerator({
		duration : 900,
		toValue : to
	})
}

//背景のスクロール位置を更新
function updateBackgroundImagePosition(){
	var pos = data.background_image_scroll_position
	$("#background_image_bg").css("left","-"+pos*2/3+"px")
	$("#background_image_floor").css("left","-"+pos+"px")
	$("#background_image_fg").css("left","-"+pos+"px")
	$("#background_image_fg").css("top",""+(Math.abs(pos%3-1)*2-2)+"px")
}

//背景の更新
function updateBackgroundImage(){

	//ラスダンの場合背景はランダムに切り替える
	if(save.current_dungeon_id == 4){
		updateBackgroundImageLastDungeon()
		return
	}

	$("#background_image_bg").attr("src","images/neko/bg/st"+save.current_dungeon_id+"-"+save.current_landscape_id+"-0.png")
	$("#background_image_floor").attr("src","images/neko/bg/st"+save.current_dungeon_id+"-"+save.current_landscape_id+"-1.png")
	$("#background_image_fg").attr("src","images/neko/bg/st"+save.current_dungeon_id+"-"+save.current_landscape_id+"-2.png")
	$("#background_image_fg").css("mix-blend-mode",getBackgroundImageOverlayType(save.current_dungeon_id))
}

//ラスダン用のランダム背景切り替え
function updateBackgroundImageLastDungeon(){

		//ラスダンの場合、30Fごとに
		// [landscape順でループ > ID順でループ]する
		//きっかり40Fごとに変わるとバレバレになるので143のオフセットを与えている
		var floor = save.current_floor + 143
		var dungeon = (Math.floor(floor / 10)) % 5
		var landscape = (Math.floor(floor / 50)) % 3

		$("#background_image_bg").attr("src","images/neko/bg/st"+dungeon+"-"+landscape+"-0.png")
		$("#background_image_floor").attr("src","images/neko/bg/st"+dungeon+"-"+landscape+"-1.png")
		$("#background_image_fg").attr("src","images/neko/bg/st"+dungeon+"-"+landscape+"-2.png")
		$("#background_image_fg").css("mix-blend-mode",getBackgroundImageOverlayType(dungeon))
	}

//階段降り時のフェードアウトイン
function fadeOutAndFadeInStairs(){

	//イガイガヨケプレイ中はラグ防止の為処理しない
	if(mini_game_data.is_playing){
		return
	}

	if(data.hyper_event_dash_mode || data.__debughypereventdashmode){
		return
	}

	$("#stairs_fadeouter")
	.delay(2000)
	.removeClass("hidden")
	.animate({
		opacity:1
	},1200,"easeOutQuart")
	.queue(	function(){
		//viewにロジックが書いてあって非常に良くないけど1秒ごとの1pxスクロールと競合し
		//暗転後に景色が変わってる演出ができなくなるので諦める
		var background_pos = randInt(0,2100)
		data.siro.x = randInt(160,700)
		data.kuro.x = randInt(240,600)
		updateLoiteringCharactersState()
		scrollBackgroundImageTo(background_pos)
		updateBackgroundImagePosition()
		updateBackgroundImage()
		updateStairsArea()
		updateIgaBaseColor(save.current_dungeon_id,save.current_landscape_id)
		updateEpilogueButtonShowState()
		updateOmakeButtonShowState()
		$(this).dequeue();
	})
	.animate({
		opacity:0
	},300,"easeOutQuart")
	.queue(	function(){
		$(this).addClass("hidden")
		$(this).dequeue();
	})
}

//古いログを削除
function removeOldLog(){
	while($("#message_logs .log").length > 14){
		$("#message_logs .log")[0].remove()
	}
}

//メッセージを流す
//offset秒数だけ過去の時刻を打刻する
function showMessage(message,offset=0){
	var tag = '<li class="log"><span class="log_time">'+getCurrentTimeString(offset=offset)+'</span>'
	tag += '<span class="log_message">'+message+'</span></li>'
	$("#message_logs").append(tag);
	if ($("#message_logs .log").length > MAX_MESSAGE_ITEM){
		$("#message_logs .log:first-child").remove()
	}
	$("#message_logs .log:last-child")
	.css({
		opacity : 0,
		"margin-left" :"-20px"
	})
	.animate({
		opacity:1,
		"margin-left" :"0px"
	},700,"easeOutQuart")

	//増やした分だけスクロール
	$("#message_log_area").animate(
		{scrollTop:$("#message_log_area")[0].scrollHeight
	},1,"easeOutExpo")
}

//画面内のログ表示エリアにデータを吐く
function castMessage(message){
	//過去のイベントである場合それだけ古い時間を打刻させる
	var past_offset_second = save.extra_event_time_remain

	var delay_time = 150

	if(data.hyper_event_dash_mode || data.__debughypereventdashmode){
		delay_time = 0
	}

	$("#message_log_queue_dummy")
	.delay(delay_time)
	.queue(function(){
		showMessage(message,offset=past_offset_second)
		$(this).dequeue()
	})
}


//あるきまわるキャラたちの状態を反映
function updateLoiteringCharactersState(){
	if(save.status.siro.hp <= 0){
		//しろこ死亡時
		$("#character_siro img").attr("src","images/neko/chara/siro_dead.png")
		.removeClass("character_chip_alive")
		.addClass("character_chip_dead")
	}
	else{
		//しろこ生存
		$("#character_siro img").attr("src","images/neko/chara/siro.png")
		.addClass("character_chip_alive")
		.removeClass("character_chip_dead")
	}

	if(save.status.kuro.hp <= 0){
		//くろこ死亡時
		$("#character_kuro img").attr("src","images/neko/chara/kuro_dead.png")
		.removeClass("character_chip_alive")
		.addClass("character_chip_dead")
	}
	else{
		//くろこ生存
		$("#character_kuro img").attr("src","images/neko/chara/kuro.png")
		.addClass("character_chip_alive")
		.removeClass("character_chip_dead")
	}

	//どっちも死んでたら復活タイマー
	if(!isCharacterAlive()){
		$("#ressurect_count_area").removeClass("hidden")
	}
	else{
		$("#ressurect_count_area").addClass("hidden")		
	}

	$("#character_siro").css("translateX", data.siro.x)
	$("#character_kuro").css("translateX", data.kuro.x)
}

//しろがゆらゆら移動
function  loiteringSiro(){

	//歩行オフなら何もしない
	if(!save.options.enable_loitering){
		return
	}

	if(save.status.siro.hp <= 0){
		//たまーにピクピクする
		if(randInt(1,100) < 5){
			$("#character_siro")	
			.animate({
				translateX : data.siro.x-1
			},40,"linear")
			.animate({
				translateX : data.siro.x
			},20,"linear")
		}
		return
	}


	//[-0.5,0.5]
	var delta = (Math.random()-.5)/8
	data.siro.vx += delta
	//両端に寄り過ぎてるときは逆向きに力を加える
	if (data.siro.x < 160){
		data.siro.vx += 0.1
	}
	if (data.siro.x > 800){
		data.siro.vx -= 0.1
	}

	//振動対策にスピードが乗り過ぎたら減衰させる
	if(Math.abs(data.siro.vx) > 3){
		data.siro.vx /= 2
	}

	//ある程度勢いのあるときのみ移動処理
	if(Math.abs(data.siro.vx) > .3){
		if (data.siro.vx > 0){
			$("#character_siro img").addClass("flip")
		}
		else{
			$("#character_siro img").removeClass("flip")
		}
		data.siro.x += data.siro.vx
		$("#character_siro").css("translateX", data.siro.x)
		$("#character_hitbox_siro").css("translateX",data.siro.x)
	}
	//それ以外の場合はちょっと屈伸してみたりする
	else if(data.frame % 20 ==0 && !$("#character_siro").is(":animated")){
		var y = parseInt($("#character_siro").css("translateY"))
		$("#character_siro").css("translateY",y>0?0:1)
	}
}

function jumpSiro(){

	//動いてる途中か死んでたら反応させない
	if($("#character_siro").is(":animated") || save.status.siro.hp <= 0){
		return
	}

	$("#character_siro")
	.queue(function(){
		$("#character_siro img").attr("src","images/neko/chara/siro_ukya.png")
		$(this).dequeue()
	})
	.animate({
		translateY:-100
	},250,"easeOutSine")
	.animate({
		translateY:0
	},250,"easeInSine")
	.queue(function(){
		$("#character_siro img").attr("src","images/neko/chara/siro.png")
		$(this).dequeue()
	})
}

//くろがゆらゆら移動
function  loiteringKuro(){

	//歩行オフなら何もしない
	if(!save.options.enable_loitering){
		return
	}

	if(save.status.kuro.hp <= 0){
		//たまーにピクピクする
		if(randInt(1,100) < 5){
			$("#character_kuro")	
			.animate({
				translateX : data.kuro.x-1
			},60,"linear")
			.animate({
				translateX : data.kuro.x
			},40,"linear")
		}
		return
	}

	//[-0.5,0.5]
	var delta = (Math.random()-.5)/8
	data.kuro.vx += delta/2
	//両端に寄り過ぎてるときは逆向きに力を加える
	//しろこよりも可動範囲狭め
	if (data.kuro.x < 240){
		data.kuro.vx += 0.2
	}
	if (data.kuro.x > 600){
		data.kuro.vx -= 0.2
	}

	//振動対策にスピードが乗り過ぎたら減衰させる
	if(Math.abs(data.kuro.vx) > 3){
		data.kuro.vx /= 2
	}


	//ある程度勢いのあるときのみ処理
	if(Math.abs(data.kuro.vx) > .3 ){
		if (data.kuro.vx > 0){
			$("#character_kuro img").addClass("flip")
		}
		else{
			$("#character_kuro img").removeClass("flip")
		}
		data.kuro.x += data.kuro.vx
		$("#character_kuro").css("translateX",data.kuro.x)
		$("#character_hitbox_kuro").css("translateX",data.kuro.x)
	}
	//それ以外の場合はちょっと屈伸してみたりする
	else if(data.frame % 20 ==0 && !$("#character_kuro").is(":animated")){
		var y = parseInt($("#character_kuro").css("translateY"))
		$("#character_kuro").css("translateY",y>0?0:1)
	}

}

function jumpKuro(){
	//動いてる途中か死んでたら反応させない
	if($("#character_kuro").is(":animated") || save.status.kuro.hp <= 0){
		return
	}

	$("#character_kuro")
	.queue(function(){
		$("#character_kuro img").attr("src","images/neko/chara/kuro_ukya.png")
		$(this).dequeue()
	})
	.animate({
		translateY:-70
	},250,"easeOutSine")
	.animate({
		translateY:0
	},250,"easeInSine")
	.queue(function(){
		$("#character_kuro img").attr("src","images/neko/chara/kuro.png")
		$(this).dequeue()
	})
}


//自動復活タイマーの更新
function updateAutoRessurectionCount(){
	$("#ressurect_count").text(save.auto_ressurect_timer)
}

//復活演出
function ressurectAnimation(){

	if(data.hyper_event_dash_mode){
		return
	}

	showResurrectSprite()

	$("#ressurection_light")
	.removeClass("hidden")
	.animate({
		opacity:1
	},200,"easeOutQuart")
	.delay(500)
	.queue(	function(){
		updateLoiteringCharactersState()
		updateCurrentHP()
		$(this).dequeue();
	})
	.animate({
		opacity:0
	},500,"linear")
	.queue(	function(){
		$(this).addClass("hidden")
		$(this).dequeue();
	})

	$("#ressurection_overlay")
	.removeClass("hidden")
	.delay(100)
	.animate({
		opacity:0.4
	},100,"easeOutQuart")
	.delay(0)
	.animate({
		opacity:0
	},400,"easeOutQuart")
	.queue(	function(){
		$(this).addClass("hidden")
		$(this).dequeue();
	})

}

//時計を更新
function updateClock(){
	var now = new Date()
	$("#month").text(now.getMonth()+1)
	$("#day").text(now.getDate())
	$("#hour").text(now.getHours())
	$("#minute").text(("0"+now.getMinutes()).slice(-2))
	$("#second").text(("0"+now.getSeconds()).slice(-2))
}

//現在フロア表示をデータ上のものに反映
function updateStairsArea(){

	var depth = dungeon_data[save.current_dungeon_id].depth

	//最終ダンジョンのぶつ切り感を抑えるために踏破までは2000を見せとく
	if(save.current_dungeon_id ==4 && !save.seen_epilogue){
		depth = 2000
	}

	$("#current_floor").text(save.current_floor)
	$("#max_floor").text(depth)
}

//スプライト画像のソースを返す
function getSpliteImageSource(splite_kind){
	switch(splite_kind){
		case "item":
		return "images/neko/sprite/item/all.png"
		break
		case "battle":
		return "images/neko/sprite/battle/all.png"
		break
		case "stairs":
		return "images/neko/sprite/stairs/all.png"
		break
		case "ressurect":
		return "images/neko/sprite/resurrect/all.png"
		break
		case "faily_battle":
		return "images/neko/sprite/faily_battle/all.png"
		break
		case "powder":
		return "images/neko/sprite/powder/all.png"
		break
		case "boss":
		return "images/neko/sprite/boss_battle/all.png"
		break
		default:
		return "images/neko/sprite/"+splite_kind+".png"
		break
	}

}

//右下のセーブしました報告をシャキンってスライドインする
function saveAnimation(){
	$("#save_ticker")
	.delay(2000)
	.removeClass	("hidden")
	.css({opacity:1, translateX:400})
	.animate({
		translateX : 0
	},140,"swing")
	.delay(2000)
	.animate({
		opacity : 0
	},1000,"linear")
	.queue(function(){
		$(this)
		.addClass("hidden")
		.css({translateX : 400})
		.dequeue()
	})

}

//休憩モードの描画更新
function updateRestMode(){
	if(save.rest_now){
		$("#character_siro").addClass("hidden")
		$("#character_kuro").addClass("hidden")

		$("#sit_siro")
		.css("opacity",0)
		.removeClass("hidden")
		.animate({
			opacity:1,
		},500,"easeOutQuart")

		$("#sit_kuro")
		.css("opacity",0)
		.removeClass("hidden")
		.animate({
			opacity:1,
		},500,"easeOutQuart")

		$("#sit_siro_1").addClass("sit_animation_1")
		$("#sit_kuro_1").addClass("sit_animation_1")
		$("#sit_siro_2").addClass("sit_animation_2")
		$("#sit_kuro_2").addClass("sit_animation_2")
		return
	}
	else{
		data.siro.x = 770
		data.kuro.x = 490
		data.siro.vx = 0
		data.kuro.vx = 0
		$("#character_siro").css("translateX", data.siro.x)
		$("#character_hitbox_siro").css("translateX",data.siro.x)
		$("#character_kuro").css("translateX",data.kuro.x)
		$("#character_hitbox_kuro").css("translateX",data.kuro.x)
		$("#character_siro").removeClass("hidden")
		$("#character_kuro").removeClass("hidden")		

		$("#sit_siro")
		.animate({
			opacity:0,
		},500,"easeOutQuart")
		.queue(function () {
			$(this).addClass("hidden").dequeue();
		})
		$("#sit_kuro")
		.animate({
			opacity:0,
		},500,"easeOutQuart")
		.queue(function () {
			$(this).addClass("hidden").dequeue();
		})

		$("#sit_siro_1").removeClass("sit_animation_1")
		$("#sit_kuro_1").removeClass("sit_animation_1")
		$("#sit_siro_2").removeClass("sit_animation_2")
		$("#sit_kuro_2").removeClass("sit_animation_2")
	}

}

/**************************************************/
/************** スプライト関係 *********************/
/**************************************************/

//対応したスプライトがスライドインする
//imagename : image/neko/spriteにおいてあるファイル名
function spriteSlidein(imagename){

	var image_source = getSpliteImageSource(imagename)

	$("#sprite_image")
	.attr("src",image_source)
	.removeClass("hidden")
	.animate({
		opacity:1,
		translateY : 10
	}, 100, "linear")
	.delay(730)
	.animate({
		opacity	:0,
		translateY : 0,
	},100,"linear")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}

//アイテム取得スプライトを初期状態に戻す
function resetItemSprite(){
	$("#item_sprite").addClass("hidden")
	$("#sprite_item_background").css("opacity",0)
	$("#item_sprite").css({
		translateY:-30,
		opacity:0		
	})
	$("#sprite_item_treasure").css({
		translateY:-10,
		opacity:0		
	})
	$("#sprite_item_kuro").css({
		translateY:-10,
		opacity:0		
	})
	$("#sprite_item_siro").css({
		translateY:-10,
		opacity:0		
	})
	$("#sprite_item_text").css({
		translateY:-10,
		opacity:0		
	})
}

//アイテム取得スプライトをスライドインする
function showItemSprite(){

	//ミニゲームプレイ中も一切スプライトを出さない
	if(mini_game_data.is_playing){
		return
	}

	//イベント超速再生中は一切スプライトをを出さない
	if(data.hyper_event_dash_mode){
		return
	}

	//イベントアニメオフなら一枚絵出して終わり
	if(!save.options.enable_event_animation){
		spriteSlidein("item")
		return
	}


	resetItemSprite()
	$("#item_sprite").removeClass("hidden")
	$("#item_sprite")
	.animate({
		translateY:0,
		opacity:1
	},500,"swing")
	.delay(3000)
	.animate({
		translateY:-30,
		opacity:0
	},1500,"easeOutQuart")
	.queue(function(){
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_item_background").css("opacity",1)

	$("#sprite_item_treasure")
	.delay(100)
	.animate({
		translateY:0,
		opacity:1
	},100,"easeOutQuart")

	$("#sprite_item_kuro")
	.delay(500)
	.animate({
		translateY:0,
		opacity:1,
	},800,"easeOutQuart")
	.delay(800)
	.animate({
		translateY:-30,
	},100,"linear")
	.animate({
		translateY:0,
	},100,"linear")
	.delay(80)
	.animate({
		translateY:-20,
	},100,"linear")
	.animate({
		translateY:0
	},100,"linear")

	$("#sprite_item_siro")
	.delay(600)
	.animate({
		translateY:0,
		opacity:1,
	},800,"easeOutQuart")
	.delay(750)
	.animate({
		translateY:-30,
	},100,"linear")
	.animate({
		translateY:0,
	},100,"linear")
	.delay(10)
	.animate({
		translateY:-30,
	},100,"linear")
	.animate({
		translateY:0,
	},100,"linear")

	$("#sprite_item_text")
	.delay(100)
	.animate({
		translateY:0,
		opacity:1,
	},800,"easeOutQuart")
}

function resetBattleSprite(){
	$("#sprite_battle_enemy1").css({
		opacity:0,
		translateY:0,
		translateX:-50,
	})
	$("#sprite_battle_enemy2").css({
		opacity:0,
		translateY:0,
		translateX:-50,
	})
	$("#sprite_battle_enemy3").css({
		opacity:0,
		translateY:0,
		translateX:-50,
	})
	$("#sprite_battle_siro").css({
		opacity:0,
		translateY:0,
		translateX:100,
	})
	$("#sprite_battle_kuro").css({
		opacity:0,
		translateY:0,
		translateX:100,
	})
	$("#sprite_battle_text").css({
		opacity:0,
		translateY:-20,
	})
}

//勝ったときのスプライトならis_win=true
function showBattleSprite(is_win=true){

	//ミニゲームプレイ中も一切スプライトを出さない
	if(mini_game_data.is_playing){
		return
	}

	//イベント超速再生中は一切スプライトを出さない
	if(data.hyper_event_dash_mode){
		return
	}

	if(!save.options.enable_event_animation){
		spriteSlidein("battle")
		return
	}

	resetBattleSprite()
	$("#battle_sprite").removeClass("hidden")

	$("#battle_sprite")
	.animate({
		translateY:0,
		opacity:1
	},500,"swing")	
	.delay(1500)
	.queue(function(){
		if(is_win){
			showBattleWinSprite()
		}
		else{
			showBattleLoseSprite()
		}
		$(this).dequeue()
	})
	.delay(700)
	.queue(function(){
		$(this).css({			
			translateY:-30,
			opacity:0
		})
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_battle_background").css("opacity",1)

	$("#sprite_battle_text")
	.delay(100)
	.animate({
		translateY:0,
		opacity:1,
	},600,"easeOutQuart")

	$("#sprite_battle_enemy1")
	.delay(400)
	.animate({
		translateX:0,
		opacity:1
	},500,"easeOutQuart")
	.delay(930)
	.animate({
		translateY:-100,
		translateX:160,
	},1330,"easeOutQuart")	

	$("#sprite_battle_enemy2")
	.delay(560)
	.animate({
		translateX:0,
		opacity:1
	},500,"easeOutQuart")
	.delay(800)
	.animate({
		translateY:-100,
		translateX:160,
	},1330,"easeOutQuart")	

	$("#sprite_battle_enemy3")
	.delay(660)
	.animate({
		translateX:0,
		opacity:1
	},500,"easeOutQuart")
	.delay(660)
	.animate({
		translateY:-100,
		translateX:160,
	},1330,"easeOutQuart")	

	$("#sprite_battle_siro")
	.delay(1000)
	.animate({
		translateX:0,
		opacity:1
	},500,"easeOutQuart")
	.delay(330)
	.animate({
		translateY:-100,
		translateX:-200,
	},1330,"easeOutQuart")	

	$("#sprite_battle_kuro")
	.delay(1200)
	.animate({
		translateX:60,
		opacity:1
	},500,"easeOutQuart")
	.delay(130)
	.animate({
		translateY:-100,
		translateX:-100,
	},1330,"easeOutQuart")	

}

function resetBattleWinSprite(){
	$("#sprite_battle_win_text").css({
		opacity:0,
		translateY:50,
		translateX:0,
	})
	$("#sprite_battle_win_filter").css({
		opacity:0,
	})
	$("#sprite_battle_win_star").css({
		opacity:0,
		translateY:50,
		translateX:0,
	})
	$("#sprite_battle_win_siro").css({
		opacity:0,
		translateX:10,
		translateY:50,
	})
	$("#sprite_battle_win_kuro").css({
		opacity:0,
		translateX:-10,
		translateY:50,
	})
}

function showBattleWinSprite(){

	//ミニゲームプレイ中も一切スプライトを出さない
	if(mini_game_data.is_playing){
		return
	}

	//イベント超速再生中は一切スプライトを出さない
	if(data.hyper_event_dash_mode){
		return
	}

	resetBattleWinSprite()
	$("#battle_win_sprite").removeClass("hidden")

	$("#battle_win_sprite")
	.css({
		translateY:0,
		opacity:0,
	})
	.animate({
		opacity:1
	},500,"swing")
	.delay(1200)
	.animate({
		translateY:-30,
		opacity:0
	},800,"easeOutQuart")
	.queue(function(){
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_battle_win_background").css("opacity",1)

	$("#sprite_battle_win_star")
	.delay(100)
	.animate({
		opacity:1,
	},700,"easeOutQuart")

	$("#sprite_battle_win_filter")
	.delay(800)
	.animate({
		opacity:0.2,
	},200,"easeOutQuart")


	$("#sprite_battle_win_text")
	.delay(600)
	.animate({
		translateY:-20,
		opacity:1,
	},300,"easeOutQuart")
	.animate({
		translateY:0
	},100,"linear")

	$("#sprite_battle_win_siro")
	.delay(100)
	.animate({
		translateX:0,
		translateY:10,
		opacity:1,
	},300,"easeOutQuart")
	.delay(100)
	.animate({
		translateY:0
	},100,"linear")
	.animate({
		translateY:30
	},100,"linear")
	.animate({
		translateY:0
	},100,"linear")
	.animate({
		translateY:30
	},100,"linear")

	$("#sprite_battle_win_kuro")
	.delay(50)
	.animate({
		translateX:0,
		translateY:10,
		opacity:1,
	},200,"easeOutQuart")
	.delay(50)
	.animate({
		translateY:0,
		translateX:-20,
	},90,"linear")
	.animate({
		translateY:10,
		translateX:0,
	},90,"linear")
	.delay(200)
	.animate({
		translateY:0,
		translateX:20,
	},90,"linear")
	.animate({
		translateY:10,
		translateX:0,
	},90,"linear")

}

function resetBattleLoseSprite(){
	$("#sprite_battle_lose_text").css({
		opacity:0,
		translateY:-50,
		translateX:0,
	})
	$("#sprite_battle_lose_siro").css({
		opacity:0,
		translateX:10,
		translateY:50,
	})
	$("#sprite_battle_lose_kuro").css({
		opacity:0,
		translateX:-10,
		translateY:50,
	})
	$("#sprite_battle_lose_filter").css({
		opacity:0,
	})
}

function showBattleLoseSprite(){

	//ミニゲームプレイ中も一切スプライトを出さない
	if(mini_game_data.is_playing){
		return
	}

	//イベント超速再生中は一切スプライトを出さない
	if(data.hyper_event_dash_mode){
		return
	}

	resetBattleLoseSprite()
	$("#battle_lose_sprite").removeClass("hidden")

	$("#battle_lose_sprite")
	.css({
		translateY:0,
		opacity:0,
	})
	.animate({
		opacity:1
	},500,"swing")
	.delay(1200)
	.animate({
		translateY:-30,
		opacity:0
	},800,"easeOutQuart")
	.queue(function(){
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_battle_lose_background").css("opacity",1)

	$("#sprite_battle_lose_text")
	.delay(100)
	.animate({
		translateY:-20,
		opacity:1,
	},1300,"easeOutQuart")

	$("#sprite_battle_lose_filter")
	.delay(200)
	.animate({
		opacity:0.7,
	},1000,"easeOutQuart")


	$("#sprite_battle_lose_siro")
	.delay(400)
	.animate({
		translateX:0,
		translateY:5,
		opacity:1,
	},300,"easeOutQuart")
	.animate({
		translateX:4,
		translateY:0,
	},2000,"easeOutQuart")

	$("#sprite_battle_lose_kuro")
	.delay(50)
	.animate({
		translateX:0,
		translateY:5,
		opacity:1,
	},200,"easeOutQuart")
	.animate({
		translateX:-6,
		translateY:0,
	},2000,"easeOutQuart")

}


function resetFailyBattleSprite(faily_id){
	$("#faily_battle_sprite").css({
		translateY:-50,
		opacity:0,
	})
	$("#sprite_faily_battle_text").css({
		translateY:-20,
		opacity:0,
	})
	$("#sprite_faily_battle_faily"+faily_id).css({
		translateX:50,
		opacity:0,
	})
	$("#sprite_faily_battle_filter").css({
		opacity:0,
	})
	$("#sprite_faily_battle_mark").css({
		opacity:0,
	})
	$("#sprite_faily_battle_mark_blur").css({
		opacity:0,
	})
	$(".sprite_faily_battle_faily").css({
		opacity:0,
	})
	$("#sprite_faily_battle_mark_window").css({
		opacity:0,
	})

}

function showFailyBattleSprite(faily_id=0,is_win=true){

	//ミニゲームプレイ中も一切スプライトを出さない
	if(mini_game_data.is_playing){
		return
	}

	//イベント超速再生中は一切スプライトを出さない
	if(data.hyper_event_dash_mode){
		return
	}

	if(!save.options.enable_event_animation){
		spriteSlidein("faily_battle")
		return
	}

	resetFailyBattleSprite(faily_id)
	$("#faily_battle_sprite").removeClass("hidden")

	$("#faily_battle_sprite")
	.animate({
		translateY:0,
		opacity:1
	},500,"swing")	
	.delay(1500)
	.queue(function(){
		if(is_win){
			showBattleWinSprite()
		}
		else{
			showBattleLoseSprite()
		}
		$(this).dequeue()
	})
	.delay(700)
	.queue(function(){
		$(this).css({			
			translateY:-30,
			opacity:0
		})
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_faily_battle_background").css("opacity",1)

	$("#sprite_faily_battle_text")
	.delay(500)
	.animate({
		translateY:0,
		opacity:1,
	},400,"easeOutQuart")

	$("#sprite_faily_battle_faily"+faily_id)
	.delay(300)
	.animate({
		translateX:0,
		opacity:1,
	},1200,"easeOutQuart")

	$("#sprite_faily_battle_filter")
	.delay(200)
	.animate({
		opacity:0.7,
	},1000,"easeOutQuart")

	$("#sprite_faily_battle_mark_window")
	.delay(1000)
	.animate({
		opacity:.25,
	},500,"easeOutQuart")

	$("#sprite_faily_battle_mark")
	.attr("src","images/neko/sprite/faily_battle/"+faily_id+"-mark.png")
	.delay(1000)
	.animate({
		opacity:1,
	},500,"easeOutQuart")

	$("#sprite_faily_battle_mark_blur")
	.attr("src","images/neko/sprite/faily_battle/"+faily_id+"-mark-blur.png")
	.delay(700)
	.animate({
		opacity:1,
	},1200,"linear")

}


function resetPowderSprite(){
	$("#powder_sprite").css({
		translateY:-50,
		opacity:0,
	})
	$("#sprite_powder_text").css({
		translateY:-20,
		opacity:0,
	})
	$("#sprite_powder_light").css({
		translateY:-10,
		opacity:0,
	})
	$("#sprite_powder_powder").css({
		translateY:-10,
		opacity:0,
	})
	$("#sprite_powder_faily").css({
		translateY:-10,
		opacity:0,
	})
	$("#sprite_powder_feather").css({
		translateY:-10,
		opacity:0,
	})
	$("#sprite_powder_dish").css({
		translateY:-10,
		opacity:0,
	})

}

function showPowderSprite(){

	//ミニゲームプレイ中も一切スプライトを出さない
	if(mini_game_data.is_playing){
		return
	}

	//イベント超速再生中は一切スプライトを出さない
	if(data.hyper_event_dash_mode){
		return
	}

	if(!save.options.enable_event_animation){
		spriteSlidein("powder")
		return
	}

	resetPowderSprite()
	$("#powder_sprite").removeClass("hidden")

	$("#powder_sprite")
	.animate({
		translateY:0,
		opacity:1
	},500,"swing")	
	.delay(1500)
	.animate({			
		translateY:-30,
		opacity:0
	},400,"linear")
	.queue(function(){
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_powder_background").css("opacity",1)

	$("#sprite_powder_text")
	.delay(500)
	.animate({
		translateY:0,
		opacity:1,
	},400,"easeOutQuart")

	$("#sprite_powder_faily")
	.delay(500)
	.animate({
		translateX:0,
		opacity:1,
	},300,"easeOutQuart")
	.delay(50)
	.animate({
		translateY:10,
		translateX:5,
		opacity:1,
	},200,"easeOutQuart")
	.animate({
		translateY:0,
		translateX:0,
		opacity:1,
	},160,"easeOutQuart")

	$("#sprite_powder_kuro")
	.delay(300)
	.animate({
		translateX:0,
		opacity:1,
	},300,"easeOutQuart")
	.delay(550)
	.animate({
		translateY:-10,
	},150,"easeOutQuart")
	.animate({
		translateY:0,
	},150,"easeOutQuart")

	$("#sprite_powder_kuro_hand")
	.delay(300)
	.animate({
		translateX:0,
		opacity:1,
	},300,"easeOutQuart")

	$("#sprite_powder_dish")
	.delay(300)
	.animate({
		translateX:0,
		opacity:1,
	},300,"easeOutQuart")

	$("#sprite_powder_powder")
	.delay(1050)
	.animate({
		translateX:0,
		opacity:1,
	},300,"easeOutQuart")

	$("#sprite_powder_feather")
	.delay(500)
	.animate({
		translateY:0,
		opacity:1,
	},300,"easeOutQuart")
	.delay(100)
	.animate({
		translateY:10,
		opacity:1,
	},50,"easeOutQuart")
	.animate({
		translateY:0,
		opacity:1,
	},50,"easeOutQuart")
	.delay(100)
	.animate({
		translateY:10,
		opacity:1,
	},50,"easeOutQuart")
	.animate({
		translateY:0,
		opacity:1,
	},50,"easeOutQuart")

	$("#sprite_powder_light")
	.delay(950)
	.animate({
		translateY:0,
		opacity:1,
	},300,"easeOutQuart")
	.animate({
		translateY:10,
		opacity:0,
	},300,"easeOutQuart")

	//TODO 他のオブジェクトを置く

}




function resetStairsSprite(){
	$("#sprite_stairs_text").css({
		opacity:0,
		translateY:-50
	})
	$("#sprite_stairs_siro").css({
		opacity:0,
		translateY:0,
		translateX:-50
	})
	$("#sprite_stairs_kuro").css({
		opacity:0,
		translateY:0,
		translateX:-50
	})

}

function showStairsSprite(){

	//ミニゲームプレイ中も一切スプライトを出さない
	if(mini_game_data.is_playing){
		return
	}

	//イベント超速再生中は一切スプライトを出さない
	if(data.hyper_event_dash_mode){
		return
	}

	if(!save.options.enable_event_animation){
		spriteSlidein("stairs")
		return
	}

	resetStairsSprite()
	$("#stairs_sprite").removeClass("hidden")

	$("#stairs_sprite")
	.animate({
		translateY:0,
		opacity:1
	},500,"swing")
	.delay(3400)
	.animate({
		translateY:-30,
		opacity:0
	},1500,"easeOutQuart")
	.queue(function(){
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_stairs_background").css("opacity",1)

	$("#sprite_stairs_text")
	.delay(100)
	.animate({
		translateY:0,
		opacity:1,
	},800,"easeOutQuart")

	$("#sprite_stairs_siro")
	.delay(400)
	.animate({
		translateX:0,
		opacity:1
	},500,"easeOutQuart")
	.delay(600)
	.animate({
		translateY:-50,
		translateX:30,
	},100,"linear")	
	.animate({
		translateY:-30,
		translateX:45,
	},100,"swing")	
	.delay(300)
	.animate({
		translateY:-70,
		translateX:60,
	},100,"linear")	
	.animate({
		translateY:-50,
		translateX:75,
	},100,"swing")	
	.delay(300)
	.animate({
		translateY:-90,
		translateX:90,
	},100,"linear")	
	.animate({
		translateY:-70,
		translateX:105,
	},100,"swing")
	.delay(250)
	.animate({
		translateY:-110,
		translateX:120,
	},100,"linear")	
	.animate({
		translateY:-90,
		translateX:145,
	},100,"swing")
	.delay(250)
	.animate({
		translateY:-125,
		translateX:160,
	},100,"linear")	
	.animate({
		translateY:-110,
		translateX:175,
	},100,"swing")
	.delay(250)
	.animate({
		translateY:-130,
		translateX:190,
	},100,"linear")	
	.animate({
		translateY:-160,
		translateX:205,
	},100,"swing")

	$("#sprite_stairs_kuro")
	.delay(700)
	.animate({
		translateX:0,
		opacity:1
	},500,"easeOutQuart")
	.delay(600)
	.animate({
		translateY:-50,
		translateX:30,
	},100,"linear")
	.animate({
		translateY:-30,
		translateX:45,
	},100,"swing")	
	.delay(250)
	.animate({
		translateY:-70,
		translateX:60,
	},100,"linear")	
	.animate({
		translateY:-50,
		translateX:75,
	},100,"swing")	
	.delay(250)
	.animate({
		translateY:-90,
		translateX:90,
	},100,"linear")	
	.animate({
		translateY:-70,
		translateX:105,
	},100,"swing")	
	.delay(250)
	.animate({
		translateY:-110,
		translateX:120,
	},100,"linear")	
	.animate({
		translateY:-90,
		translateX:135,
	},100,"swing")	
	.delay(250)
	.animate({
		translateY:-130,
		translateX:150,
	},100,"linear")	
	.animate({
		translateY:-110,
		translateX:165,
	},100,"swing")	
	.delay(250)
	.animate({
		translateY:-150,
		translateX:180,
	},100,"linear")	
	.animate({
		translateY:-130,
		translateX:195,
	},100,"swing")	
}


function resetBossBattleSprite(){
	$("#sprite_boss_battle_boss").css({
		translateY:-100,
		opacity:0
	})
	$("#sprite_boss_battle_siro").css({
		translateY:0,
		translateX:500,
		opacity:0
	})
	$("#sprite_boss_battle_kuro").css({
		translateY:0,
		translateX:-500,
		opacity:0
	})
}

function showBossBattleSprite(){

	//ミニゲームプレイ中も一切スプライトを出さない
	if(mini_game_data.is_playing){
		return
	}

	//イベント超速再生中は一切スプライトを出さない
	if(data.hyper_event_dash_mode){
		return
	}

	if(!save.options.enable_event_animation){
		spriteSlidein("boss")
		return
	}

	resetBossBattleSprite()
	$("#boss_battle_sprite").removeClass("hidden")

	$("#boss_battle_sprite")
	.animate({
		translateY:0,
		opacity:1
	},500,"swing")	
	.delay(1500)
	.queue(function(){
		if(is_win){
			showBattleWinSprite()
		}
		else{
			showBattleLoseSprite()
		}
		$(this).dequeue()
	})
	.delay(700)
	.queue(function(){
		$(this).css({			
			translateY:-30,
			opacity:0
		})
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_boss_battle_background").css("opacity",1)

	$("#sprite_boss_battle_boss")
	.delay(300)
	.animate({
		translateY:0,
		opacity:1,
	},500,"easeOutQuart")

	$("#sprite_boss_battle_kuro")
	.delay(800)
	.animate({
		translateX:0,
		opacity:1
	}, 500,"easeOutQuart")
	.delay(600)
	.animate({
		translateY:-170,
		translateX:-400,
		opacity:.4
	}, 400,"easeOutQuart")

	$("#sprite_boss_battle_siro")
	.delay(800)
	.animate({
		translateX:0,
		opacity:1
	}, 500,"easeOutQuart")
	.delay(600)
	.animate({
		translateY:-170,
		translateX:400,
		opacity:.4
	}, 500,"easeOutQuart")

}

function resetResurrectSprite(){
	$("#sprite_resurrect_siro_dead").css({
		translateY:-50,
		opacity:0
	})

	$("#sprite_resurrect_kuro_dead").css({
		translateY:-50,
		opacity:0
	})

	$("#sprite_resurrect_siro_alive").css({
		opacity:0
	})

	$("#sprite_resurrect_kuro_alive").css({
		opacity:0
	})

	$("#sprite_resurrect_light").css({
		opacity:0
	})

	$("#sprite_resurrect_text").css({
		translateY:-60,
		opacity:0
	})
}

function showResurrectSprite(){

	//ミニゲームプレイ中も一切スプライトを出さない
	if(mini_game_data.is_playing){
		return
	}

	//イベント超速再生中はスプライトの発生を抑制(韻を踏んだ)
	if(data.hyper_event_dash_mode){
		return
	}

	if(!save.options.enable_event_animation){
		spriteSlidein("ressurect")
		return
	}

	resetResurrectSprite()
	$("#resurrect_sprite").removeClass("hidden")

	$("#sprite_resurrect_background").css("opacity",1)

	$("#resurrect_sprite")
	.animate({
		translateY:0,
		opacity:1
	},500,"swing")
	.delay(4500)
	.animate({
		translateY:-30,
		opacity:0
	},1500,"easeOutQuart")
	.queue(function(){
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_resurrect_light")
	.delay(500)
	.animate({
		opacity:1
	},4000,"easeOutQuart")

	$("#sprite_resurrect_text")
	.delay(300)
	.animate({
		translateY:0,
		opacity:1,
	},800,"easeOutQuart")

	$("#sprite_resurrect_siro_dead").animate({
		translateY:0,
		opacity:1
	},1000,"easeOutQuart")
	.delay(1500)
	.animate({
		opacity:0
	},300,"linear")

	$("#sprite_resurrect_siro_alive")
	.delay(2500)
	.animate({
		opacity:1
	},300,"linear")
	.delay(800)
	.animate({
		translateY:-20
	},150,"linear")
	.animate({
		translateY:0
	},100,"linear")
	.delay(400)
	.animate({
		translateY:-20
	},100,"linear")
	.animate({
		translateY:0
	},50,"linear")

	$("#sprite_resurrect_kuro_dead").animate({
		translateY:0,
		opacity:1
	},1000,"easeOutQuart")
	.delay(1500)
	.animate({
		opacity:0
	},300,"linear")

	$("#sprite_resurrect_kuro_alive")
	.delay(2500)
	.animate({
		opacity:1
	},300,"linear")
	.delay(800)
	.animate({
		translateY:-20
	},150,"linear")
	.animate({
		translateY:0
	},100,"linear")
	.delay(800)
	.animate({
		translateY:-20
	},150,"linear")
	.animate({
		translateY:0
	},100,"linear")
}

//HPの表記反映
function updateCurrentHP(){
	$("#hp_siro").text(save.status.siro.hp)
	$("#hp_kuro").text(save.status.kuro.hp)
	$("#hp_max_siro").text(save.status.siro.max_hp)
	$("#hp_max_kuro").text(save.status.kuro.max_hp)
	var width = 285
	var siro_hp_persentage = save.status.siro.hp / save.status.siro.max_hp
	var kuro_hp_persentage = save.status.kuro.hp / save.status.kuro.max_hp
	$("#hp_gauge_now_siro").css("width",width*siro_hp_persentage	)
	$("#hp_gauge_now_kuro").css("width",width*kuro_hp_persentage	)
}

//lv, expの表記反映
function updateCurrentLVEXP(){
	$("#lv_siro").text(save.status.siro.lv)
	$("#lv_kuro").text(save.status.kuro.lv)
	$("#exp_siro").text(save.status.siro.exp)
	$("#exp_kuro").text(save.status.kuro.exp)
	var width = 285
	var siro_exp_persentage = save.status.siro.exp / 100
	var kuro_exp_persentage = save.status.kuro.exp / 100
	$("#exp_gauge_now_siro").css("width",width*siro_exp_persentage	)
	$("#exp_gauge_now_kuro").css("width",width*kuro_exp_persentage	)
}


//ダンジョン選択画面のメニューを展開
function showDungeonSelectMenu(){
	prepareDungeonList()
	$("#dungeon_select_menu")
	.removeClass("hidden")
	.animate({
		opacity:0.98,
		translateY:20,
	},200,"easeOutQuart")	
}

//ステータス画面のメニューを展開
function showStatusMenu(){
	prepareStatusParameters()
	hideAllStatusBoardElements()
	$("#status_menu")
	.removeClass("hidden")
	.animate({
		opacity:0.98,
		translateY:20,
	},140,"easeOutQuart")
	.queue(function(){
		constructStatusBoardAnimation()
		$(this).dequeue();
	})
}

//装備メニューの展開
function showEquipmentMenu(){
	copyCurrentEquipToDraft()
	prepareEquipMenu()
	$("#equipment_menu")
	.removeClass("hidden")
	.animate({
		opacity:0.96,
		translateY:20,
	},200,"easeOutQuart")
}

//装備強化メニューの表示項目をitem_idのものに更新
function prepareEquipBuildMenu(item_id){
	$("#coin_amount").text(save.coin)
	$(".equip_name").text(data.item_data[item_id].name)
	$(".build_prev").text("+"+((save.item[item_id]||0)-1))
	$(".build_after").text("+"+Math.min(MAX_EQUIP_BUILD-1,(save.item[item_id]||0)))
	$("#build_cost").text(getBuildCost(item_id))

	//未開放装備の場合開放用テキストに切り替え
	if(!save.item[item_id]){
		$("#equip_build_param_list").addClass("hidden")
		$("#build_plus_area").addClass("hidden")
		$("#unachieved_item_text").removeClass("hidden")
		$("#build_decide_text").text("生成")
	}
	else{
		$("#equip_build_param_list").removeClass("hidden")
		$("#build_plus_area").removeClass("hidden")
		$("#unachieved_item_text").addClass("hidden")	
		$("#build_decide_text").text("強化")
	}

	var param_prevs = $(".param_prev")
	var param_afters = $(".param_after")
	var param_diffs = $(".param_diff")

	var prev_str = getBuildedParameter(item_id,"str")
	var prev_dex = getBuildedParameter(item_id,"dex")
	var prev_def = getBuildedParameter(item_id,"def")
	var prev_agi = getBuildedParameter(item_id,"agi")
	var after_str = getParameterBuildTo(item_id,"str",save.item[item_id]+1)
	var after_dex = getParameterBuildTo(item_id,"dex",save.item[item_id]+1)
	var after_def = getParameterBuildTo(item_id,"def",save.item[item_id]+1)
	var after_agi = getParameterBuildTo(item_id,"agi",save.item[item_id]+1)
	var diff_str = after_str - prev_str
	var diff_dex = after_dex - prev_dex
	var diff_def = after_def - prev_def
	var diff_agi = after_agi - prev_agi

	param_prevs[0].textContent = prev_str
	param_prevs[1].textContent = prev_dex
	param_prevs[2].textContent = prev_def
	param_prevs[3].textContent = prev_agi
	if(save.item[item_id] < MAX_EQUIP_BUILD){
		param_afters[0].textContent =after_str
		param_afters[1].textContent = after_dex
		param_afters[2].textContent = after_def
		param_afters[3].textContent = after_agi
		param_diffs[0].textContent = diff_str
		param_diffs[1].textContent = diff_dex
		param_diffs[2].textContent =  diff_def
		param_diffs[3].textContent = diff_agi

		if(diff_str < 0){
			$(param_diffs[0]).addClass("minus")
			$(param_diffs[0]).removeClass("plus")
		}
		else if(diff_str > 0){
			$(param_diffs[0]).removeClass("minus")
			$(param_diffs[0]).addClass("plus")			
		}
		else{
			$(param_diffs[0]).removeClass("minus")
			$(param_diffs[0]).removeClass("plus")				
		}

		if(diff_dex < 0){
			$(param_diffs[1]).addClass("minus")
			$(param_diffs[1]).removeClass("plus")
		}
		else if(diff_dex > 0){
			$(param_diffs[1]).removeClass("minus")
			$(param_diffs[1]).addClass("plus")			
		}
		else{
			$(param_diffs[1]).removeClass("minus")
			$(param_diffs[1]).removeClass("plus")				
		}

		if(diff_def < 0){
			$(param_diffs[2]).addClass("minus")
			$(param_diffs[2]).removeClass("plus")
		}
		else if(diff_def > 0){
			$(param_diffs[2]).removeClass("minus")
			$(param_diffs[2]).addClass("plus")			
		}
		else{
			$(param_diffs[2]).removeClass("minus")
			$(param_diffs[2]).removeClass("plus")				
		}

		if(diff_agi < 0){
			$(param_diffs[3]).addClass("minus")
			$(param_diffs[3]).removeClass("plus")
		}
		else if(diff_agi > 0){
			$(param_diffs[3]).removeClass("minus")
			$(param_diffs[3]).addClass("plus")			
		}
		else{
			$(param_diffs[3]).removeClass("minus")
			$(param_diffs[3]).removeClass("plus")				
		}

	}
	else{
		//最大強化済の場合は差分を表示しない
		for(var i=0;i<4;++i){
			param_afters[i].textContent = "MAX!"
			param_diffs[i].textContent ="-"
			$(param_diffs[i]).removeClass("minus")
			$(param_diffs[i]).removeClass("plus")
		}
		$("#build_cost").text("---")
		if(!save.item[item_id]){
			$("#build_cost").text("100")
		}
	}

	//強化できないなら無効化する
	if(save.coin < getBuildCost(item_id)){
		$("#build_decide_button").addClass("disabled")
	}
	else{
		$("#build_decide_button").removeClass("disabled")		
	}
}

//item_idの装備強化メニューを開く
function showEquipBuildMenuView(item_id){
	prepareEquipBuildMenu(item_id)
	$("#equip_build_popup_area").removeClass("hidden")
}

//装備強化メニューを閉じる
function hideEquipBuildMenu(){
	$("#equip_build_popup_area").addClass("hidden")
}

//装備メニューの開放
function fadeEquipmentMenu(){
	makesave()
	fadeSortOrderChangePopup()
	$("#equipment_menu")
	.animate({
		opacity:0,
		translateY:0,
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}

//ダンジョン選択メニューの開放
function fadeDungeonSelectMenu(){
	$("#dungeon_select_menu")
	.animate({
		opacity:0,
		translateY:0,
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}

//ダンジョン選択メニューの開放
function fadeStatusMenu(){
	$("#status_menu")
	.animate({
		opacity:0,
		translateY:0,
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}


/*******************************************/
/* 装備画面 */
/*******************************************/

//ページャーの総ページ数を反映
function updatePagerTotalPage(){
	var max_page = findLatestEquipPageIndex()
	$("#total_page").text(max_page)
}

//装備メニューの準備
function prepareEquipMenu(){
	updateCurrentEnemyRankArea()
	updatePagerCurrentPage()
	updatePagerTotalPage()
	updateEquipList()
	updatePagerButtonState()
	updateEquipListCoinAmount()
	resetDetailArea()
	updateEquipDetailATKDEF()
	updateCurrentEquipListArea()
	updateCurrentTotalParameter()
	updateEquipListParameterIndex()
	updateEquipListParameterIndexCurrentEquipArea()
	updateEquipBackButton()
	updateEquipResultArea()
	updateEquipMenuFontSize()
}

function updateEquipMenuFontSize(){
	if(getMaxEnemyRank() > 2000){
		$(".status_unit").addClass("over_million")
	}
}

//戻るボタンの状態を更新
function updateEquipBackButton(){
	if(data.equipment_menu.changed){
		$("#equipment_back_button").addClass("changed")
		$("#equipment_back_info_text").removeClass("hidden")
	}
	else{
		$("#equipment_back_button").removeClass("changed")		
		$("#equipment_back_info_text").addClass("hidden")
	}
}

//現在装備エリアに表示されるべきアイテムIDのリストを作成する
function getCurrentPageItemList(){
	var item_ids = []
	var sort_order = data.equipment_menu.sort_order
	var current_page = data.equipment_menu.current_page

	//sort_order==0 -> ID順
	//sort_order==1 -> 総パラメータ順
	//sort_order==2,3,4,5 -> STR,DEX,DEF,AGI順
	//sort_order==6,7 -> ATK, SLD順
	if(sort_order === 0){
		for(var i=0;i<10;++i){
			item_ids.push((current_page-1)*10 + i)
		}
		return item_ids
	}

	if(sort_order === 1){
		item_ids = getItemIDListOrderBy(current_page,"total")
		return item_ids
	}

	if(sort_order === 2){
		item_ids = getItemIDListOrderBy(current_page,"str")
		return item_ids
	}

	if(sort_order === 3){
		item_ids = getItemIDListOrderBy(current_page,"dex")
		return item_ids
	}

	if(sort_order === 4){
		item_ids = getItemIDListOrderBy(current_page,"def")
		return item_ids
	}

	if(sort_order === 5){
		item_ids = getItemIDListOrderBy(current_page,"agi")
		return item_ids
	}

	if(sort_order === 6){
		item_ids = getItemIDListOrderByATK(current_page)
		return item_ids
	}

	if(sort_order === 7){
		item_ids = getItemIDListOrderBySLD(current_page)
		return item_ids
	}

	castMessage("不正なソート順が指定されています！")

}

//装備リストのパラメータ部分を更新
function updateEquipListParam(){
	var equip_name_list = $("#equipment_list .equip_item").children(".equip_list_param")
	var item_ids = getCurrentPageItemList()

	//表示項目の更新
	for(var i=0;i<equip_name_list.length;++i){
		var target_item_id = item_ids[i]
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

//装備エリア側のパラメータ指標エリア(棒のとこ)の更新
function updateEquipListParameterIndex(){
	var param_digest_list = $("#equipment_list .equip_item").children(".param_digest_icon_container")
	var item_ids = getCurrentPageItemList()
	for(var i=0;i<param_digest_list.length;++i){
		var target_item_id = item_ids[i]
		var target_item_lv = save.item[target_item_id] || 0

		if(!data.item_data[target_item_id] || !target_item_lv){
			$($(param_digest_list[i]).children()).css("opacity",0)
			continue
		}

		var [str,dex,def,agi] = $(param_digest_list[i]).children().get()
		//各パラメータの標準パラメータとの比を取って半分にした値を透明度とする
		//全部標準ならopacity0.5に見える 2倍以上に特化した値なら1になる
		$(str).css("opacity",getEquipmentPowerRatio(item_ids[i], getMaxEnemyRank(),"str")/2)
		$(dex).css("opacity",getEquipmentPowerRatio(item_ids[i], getMaxEnemyRank(),"dex")/2)
		$(def).css("opacity",getEquipmentPowerRatio(item_ids[i], getMaxEnemyRank(),"def")/2)
		$(agi).css("opacity",getEquipmentPowerRatio(item_ids[i], getMaxEnemyRank(),"agi")/2)

	}
}

//装備エリア側のパラメータ指標エリア(棒のとこ)の更新
function updateEquipListParameterIndexCurrentEquipArea(){
	//TODO ひっかかるようにかく
	var param_digest_list = $(".current_equip_digest")
	var item_ids = data.equipment_menu.editing_equip[data.equipment_menu.current_character]
	for(var i=0;i<param_digest_list.length;++i){
		var target_item_id = item_ids[i]
		var target_item_lv = save.item[target_item_id] || 0

		if(!data.item_data[target_item_id] || !target_item_lv){
			$($(param_digest_list[i]).children()).css("opacity",0)
			continue
		}

		var [str,dex,def,agi] = $(param_digest_list[i]).children().get()
		//各パラメータの標準パラメータとの比を取って半分にした値を透明度とする
		//全部標準ならopacity0.5に見える 2倍以上に特化した値なら1になる
		$(str).css("opacity",getEquipmentPowerRatio(item_ids[i], getMaxEnemyRank(),"str")/2)
		$(dex).css("opacity",getEquipmentPowerRatio(item_ids[i], getMaxEnemyRank(),"dex")/2)
		$(def).css("opacity",getEquipmentPowerRatio(item_ids[i], getMaxEnemyRank(),"def")/2)
		$(agi).css("opacity",getEquipmentPowerRatio(item_ids[i], getMaxEnemyRank(),"agi")/2)

	}
}

//装備リストの装備名部分を更新
function updateEquipListName(){
	var equip_name_list = $("#equipment_list .equip_item").children(".equip_list_text")
	var current_page = data.equipment_menu.current_page
	var item_ids = getCurrentPageItemList()

	//li にアイテムIDを埋め込み
	var lists =  $("#equipment_list").children()
	for(var i=0;i<lists.length;++i){
		lists[i].setAttribute("item_id",item_ids[i])
	} 

	//表示項目の更新
	for(var i=0;i<equip_name_list.length;++i){

		var target_item_id = item_ids[i]
		var target_item_lv = save.item[target_item_id] || 0
		var item_full_name = makeFullEquipName(target_item_id)

		//一旦クラスリセット
		equip_name_list[i].setAttribute("class","equip_list_text")

		//一旦アイコンをデフォのやつに
		$(".equip_list_icon")[i].setAttribute("src","images/neko/icons/unachieved.png")

		var additional_class_name = ""
		//レアリティ・装備済反映
		if(data.item_data[target_item_id]){
			var rarity = data.item_data[target_item_id].rarity

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
	updateSortOrderText()
	updateEquipListName()
	updateEquipListParam()
	updateEquipBuildButtonShowState()
	updateSortOrderButtonState()
	updateEquipListParameterIndex()
}

function updateSortOrderText(){
	var order = ["[ID順]","[つよさ順]","[STR順]","[DEX順]","[DEF順]","[AGI順]","[攻順]","[守順]",]
	$("#sort_toggle_menu_open_button").text(order[data.equipment_menu.sort_order])
}

function updatePagerCurrentPage(){
	$("#current_page").text(data.equipment_menu.current_page)
}


function updateSortOrderButtonState(){
	var lavel = ""

	switch(data.equipment_menu.sort_order ){
		case 0:
		lavel ="[ID順]"
		break 
		case 1:
		lavel ="[つよさ順]"
		break 
		case 2:
		lavel ="[STR順]"
		break 
		case 3:
		lavel ="[DEX順]"
		break 
		case 4:
		lavel ="[DEF順]"
		break 
		case 5:
		lavel ="[AGI順]"
		break 
	}

	$("#sort_toggle_button").text(lavel)
}

//ページャーのボタンの活性不活性を反映
function updatePagerButtonState(){
	var current_page = data.equipment_menu.current_page
	var max_page = findLatestEquipPageIndex()
	$("#pager_button_prev").removeClass("disabled")
	$("#pager_button_next").removeClass("disabled")
	$("#pager_button_prev_10").removeClass("disabled")
	$("#pager_button_next_10").removeClass("disabled")

	if(current_page == 1){
		$("#pager_button_prev").addClass("disabled")		
		$("#pager_button_prev_10").addClass("disabled")		
	}
	if(current_page == max_page){
		$("#pager_button_next").addClass("disabled")		
		$("#pager_button_next_10").addClass("disabled")		
	}
}

//詳細エリアのフラッシュ
function resetDetailArea(){
	$("#equipment_detail_icon").attr("src","images/neko/icons/unachieved.png")
	$("#equip_detail_name").text("----")
	$("#status_detail_total").text("-")
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

//現在のキャラのパラメータを反映
function updateCurrentTotalParameter(){
	var current_chara_name = data.equipment_menu.current_character

	var str = getTotalParameterEquipMenuDraft(current_chara_name,"str")
	var dex = getTotalParameterEquipMenuDraft(current_chara_name,"dex")
	var def = getTotalParameterEquipMenuDraft(current_chara_name,"def")
	var agi = getTotalParameterEquipMenuDraft(current_chara_name,"agi")

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
	var total = calcTotalItemParam(item_id)

	var icon_name = getItemIconNameFromTypeID(item.category)

	$("#equip_detail_name").text(item.name)
	$("#equipment_detail_icon").attr("src","images/neko/icons/"+icon_name +".png")
	$("#status_detail_total").text(total)
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

//現在装備エリアの表示反映を行う
function  updateCurrentEquipListArea(){
	var current_chara_name = data.equipment_menu.current_character
	var equip_num = data.equipment_menu.editing_equip[current_chara_name].length

	for(var i=0;i<4;++i){
		$($(".current_equip_text")[i]).text("-")
	}

	for(var i=0;i<equip_num;++i){
		var item_id = data.equipment_menu.editing_equip[current_chara_name][i]
		$($(".current_equip_text")[i]).text(makeFullEquipName(item_id))
	}

	//アイテムIDのリセット
	for(var i=0;i<4;++i){
		$("#current_equip_list").children()[i].setAttribute("item_id","")
	}

	//アイテムIDの埋め込み
	for(var i=0;i<equip_num;++i){
		var item_id = data.equipment_menu.editing_equip[current_chara_name][i]
		$("#current_equip_list").children()[i].setAttribute("item_id",item_id)
	}
}

//ATK,DEF参考値を画面に描画
function updateEquipDetailATKDEF(){
	var current_chara_name = data.equipment_menu.current_character
	$("#atk_value").text(calcAttackEquipMenuDraft(current_chara_name))
	$("#def_value").text(calcDefenceEquipMenuDraft(current_chara_name))
}

//しろこかくろこに編集キャラクターを切り替える
function toggleEquipEditCharacterViewTo(chara_name){
	//キャラの切り替え
	$("#equip_charagter_image").attr("src","images/neko/chara/"+chara_name+"_active.png")
	.css("translateX",-60)
	.css("opacity",.7)
	.animate({
		opacity:1,
		translateX:-30
	},300,"easeOutQuart")
}

//コイン枚数を画面反映
function updateEquipListCoinAmount(){
	$("#equip_coin_amount").text(save.coin)
}

//強化ボタンの表示・非表示の更新を行う
function updateEquipBuildButtonShowState(){
	var buttons = $(".equip_build_button")
	for(var i=0;i<buttons.length;++i){
		var  button = buttons[i]
		var item_id = parseInt($(button).parent().attr("item_id"))

		if(item_id >= data.item_data.length || item_id > getMaxItemRankPlayerGot()){
			$(button).css("display","none")
		}
		else if(save.item[item_id] >= MAX_EQUIP_BUILD){
			$(button).css("display","none")
		}
		//セーブデータがない場合には作成ボタンを出す
		else if(save.item[item_id] === undefined || save.item[item_id] === null || save.item[item_id] ==0){
			//でも作成ボタンを出すのはID順ソートの場合のみ
			if(data.equipment_menu.sort_order==0){
				$(button).css("display","inline-block")
				$(button).text("作成")
			}
			//それ以外は?????に作成ボタンがあっても押す意味ない
			else{
				$(button).css("display","none")				
			}
		}
		else{
			$(button).css("display","inline-block")
			$(button).text("強化")
		}
	}
}

//「このあたりの敵の強さ」欄のパラメータ
function updateCurrentEnemyRankArea(){
	$("#current_enemy_atk").text(calcEnemyAtk(getCurrentEnemyRank()))
}

//ソート順切り替えポップアップを出す
function showSortOrderChangePopup(){
	$("#sort_cancel")
	.removeClass("hidden")

	$("#sort_toggle_popup")
	.removeClass("hidden")
	.animate({
		opacity:1,
		translateY:0,
	},50,"linear")
}

//ソート順切り替えのやつ消す
function fadeSortOrderChangePopup(){
	$("#sort_cancel")
	.addClass("hidden")

	$("#sort_toggle_popup")
	.animate({
		opacity:0,
		translateY:5,
	},250,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}	

//装備編集結果画面の準備
function updateEquipResultArea(){
	var params = ["str","dex","def","agi"]
	var charas = ["siro","kuro"]

	//現在パラメータ部分の更新
	for(var param of params){
		for(var chara of charas){
			$("#equip_before_"+chara+"_"+param).text(getTotalParameter(chara,param))
		}
	}

	//将来のパラメータ部分の更新
	for(var param of params){
		for(var chara of charas){
			$("#equip_after_"+chara+"_"+param).text(getTotalParameterEquipMenuDraft(chara,param))
			var diff = getTotalParameterEquipMenuDraft(chara,param) - getTotalParameter(chara,param)
			if(diff > 0){
				$("#equip_after_"+chara+"_"+param).removeClass("minus")
				$("#equip_after_"+chara+"_"+param).addClass("plus")
			}
			else if(diff==0){
				$("#equip_after_"+chara+"_"+param).removeClass("minus")	
				$("#equip_after_"+chara+"_"+param).removeClass("plus")	
			}
			else{
				$("#equip_after_"+chara+"_"+param).addClass("minus")	
				$("#equip_after_"+chara+"_"+param).removeClass("plus")	
			}
		}
	}

	//パラメータ差分の更新
	for(var param of params){
		for(var chara of charas){
			var diff = getTotalParameterEquipMenuDraft(chara,param) - getTotalParameter(chara,param)
			$("#equip_diff_"+chara+"_"+param).text(diff)
			if(diff > 0){
				$("#equip_diff_"+chara+"_"+param).removeClass("minus")
				$("#equip_diff_"+chara+"_"+param).addClass("plus")
			}
			else if(diff==0){
				$("#equip_diff_"+chara+"_"+param).removeClass("minus")	
				$("#equip_diff_"+chara+"_"+param).removeClass("plus")	
			}
			else{
				$("#equip_diff_"+chara+"_"+param).addClass("minus")	
				$("#equip_diff_"+chara+"_"+param).removeClass("plus")	
			}
		}
	}
}

//装備編集結果画面
function showEquipResultMenu(){
	updateEquipResultArea()
	$("#equip_edit_result_popup")
	.css({
		opacity:0,
		translateY:0,
	})
	.removeClass("hidden")
	.animate({
		opacity:0.9,
		translateY:20,
	},200,"easeOutQuart")
	.queue(function(){
		$("#equip_result_fade_cover").removeClass("hidden")
		$(this).dequeue()
	})

	$("#equip_result_animation_dummy")
	.delay(5000)
	.queue(function(){
		if(data.equipment_menu.canceled == false && data.equipment_menu.changed == true){
			completeEditEquip()
			fadeEquipResultMenu()			
		}
		$(this).dequeue()
	})
}

//装備編集結果画面閉じる
function fadeEquipResultMenu(){
	data.equipment_menu.changed = false
	$("#equip_result_fade_cover").addClass("hidden")
	$("#equip_edit_result_popup")
	.animate({
		opacity:0,
		translateY:0,
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}




/*******************************************/
/* ステータス画面 */
/*******************************************/

//ステータス画面のパラメータを整理
function prepareStatusParameters(){

	//実績エリア更新
	updateAchievementArea()
	checkAchievementCleared()
	updateAchievementClearData()

	var siro_status_object = $("#status_siro .status .status_value")
	var kuro_status_object = $("#status_kuro .status .status_value")

	siro_status_object[0].textContent = save.status.siro.lv
	siro_status_object[1].textContent = save.status.siro.hp
	siro_status_object[2].textContent =  getTotalParameter("siro","str")
	siro_status_object[3].textContent =  getTotalParameter("siro","dex")
	siro_status_object[4].textContent =  getTotalParameter("siro","def")
	siro_status_object[5].textContent =  getTotalParameter("siro","agi")

	kuro_status_object[0].textContent = save.status.kuro.lv
	kuro_status_object[1].textContent = save.status.kuro.hp
	kuro_status_object[2].textContent =  getTotalParameter("kuro","str")
	kuro_status_object[3].textContent =  getTotalParameter("kuro","dex")
	kuro_status_object[4].textContent =  getTotalParameter("kuro","def")
	kuro_status_object[5].textContent =  getTotalParameter("kuro","agi")

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

//ステータス画面中の要素を一旦全部隠す
function hideAllStatusBoardElements(){
	$("#status_character_siro").css({
		translateX:-60,
		opacity:0
	})
	$("#status_character_kuro").css({
		translateX:60,
		opacity:0
	})
	$("#status_siro").css({
		opacity:0
	})
	$("#status_kuro").css({
		opacity:0
	})

	$("#equip_siro .status_equip_item").css({
		translateX : -100,
		opacity:0
	})
	$("#equip_kuro .status_equip_item").css({
		translateX : 100,
		opacity:0
	})
	$("#status_achievement_list").css({
		opacity:0
	})
	$("#playtime_area").css({
		translateY:-20,
		opacity:0
	})
	$(".achievement_icon").css({
		translateX : 100,
		opacity : 0
	})
	$("#achievement_icons_area").css({
		opacity : 0
	})
}

//画面内の要素がスススッてフェードインしてくる昔のwebサイトでよく見たアレ
function constructStatusBoardAnimation(){
	//コンテ
	//しろこ・くろこの画像スライドイン
	//ステがopacity1に遷移
	//装備枠がopacity1に遷移
	//装備要素が一個ずつスライドイン
	//実績が1秒架けてopacity1に遷移
	$("#status_character_siro").animate({
		translateX:0,
		opacity:1
	},2000,"easeOutQuart")

	$("#status_character_kuro").animate({
		translateX:0,
		opacity:1
	},2000,"easeOutQuart")

	$("#status_siro").delay(300)
	.animate({
		opacity:0.9
	},2000,"easeOutQuart")

	$("#status_kuro").delay(300)
	.animate({
		opacity:0.9
	},2000,"easeOutQuart")

	for(var i=0;i<4;++i){
		$($("#equip_siro .status_equip_item")[i])
		.delay(100*i)
		.animate({
			translateX : 0,
			opacity:0.9
		},1000,"easeOutQuart")
	}

	for(var i=0;i<4;++i){
		$($("#equip_kuro .status_equip_item")[i])
		.delay(100*i)
		.animate({
			translateX : 0,
			opacity:0.9
		},1000,"easeOutQuart")
	}

	for(var i=0;i<10;++i){
		$($(".achievement_icon")[i])
		.delay(1000)
		.delay(100*i)
		.animate({
			translateX : 0,
			opacity:0.9
		},1000,"easeOutQuart")
	}

	$("#status_achievement_list").delay(2000)
	.animate({
		opacity:0.9
	},1000,"swing")

	$("#playtime_area").animate({
		opacity:0.9,
		translateY:0
	},1400,"easeOutQuart")

	$("#achievement_icons_area")
	.delay(700)
	.animate({
		opacity:0.9,
	},1600,"easeOutQuart")

}

//実績部分を更新
function updateAchievementArea(){
	var item_found = getSumItemFounded()
	var builded_item = getSumItemFoundedFullBuilded()
	$("#achievement_item_found").text(item_found + " (" + Math.floor(100*item_found/data.item_data.length) + "%)")
	$("#achievement_item_builded").text(builded_item + " (" + Math.floor(100*builded_item/data.item_data.length) + "%)")
	$("#achievement_coin_earned").text(save.total_coin_achieved)
	$("#achievement_depth").text(getDeepestDepthCrawled())
}

//実績の詳細を表示
function showAchievementIconDetail(domobject){
	achievement_id = parseInt($(domobject).attr("achievement_id"))
	$("#achievement_detail_area").removeClass("hidden")
	updateAchievementDetailAreaTo(achievement_id)
}

function hideAchievementDetail(){
	$("#achievement_detail_area").addClass("hidden")
}

function updateAchievementDetailAreaTo(achievement_id){
	//本来ならオフセットは画面からアイコンの置かれている位置を確認して
	//相対配置したかったけど、画面の強制再計算を発生させたくないので
	//数値に展開する
	var xOffset = 250 + 45*achievement_id
	$("#achievement_detail_area").css({
		transform : "translateX("+xOffset+"px)"
	})

	//ダンジョン名系の実績で、対称のダンジョンが未開放の場合には詳細を表示しない
	if( achievement_id<= 4 && !save.dungeon_open[achievement_id]){
		hideAchievementDetail()
	}
	$("#achievement_detail_icon").attr("src",getAchievementIconImageFileName(achievement_id))
	$("#achievement_icon_title").text(achievement_data[achievement_id].name)
	$("#achievement_icon_description").text(achievement_data[achievement_id].detail)
	$("#max_achievement_progress").text(achievement_data[achievement_id].max)
	$("#current_achievement_progress").text(getAchievementProgress(achievement_id))
}

//実績をクリアしてたら背景を黄色くする
function updateAchievementClearData(){
	var icons = $(".achievement_icon")
	for(var i=0;i<10;++i){
		if(save.achievement_clear[i]){
			$(icons[i]).addClass("cleared")
		}
	}

	for(var i=0;i<10;++i){
		if(!save.dungeon_open[i]){
			$($(".achievement_icon_image")[i]).attr("src",getAchievementIconImageFileName(i))
		}
	}

}

//プレイ時間
function updatePlaytimeArea(){
	　$("#playhour").text((Math.floor(save.playtime /60 /60)))
	　$("#playminutes").text(("0"+Math.floor(save.playtime /60 % 60)).slice(-2))
	　$("#playseconds").text(("0"+Math.floor(save.playtime % 60)).slice(-2))
}

/*******************************************/
/* ダンジョン選択画面 */
/*******************************************/

function changeStageToView(stage_id,depth){

	//ダンジョン選択画面を閉じる
	$("#dungeon_select_menu")
	.animate({
		opacity:0,
		translateY:0,
	},1,"linear")//translateYはanimateじゃないといじれないパラメータ
	.queue(function () {
		save.current_dungeon_id = stage_id
		save.current_floor = depth
		initView()
		$(this).addClass("hidden").dequeue();
	})

	updateTips()
	changeStageInfoAreaTo(stage_id)
	updateShopButtonShowState()
	updateExtraStageVisitedState()

	$("#fadeouter")
	.removeClass("hidden")
	.css("opacity",0)
	.animate({
		opacity:1
	},1000)

}

//メニューのダンジョン選択するとこ
function updateExtraStageVisitedState(){
	if(save.dungeon_process[4] > 9999 && save.visited_extra_dungeon == false){
		$("#dungeon_list_show_button").addClass("is_extra_dungeon_available")
	}
	else{
		$("#dungeon_list_show_button").removeClass("is_extra_dungeon_available")		
	}
}

//ステージ変更画面を消す
function fadeChangeStageView(){
	$("#changestage_blight")
	.css("opacity",1)
	.removeClass("hidden")

	$(".whole_screen").css("opacity",0)

	$("#blight_normal")
	.delay(2000)
	.animate({
		opacity:1
	},200,"linear")

	$("#blight_screen")
	.delay(700)
	.animate({
		opacity:1
	},1300,"linear")

	$("#blight_overlay")
	.delay(0)
	.animate({
		opacity:1
	},700,"linear")

	$(".whole_screen")
	.removeClass("hidden")
	.delay(1500)
	.queue(function(){
		$("#fadeouter").addClass("hidden")
		$(this).dequeue()
	})
	.animate({
		opacity:0
	},1000,"linear")
	.queue(function(){
		$(this).addClass("hidden")
		$(this).dequeue()
	})


}

//ステージ切り替え用の文字を
function changeStageInfoAreaTo(stage_id){
	var stage = stage_data[stage_id]
	$("#stage_number").text(stage.number)

	//タイトルは最後の一文字の色を変える
	var title = stage.title
	var title_prev = title.slice(0,title.length-1)
	var last_letter = title.slice(-1)
	$("#title_prev").text(title_prev)
	$(".last_letter").text(last_letter)
	$(".last_letter").css("color",stage.last_color)

	$("#stage_description").html(stage.description)

	$("#stage_background").attr("src","images/neko/bg/"+stage.back)
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

//tipsを更新
function updateTips(){
	$("#stage_change_tips").text(tips_data[randInt(0,tips_data.length-1)])
}

//ダンジョンの開放状況に合わせてリストを用意する
function prepareDungeonList(){
	//いったんフラッシュ
	$("#dungeon_list").text("")
	updateDungeonDetailTo(0)

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

	updateDungeonSelectFloorData()

}

//階層メニューの反映
function updateDungeonSelectFloorData(){
	var stage_id = data.dungeon_select_menu.stage_id
	var depth = dungeon_data[stage_id].depth

	//最終ダンジョンのぶつ切り感を抑えるために踏破までは2000を見せとく
	if(stage_id==4 && !save.seen_epilogue){
		depth = 2000
	}

	$("#dungeon_detail_total_floor").text(depth)
	$("#dungeon_detail_completed_floor").text(save.dungeon_process[stage_id])
	$("#dungeon_decide_current_depth").text(data.dungeon_select_menu.depth)
}



/*******************************************/
/* オプション画面 */
/*******************************************/



//オプション画面開く
function showOptionMenu(){
	prepareOptionMenu()
	$("#option_menu")
	.removeClass("hidden")
	.animate({
		opacity:0.98,
		translateY:20,
	},200,"easeOutQuart")	
}

//オプション画面閉じる
function fadeOptionMenu(){
	$("#option_menu")
	.animate({
		opacity:0,
		translateY:0,
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}

//オプション画面の準備
function prepareOptionMenu(){
	if(save.options.enable_event_animation){
		$("#enable_event_animation").text("☑")
	}
	else{
		$("#enable_event_animation").text("□")		
	}
	if(save.options.enable_loitering){
		$("#enable_loitering").text("☑")
	}
	else{
		$("#enable_loitering").text("□")		
	}
	if(save.options.enable_scroll_background){
		$("#enable_scroll_background").text("☑")
	}
	else{
		$("#enable_scroll_background").text("□")		
	}

	if(save.notify.enabled){
		$("#enable_notification").text("☑")
	}
	else{
		$("#enable_notification").text("□")		
	}

	if(save.notify.onDeath){
		$("#notification_death .notification_value").text("☑")
	}
	else{
		$("#notification_death .notification_value").text("□")		
	}
	if(save.notify.onClearDungeon){
		$("#notification_clear .notification_value").text("☑")
	}
	else{
		$("#notification_clear .notification_value").text("□")		
	}
	if(save.notify.onFreeSpin){
		$("#notification_freespin .notification_value").text("☑")
	}
	else{
		$("#notification_freespin .notification_value").text("□")		
	}
	if(save.notify.jihou){
		$("#notification_jihou .notification_value").text("☑")
	}
	else{
		$("#notification_jihou .notification_value").text("□")		
	}

	// 通知全体オフなら個別設定をグレーアウト
	if(save.notify.enabled){
		$("#notitication_setting_text").removeClass("notification_off")
		$("#notification_setting_cointainer").removeClass("notification_off")
	}
	else{
		$("#notitication_setting_text").addClass("notification_off")
		$("#notification_setting_cointainer").addClass("notification_off")		
	}


}



/*******************************************/
/* おみくじ画面 */
/*******************************************/


//ガチャ画面開く
function showGachaMenu(){
	prepareGachaMenu()
	$("#gacha_menu")
	.removeClass("hidden")
	.animate({
		opacity:0.98,
		translateY:20,
	},200,"easeOutQuart")	
}

//ガチャ画面閉じる
function fadeGachaMenu(){
	$("#gacha_menu")
	.animate({
		opacity:0,
		translateY:0,
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}

//ガチャメニューの準備
function prepareGachaMenu(){
	updateGachaMenu()
	prepareGachaSprite()
	fadeGachaResult()
	resetMikujiStick()
}

//ガチャメニューの更新
function updateGachaMenu(){
	$("#gacha_coin_show_area").text(save.coin)
	if(isFreeSpinAvailable()){
		$("#gacha_take_button .gacha_button_value").text("無料")
		$("#gacha_take_button").addClass("free_spin_available")
		$("#gacha_take_button").removeClass("free_spin_not_available")
	}
	else{
		$("#gacha_take_button .gacha_button_value").text("200")	
		$("#gacha_take_button").removeClass("free_spin_available")
		$("#gacha_take_button").addClass("free_spin_not_available")
	}

	if(save.coin >= GACHA_COST || isFreeSpinAvailable()){
		$("#gacha_take_button").removeClass("cant_take")
	}
	else{
		$("#gacha_take_button").addClass("cant_take")	
	}
	if(save.coin >= GACHA_COST*10){
		$("#gacha_take_10_button").removeClass("cant_take")
	}
	else{
		$("#gacha_take_10_button").addClass("cant_take")	
	}
}

function prepareGachaSprite(){
	$("#sprite_gacha_siro_daki").css({
		translateX : 0,
		translateY : 0,
		opacity:0,
	})
	$("#sprite_gacha_kuro_daki").css({
		translateX : 0,
		translateY : 0,
		opacity:0,
	})
	$("#sprite_gacha_siro").css({
		translateX : 0,
		translateY : 0,
		opacity:1,
	})
	$("#sprite_gacha_kuro").css({
		translateX : 0,
		translateY : 0,
		opacity:1,
	})
	$("#gacha_result_fade").css({
		opacity:0
	})

	$("#gacha_result_background").removeClass("rotate_bg")

	$("#gacha_result_area").css({
		opacity:0,
		translateY:0
	})
}

//ガチャスプライトの再生
function takeGachaSprite(){
	var PI = Math.PI 
	prepareGachaSprite()

	$("#sprite_gacha_siro")
	.animate({
		translateY : -30
	},50,"linear")
	.animate({
		translateY : 0
	},50,"linear")
	.delay(900)
	.animate({count:0.5},{
		step: function(now){
			$(this).css({
				translateX:  100 * -Math.cos(now/2 * PI + PI/2),
				translateY:  100 * -Math.sin(now/2 * PI + PI/4),
				opacity:1-now*6
			})
		},
		duration : 600,
		easing : "easeOutQuart",
		complete:function(){this.count=0}
	})

	$("#sprite_gacha_siro_daki")
	.delay(1000)
	.animate({count:0.5},{
		step: function(now){
			$(this).css({
				translateX:  100 * -Math.cos(now/2 * PI + PI/2),
				translateY:  100 * -Math.sin(now/2 * PI + PI/4),
				opacity:now*6
			})
		},
		duration : 600,
		easing : "easeOutQuart",
		complete:function(){this.count=0}
	})
	.delay(500)
	.animate({
		translateY : -50
	},100,"linear")
	.animate({
		translateY : -100
	},100,"linear")
	.animate({
		translateY : -50
	},100,"linear")
	.animate({
		translateY : -100
	},100,"linear")

	$("#sprite_gacha_kuro")
	.delay(300)
	.animate({
		translateY : -30
	},50,"linear")
	.animate({
		translateY : 0
	},50,"linear")
	.delay(600)
	.animate({count:0.5},{
		step: function(now){
			$(this).css({
				translateX:  -180 * -Math.cos(now/2 * PI + PI/2),
				translateY:  100 * -Math.sin(now/2 * PI + PI/4),
				opacity:1-now*6
			})
		},
		duration : 600,
		easing : "easeOutQuart",
		complete:function(){this.count=0}
	})

	$("#sprite_gacha_kuro_daki")
	.delay(1000)
	.animate({count:0.5},{
		step: function(now){
			$(this).css({
				translateX:  -180 * -Math.cos(now/2 * PI + PI/2),
				translateY:  100 * -Math.sin(now/2 * PI + PI/4),
				opacity:now*6
			})
		},
		duration : 600,
		easing : "easeOutQuart",
		complete:function(){this.count=0}
	})
	.delay(500)
	.animate({
		translateY : -50
	},100,"linear")
	.animate({
		translateY : -100
	},100,"linear")
	.animate({
		translateY : -50
	},100,"linear")
	.animate({
		translateY : -100
	},100,"linear")

	$("#sprite_gacha_mikuji")
	.delay(1600)
	.delay(500)
	.animate({
		translateY : 50
	},100,"linear")
	.animate({
		translateY : 0
	},100,"linear")
	.animate({
		translateY : 50
	},100,"linear")
	.animate({
		translateY : 0
	},100,"linear")

	$("#gacha_result_fade")
	.delay(3900)
	.animate({
		opacity:0.9999
	},500,"linear")
	.delay(300)
	.queue(function(){
		$("#gacha_result_background").addClass("rotate_bg")
		$(this).dequeue()
	})

}

//ガチャ画面からおみくじの棒を出す
//レアリティ： n ,r ,e, l
//delayミリ秒だけ再生を遅らせる
function addMikujiStick(rarity="n",delay=2600){
	var template='<img class="sprite sprite_gacha_mikuji_stick" src="images/neko/sprite/gacha/mikuji_stick_'+rarity+'.png">'
	var x =  randInt(1,50)
	var y = randInt(1,20)
	$("#mikuji_stick_list")
	.delay(100)
	.queue(function(){
		$(this).append(template)
		//:last-child がなんか動かないので汚い
		$($("#mikuji_stick_list").children().slice(-1))
		.delay(delay)
		.animate({
			opacity:1,
			translateX : x,
			translateY : y
		},10,"linear")
		.animate({
			translateY : y +100
		},100,"linear")
		$(this).dequeue()
	})

}

//おみくじ棒リセット
function resetMikujiStick(){
	$("#mikuji_stick_list").empty()
}

//手に入れたアイテム一覧表示
function showAquiredItemList(item_ids){
	$("#gacha_result").empty()

	for(var id of item_ids){
		var fullItemName = makeFullEquipName(id)
		var rarity = data.item_data[id].rarity
		var tag = '<div class="'+getRarityClassName(rarity)+' gacha_result_item star_background">'+fullItemName+'</div>'
		$("#gacha_result").append(tag)		
	}

	$("#gacha_result")
	.delay(4500)
	.queue(function(){
		showGachaResult()
		$(this).dequeue()
	})
	.delay(300)
	.queue(function(){
		//結果が出たら引き直してOK
		data.disable_gacha_button = false
		$(this).dequeue()
	})
}

//メニュー画面でおみくじが引けるかどうか通知
function updateMenuFreeSpinAvailable(){
	if(isFreeSpinAvailable()){
		$("#gacha_menu_show_button").text("おみくじ（1）")
	}
	else{
		$("#gacha_menu_show_button").text("おみくじ")		
	}
}

//ガチャ詳細表示
function showGachaResult(){
	$("#gacha_result_area")
	.removeClass("hidden")
	.animate({
		opacity:1,
	},300,"easeOutQuart")
}

//ガチャ詳細けす
function fadeGachaResult(){
	$("#gacha_result_area")
	.animate({
		opacity:0,
		translateY:0,
	},300,"easeOutQuart")
	.queue(function () {
		updateGachaMenu()
		prepareGachaSprite()
		resetMikujiStick()
		$(this).addClass("hidden").dequeue();
	})
}

//チュートリアル出す
//type= [notify,]
function showTutorial(type){

	save.tutorial[type] = true
	$("#tutorial_title").text(tutorial_data[type].title)
	$("#tutorial_description").html(tutorial_data[type].description)
	$("#tutorial")
	.queue(function () {
		$(this).removeClass("hidden")
		$(this).dequeue();
	})	
	.css({
		opacity : 0,
		translateY:-5,
		top : tutorial_data[type].y,
		left : tutorial_data[type].x,
		width : tutorial_data[type].width,
		height : tutorial_data[type].height,
	})
	.animate({
		opacity:1,
		translateY:0,
	},200,"easeOutQuart")
	.queue(function () {
		$("#tutorial_click_cover").removeClass("hidden")
		$(this).dequeue();
	})
	if(tutorial_data[type].expire>0){
		$(this).delay(tutorial_data[type].expire)
		.queue(function(){
			fadeTutorial()
			$(this).dequeue();			
		})
	}
}

//チュートリアルポップアップ消す
function fadeTutorial(){
	$("#tutorial")
	.animate({
		opacity:0,
		translateY:-5,
	},200,"easeOutQuart")
	.queue(function () {
		$("#tutorial").addClass("hidden")
		$("#tutorial_click_cover").addClass("hidden")
		$(this).addClass("hidden").dequeue();
	})
}


/*******************************************/
/* おみくじ画面 */
/*******************************************/


//セーブ画面開く
function showSaveMenu(){
	prepareSaveMenu()
	$("#save_menu")
	.removeClass("hidden")
	.animate({
		opacity:0.98,
		translateY:20,
	},200,"easeOutQuart")	
}

//セーブ画面閉じる
function fadeSaveMenu(){
	$("#save_menu")
	.animate({
		opacity:0,
		translateY:0,
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}

//セーブ確認画面開く
function showSaveConfirmMenu(siro_lv=0,kuro_lv=0,playtime=0){

	var playtime = ""+(Math.floor(save.playtime /60 /60))+":"+("0"+Math.floor(save.playtime /60 % 60)).slice(-2)+":"+("0"+Math.floor(save.playtime % 60)).slice(-2)

	$("#save_siro_lv").text(siro_lv)
	$("#save_kuro_lv").text(kuro_lv)
	$("#save_playtime").text(playtime)

	$("#save_read_confirm")
	.removeClass("hidden")
	.animate({
		opacity:0.98,
		translateY:20,
	},200,"easeOutQuart")	
}

//セーブ確認画面閉じる
function fadeSaveConfirmMenu(){
	$("#save_read_confirm")
	.animate({
		opacity:0,
		translateY:0,
	},300,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}

function showSaveDataLoadErrorPopup(){
	$("#save_read_error")
	.css({
		opacity:1,
		translateY:0,		
	})
	.removeClass("hidden")
	.animate({
		opacity:0,
		translateY:-20,
	},4000,"linear")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}

function importSaveAnimation(){
	$("#save_load_cover")
	.css({
		opacity:0,
	})
	.removeClass("hidden")
	.animate({
		opacity:1,
	},500,"linear")
	.queue(function () {
		fadeSaveMenu()
		fadeSaveConfirmMenu()
		removeOldLog()
		castMessage("過去のセーブデータを読み込みました！")
		initView()
		$(this).dequeue()
	})
	.animate({
		opacity:0,
	},500,"linear")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}



function prepareSaveMenu(){
	$("#save_data_area").val(getReversedSaveString())
}

function showCopiedTicker(){
	$("#copied")
	.css({
		opacity:1,
		translateY:0,		
	})
	.removeClass("hidden")
	.animate({
		opacity:0,
		translateY:-20,
	},4000,"linear")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})

}


/*******************************************/
/*エピローグ*/
/*******************************************/

//
function updateEpilogueButtonShowState(){
	if(save.dungeon_process[4] >= 2000){
		$("#epilogue_button").removeClass("hidden")
	}
	else{
		$("#epilogue_button").addClass("hidden")	
	}
	if(save.seen_epilogue){
		$("#epilogue_button").removeClass("epilogue_unseen")	
	}
	else{
		$("#epilogue_button").addClass("epilogue_unseen")	
	}
}

//エピローグ
function showEpilogue(){
	prepareEpilogue()
	save.seen_epilogue = true
	updateEpilogueButtonShowState()
	$("#epilogue")
	.removeClass("hidden")
	.animate({
		opacity:1,
	},500,"linear")
	proceedEpilogue()
}

//エピローグ消す
function fadeEpilogue(){
	updateCurrentFloorText()
	updateDungeonSelectFloorData()
	$("#epilogue")
	.animate({
		opacity:0,
		translateY:-5,
	},3200,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}


function prepareEpilogue(){
	$("#epilogue_text").text("")
	$(".epilogue_illust").css("opacity",1)
	data.epilogue_line=0
	data.epilogue_scene=0
}

//エピローグを1文字進める
function queueLetter(l){
	var message_queue = $("#epilogue_dummy")
	message_queue.delay(20).queue(function(){
		$("#epilogue_text").append(l)
		message_queue.dequeue()
	})
}

//1クリックぶん進行する
function proceedEpilogue(){
	//ページにまだ行がある場合
	if(data.epilogue_line < epilogue_text[data.epilogue_scene].length){
		for(var letter of epilogue_text[data.epilogue_scene][data.epilogue_line]){
			queueLetter(letter)
		}
		queueLetter("<br>")
	}
	//ページ送り
	else{
		//最後のページの場合ゆっくり戻って消す
		if(data.epilogue_scene == epilogue_text.length-1){
			fadeEpilogue()
			return
		}
		$("#epilogue_"+data.epilogue_scene).animate({
			opacity:0
		},1000,"linear")
		data.epilogue_scene++
		data.epilogue_line = 0
		$("#epilogue_text").text("")
		for(var letter of epilogue_text[data.epilogue_scene][data.epilogue_line]){
			queueLetter(letter)
		}
		queueLetter("<br>")
	}
	data.epilogue_line ++
}


//遊んでくれてありがとう
function showThankyouImage(){
	prepareEpilogue()
	save.seen_omake = true
	updateOmakeButtonShowState()
	$("#omake_image")
	.removeClass("hidden")
	.animate({
		opacity:1,
	},500,"linear")
}

//遊んでくれてありがとうのやつけす
function fadeThankyouImage(){
	$("#omake_image")
	.animate({
		opacity:0,
		translateY:-5,
	},1200,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}

function updateOmakeButtonShowState(){
	if(save.dungeon_process[4] > 9999){
		$("#omake_button").removeClass("hidden")
		$("#rest_button").removeClass("hidden")
	}
	else{
		$("#omake_button").addClass("hidden")	
		$("#rest_button").addClass("hidden")	
	}
	if(save.seen_omake){
		$("#omake_button").removeClass("epilogue_unseen")	
	}
	else{
		$("#omake_button").addClass("epilogue_unseen")	
	}
}


/**ショップメニュー**/


function updateShopButtonShowState(){
	if(save.current_dungeon_id ==5){ //エクストラダンジョンでのみ表示
		$("#shop_button").removeClass("hidden")	
	}
	else{
		$("#shop_button").addClass("hidden")	
	}
	if(isRecentlyOpenedShop()){
		$("#shop_button_image").removeClass("hidden")	
		$("#shop_button_image_new").addClass("hidden")	
	}
	else{
		$("#shop_button_image").addClass("hidden")	
		$("#shop_button_image_new").removeClass("hidden")	
	}
}

//ショップメニューの表示更新
function prepareShopMenu(){
	//ショップアイテム名
	var shop_item_name = $(".shop_item_name")
	var shop_item_cost = $(".shop_item_cost")
	var shop_item_power = $(".shop_item_power")
	var shop_item_value = $(".shop_item_value")
	var params = ["str","dex","def","agi"]
	
	for(var i=0;i<5;++i){
		var item_id = save.shop.items[i].id
		var rank = save.shop.items[i].rank
		var item_name = getRaritySymbol(data.item_data[item_id].rarity) + data.item_data[item_id].name+"+" + save.shop.items[i].rank 
		$(shop_item_name[i]).text(item_name)
		$(shop_item_cost[i]).text(save.shop.items[i].cost)

		//つよさ欄の更新
		var param_total = 0
		for(var param of params){
			param_total += getParameterBuildTo(item_id,param,rank)
		}
		$(shop_item_power[i]).text(param_total)

		//買えるボタン
		if(save.powder > save.shop.items[i].cost){
			$(shop_item_value[i]).addClass("buyable")
		}
		else{
			$(shop_item_value[i]).removeClass("buyable")			
		}

		//買っても意味ないよ表示
		if(save.shop.items[i].rank <= save.item[item_id]){
			$(shop_item_name[i]).addClass("not_effective")
		}
		else{
			$(shop_item_name[i]).removeClass("not_effective")
		}

		//レア度
		$(shop_item_name[i]).removeClass("shop_rare")
		$(shop_item_name[i]).removeClass("shop_epic")
		$(shop_item_name[i]).removeClass("shop_legendary")
		$(shop_item_name[i]).addClass("shop_"+getRarityClassName(""+data.item_data[save.shop.items[i].id].rarity))

	}

	//残り何回かな
	$("#shop_refresh_last").text( 10 - save.shop.times_item_refresh_today)

	//粉更新
	if(!$("#current_powder_amount").is(":animated")){
		$("#current_powder_amount").text(save.powder)
	}
	//コイン更新
	if(!$("#item_shop_coin_amount").is(":animated")){
		$("#item_shop_coin_amount").text(save.coin)
	}
}

//ショップアイテムのパラメータ詳細を更新
function updateShopItemDetailTo(domobject){
	var shop_item_index = $(domobject).attr("id").slice(-1)
	var item_id = save.shop.items[shop_item_index].id
	var rank = save.shop.items[shop_item_index].rank

	var params = ["str","dex","def","agi"]
	for(var param of params){
		$("#shop_param_value_"+param).text(getParameterBuildTo(item_id,param,rank))
	}
	$("#shop_item_flavor").text(data.item_data[item_id].caption)
}

function showShopMenu(){
	save.last_time_shop_open = new Date().getTime()
	updateShopItemList()
	updateShopButtonShowState()
	prepareShopMenu()

	$("#pirika_message").text("")

	$("#shop_menu")
	.css({
		translateY:-20,
		opacity:0,
	})
	.removeClass("hidden")
	.animate({
		translateY:0,
		opacity:1,
	},200,"linear")

	$("#shop_pirika")
	.css({
		translateY:-20,
		opacity:0,
	})
	.delay(400)
	.animate({
		translateY:0,
		opacity:1,
	},200,"linear")

	$("#shop_words_frame")
	.css({
		translateY:-20,
		opacity:0,
	})
	.delay(700)
	.animate({
		translateY:0,
		opacity:1,
	},600,"linear")
	.queue(function(){
		if(save.has_visit_shop == false){
			talkPirika("鍛冶妖精のピリカっす！作ったアイテムを粉と交換するっすよ！いくらかあげるんで、試してほしいっす！")
			save.powder += 15000
			prepareShopMenu()
			numerateCurrentPowderAmount()
			save.has_visit_shop = true
		}
		else{
			talkPirika("やぁやぁ、いらっしゃい！今日クラフトしたアイテムを原価で売るっすよー！")
		}
		$(this).dequeue()
	})

	$("#shop_current_powder")
	.css({
		opacity:0,
	})
	.delay(100)
	.animate({
		opacity:1,
	},800,"linear")

	$("#shop_param_list")
	.css({
		opacity:0,
	})
	.delay(190)
	.animate({
		opacity:1,
	},800,"linear")

	$("#update_shop_item_button")
	.css({
		opacity:0,
	})
	.delay(390)
	.animate({
		opacity:1,
	},800,"linear")

	$("#item_refresh_text")
	.css({
		opacity:0,
	})
	.delay(390)
	.animate({
		opacity:1,
	},800,"linear")

	$("#shop_list_caption_area")
	.css({
		opacity:0,
	})
	.delay(690)
	.animate({
		opacity:1,
	},800,"linear")

	$("#item_refresh_coin_show_area")
	.css({
		opacity:0,
	})
	.delay(690)
	.animate({
		opacity:1,
	},800,"linear")

	$("#shop_item_flavor")
	.css({
		opacity:0,
	})
	.delay(390)
	.animate({
		opacity:1,
	},800,"linear")

	$(".shop_item").css({
		opacity:0,
		translateY : 30,
	})

	for(var i=0;i<5;++i){
		$($(".shop_item")[i])
		.delay(300)
		.delay(100*i)
		.animate({
			translateY : 0,
			opacity:1
		},1000,"easeOutQuart")
	}

}

function fadeShopMenu(){
	$("#shop_menu")
	.animate({
		opacity:0,
		translateY:-20,
	},500,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})
}


function appendTalkLastMessage(l){
	var message_queue = $("#epilogue_dummy")
	message_queue
	.delay(10)
	.queue(function(){
		$("#pirika_message").append(l)
		message_queue.dequeue()
	})
	
}

//ピリカちゃんに喋らせる
function talkPirika(message){

	if($("#pirika_message").is(":animated")){
		return
	}

	var letters = message.split("")
	$("#pirika_message").text("").animate({opacity:1},90+message.length * 10,"linear")
	for(letter of letters){
		appendTalkLastMessage(letter)
	}
}

//現在の粉数をチャリチャリっとアニメーションさせる
function numerateCurrentPowderAmount(){
	$("#current_powder_amount").numerator({
		easing : "linear",
		duration : 1000,
		toValue : save.powder
	})
}

function jumpPirika(){

	//無限ぴこぴこ対策のためにアニメーション中は処理しない
	if($("#shop_pirika").is(":animated")){
		return
	}	

	$("#shop_pirika").delay(20)
	.animate({
		translateY:-30,
	},70,"linear")
	.animate({
		translateY:0,
	},70,"linear")
	.animate({
		translateY:-30,
	},70,"linear")
	.animate({
		translateY:0,
	},70,"linear")
}

function talkPirikaRandom(){
	var messages = [
	"きゃっ！　もー、触るなら事前に言ってほしいっす...",
	"粉はイガイガしてもあんまし集まらないっすねー。のーんびりお友達から譲ってもらってくださいっす。",
	"コインをちょっと頂くっすけど、工房の在庫とすぐ入れ替えることもできるっすよ！",
	"ショップは日付が変わるごとに新しいやつと入れ替えてるっす！",
	"うー、なでなでしてくれるのはうれしいっすけどなんか落ち着かないっすよー...",
	]
	talkPirika(messages[randInt(0,messages.length-1)])
	jumpPirika()
}

function refreshShopItemListAnimation(){
	$("#item_shop_coin_amount").numerator({
		easing : "linear",
		duration : 1000,
		toValue : save.coin
	})

	for(var i=0;i<5;++i){
		$($(".shop_item")[i])
		.delay(100*i)
		.animate({
			translateX: -50,
			opacity:0,
		},1000,"easeOutQuart")
		.queue(function(){
			prepareShopMenu()
			$(this).css({
				translateX : 50,
			})
			.dequeue()
		})
		.delay(200)
		.animate({
			translateX: 0,
			opacity:1,
		},1000,"easeOutQuart")
	}

	talkPirika("はいっ！　在庫から持ってきたっすよ！　いいのが見つかると良いっすね！")
}