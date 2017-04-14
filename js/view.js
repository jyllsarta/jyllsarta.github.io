
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
	$("#current_floor").text(save.current_floor)
	$("#max_floor").text(dungeon_data[save.current_dungeon_id].depth)
	///潜り過ぎならoverdepthedをつける
	if(save.current_floor >= dungeon_data[save.current_dungeon_id].depth){
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

		//ラスダンの場合、40Fごとに
		// [landscape順でループ >ID順でループ]する
		//きっかり40Fごとに変わるとバレバレになるので257のオフセットを与えている
		var floor = save.current_floor + 257
		var dungeon = (Math.floor(floor / 40)) % 4
		var landscape = (Math.floor(floor / 160)) % 3

		$("#background_image_bg").attr("src","images/neko/bg/st"+dungeon+"-"+landscape+"-0.png")
		$("#background_image_floor").attr("src","images/neko/bg/st"+dungeon+"-"+landscape+"-1.png")
		$("#background_image_fg").attr("src","images/neko/bg/st"+dungeon+"-"+landscape+"-2.png")
		$("#background_image_fg").css("mix-blend-mode",getBackgroundImageOverlayType(dungeon))
	}

//階段降り時のフェードアウトイン
function fadeOutAndFadeInStairs(){

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

	if(data.hyper_event_dash_mode){
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
	var delta = (Math.random()-.5)
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
	if(Math.abs(data.siro.vx) > .7){
		if (data.siro.vx > 0){
			$("#character_siro img").addClass("flip")
		}
		else{
			$("#character_siro img").removeClass("flip")
		}
		data.siro.x += data.siro.vx
		$("#character_siro").css("translateX", data.siro.x)
	}
	//それ以外の場合はちょっと屈伸してみたりする
	else if(data.frame % 20 ==0){
		var y = parseInt($("#character_siro").css("translateY"))
		$("#character_siro").css("translateY",y>0?0:1)
	}
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
	var delta = (Math.random()-.5)
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
	if(Math.abs(data.kuro.vx) > .7 ){
		if (data.kuro.vx > 0){
			$("#character_kuro img").addClass("flip")
		}
		else{
			$("#character_kuro img").removeClass("flip")
		}
		data.kuro.x += data.kuro.vx
		$("#character_kuro").css("translateX",data.kuro.x)
	}
	//それ以外の場合はちょっと屈伸してみたりする
	else if(data.frame % 20 ==0){
		var y = parseInt($("#character_kuro").css("translateY"))
		$("#character_kuro").css("translateY",y>0?0:1)
	}

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
	},2000,"linear")
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
	},1200,"easeOutQuart")
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
	$("#current_floor").text(save.current_floor)
	$("#max_floor").text(dungeon_data[save.current_dungeon_id].depth)
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

function showBattleSprite(){

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
	.delay(3400)
	.animate({
		translateY:-30,
		opacity:0
	},1500,"easeOutQuart")
	.queue(function(){
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_battle_background").css("opacity",1)

	$("#sprite_battle_text")
	.delay(100)
	.animate({
		translateY:0,
		opacity:1,
	},800,"easeOutQuart")

	$("#sprite_battle_enemy1")
	.delay(600)
	.animate({
		translateX:0,
		opacity:1
	},1500,"easeOutQuart")
	.delay(1400)
	.animate({
		translateY:-100,
		translateX:160,
	},2000,"easeOutQuart")	

	$("#sprite_battle_enemy2")
	.delay(800)
	.animate({
		translateX:0,
		opacity:1
	},1500,"easeOutQuart")
	.delay(1200)
	.animate({
		translateY:-100,
		translateX:160,
	},2000,"easeOutQuart")	

	$("#sprite_battle_enemy3")
	.delay(1000)
	.animate({
		translateX:0,
		opacity:1
	},1500,"easeOutQuart")
	.delay(1000)
	.animate({
		translateY:-100,
		translateX:160,
	},2000,"easeOutQuart")	

	$("#sprite_battle_siro")
	.delay(1500)
	.animate({
		translateX:0,
		opacity:1
	},1500,"easeOutQuart")
	.delay(500)
	.animate({
		translateY:-100,
		translateX:-200,
	},2000,"easeOutQuart")	

	$("#sprite_battle_kuro")
	.delay(1800)
	.animate({
		translateX:60,
		opacity:1
	},1500,"easeOutQuart")
	.delay(200)
	.animate({
		translateY:-100,
		translateX:-100,
	},2000,"easeOutQuart")	
	
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
	.delay(3000)
	.animate({
		translateY:-30,
		opacity:0
	},1500,"easeOutQuart")
	.queue(function(){
		$(this).addClass("hidden")
		$(this).dequeue()
	})

	$("#sprite_boss_battle_background").css("opacity",1)

	$("#sprite_boss_battle_boss")
	.delay(300)
	.animate({
		translateY:0,
		opacity:1,
	},800,"easeOutQuart")

	$("#sprite_boss_battle_kuro")
	.delay(1200)
	.animate({
		translateX:0,
		opacity:1
	}, 1500,"easeOutQuart")
	.delay(800)
	.animate({
		translateY:-170,
		translateX:-400,
		opacity:.4
	}, 1000,"easeOutQuart")

	$("#sprite_boss_battle_siro")
	.delay(1200)
	.animate({
		translateX:0,
		opacity:1
	}, 1500,"easeOutQuart")
	.delay(800)
	.animate({
		translateY:-170,
		translateX:400,
		opacity:.4
	}, 1000,"easeOutQuart")

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

	//イベント超速再生中はスプライトの発生を抑制 Yo Yo
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
	param_prevs[0].textContent = (getBuildedParameter(item_id,"str"))
	param_prevs[1].textContent = (getBuildedParameter(item_id,"dex"))
	param_prevs[2].textContent = (getBuildedParameter(item_id,"def"))
	param_prevs[3].textContent = (getBuildedParameter(item_id,"agi"))
	if(save.item[item_id] < MAX_EQUIP_BUILD){
		param_afters[0].textContent = (Math.floor(getBuildedParameter(item_id,"str")*1.1))
		param_afters[1].textContent = (Math.floor(getBuildedParameter(item_id,"dex")*1.1))
		param_afters[2].textContent = (Math.floor(getBuildedParameter(item_id,"def")*1.1))
		param_afters[3].textContent = (Math.floor(getBuildedParameter(item_id,"agi")*1.1))
		param_diffs[0].textContent = (Math.floor(getBuildedParameter(item_id,"str")*0.1))
		param_diffs[1].textContent = (Math.floor(getBuildedParameter(item_id,"dex")*0.1))
		param_diffs[2].textContent = (Math.floor(getBuildedParameter(item_id,"def")*0.1))
		param_diffs[3].textContent = (Math.floor(getBuildedParameter(item_id,"agi")*0.1))

		if((Math.floor(getBuildedParameter(item_id,"str")*0.1)) < 0){
			$(param_diffs[0]).addClass("minus")
			$(param_diffs[0]).removeClass("plus")
		}
		else if((Math.floor(getBuildedParameter(item_id,"str")*0.1)) > 0){
			$(param_diffs[0]).removeClass("minus")
			$(param_diffs[0]).addClass("plus")			
		}
		else{
			$(param_diffs[0]).removeClass("minus")
			$(param_diffs[0]).removeClass("plus")				
		}

		if((Math.floor(getBuildedParameter(item_id,"dex")*0.1)) < 0){
			$(param_diffs[1]).addClass("minus")
			$(param_diffs[1]).removeClass("plus")
		}
		else if((Math.floor(getBuildedParameter(item_id,"dex")*0.1)) > 0){
			$(param_diffs[1]).removeClass("minus")
			$(param_diffs[1]).addClass("plus")			
		}
		else{
			$(param_diffs[1]).removeClass("minus")
			$(param_diffs[1]).removeClass("plus")				
		}

		if((Math.floor(getBuildedParameter(item_id,"def")*0.1)) < 0){
			$(param_diffs[2]).addClass("minus")
			$(param_diffs[2]).removeClass("plus")
		}
		else if((Math.floor(getBuildedParameter(item_id,"def")*0.1)) > 0){
			$(param_diffs[2]).removeClass("minus")
			$(param_diffs[2]).addClass("plus")			
		}
		else{
			$(param_diffs[2]).removeClass("minus")
			$(param_diffs[2]).removeClass("plus")				
		}

		if((Math.floor(getBuildedParameter(item_id,"agi")*0.1)) < 0){
			$(param_diffs[3]).addClass("minus")
			$(param_diffs[3]).removeClass("plus")
		}
		else if((Math.floor(getBuildedParameter(item_id,"agi")*0.1)) > 0){
			$(param_diffs[3]).removeClass("minus")
			$(param_diffs[3]).addClass("plus")			
		}
		else{
			$(param_diffs[3]).removeClass("minus")
			$(param_diffs[3]).removeClass("plus")				
		}

	}
	else{
		param_afters[0].textContent = (Math.floor(getBuildedParameter(item_id,"str")))
		param_afters[1].textContent = (Math.floor(getBuildedParameter(item_id,"dex")))
		param_afters[2].textContent = (Math.floor(getBuildedParameter(item_id,"def")))
		param_afters[3].textContent = (Math.floor(getBuildedParameter(item_id,"agi")))
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
}

//現在装備エリアに表示されるべきアイテムIDのリストを作成する
function getCurrentPageItemList(){
	var item_ids = []
	var sort_order = data.equipment_menu.sort_order
	var current_page = data.equipment_menu.current_page

	//sort_order==0 -> ID順
	//sort_order==1 -> 総パラメータ順
	//sort_order==2,3,4,5 -> STR,DEX,DEF,AGI順
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
	var item_ids = save.equip[data.equipment_menu.current_character]
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
	updateEquipListName()
	updateEquipListParam()
	updateEquipBuildButtonShowState()
	updateSortOrderButtonState()
	updateEquipListParameterIndex()
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

	if(current_page == 1){
		$("#pager_button_prev").addClass("disabled")		
	}
	if(current_page == max_page){
		$("#pager_button_next").addClass("disabled")		
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
	var equip_num = save.equip[current_chara_name].length

	for(var i=0;i<4;++i){
		$($(".current_equip_text")[i]).text("-")
	}

	for(var i=0;i<equip_num;++i){
		var item_id = save.equip[current_chara_name][i]
		var item_name = data.item_data[item_id]
		$($(".current_equip_text")[i]).text(makeFullEquipName(item_id))
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

//ATK,DEF参考値を画面に描画
function updateEquipDetailATKDEF(){
	var current_chara_name = data.equipment_menu.current_character
	$("#atk_value").text(calcAttack(current_chara_name))
	$("#def_value").text(calcDefence(current_chara_name))
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
	$("#achievement_item_found").text(getSumItemFounded())
	$("#achievement_item_builded").text(getSumItemFoundedFullBuilded())
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
	　$("#playhour").text(("0"+Math.floor(save.playtime /60 /60)).slice(-2))
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

	$("#fadeouter")
	.removeClass("hidden")
	.css("opacity",0)
	.animate({
		opacity:1
	},1000)

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
	var depth = data.dungeon_select_menu.depth
	$("#dungeon_detail_total_floor").text(dungeon_data[stage_id].depth)
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
}



/*******************************************/
/* オプション画面 */
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
		$("#gacha_take_button .gacha_button_value").text("100")	
		$("#gacha_take_button").removeClass("free_spin_available")
		$("#gacha_take_button").addClass("free_spin_not_available")
	}

	if(save.coin >= 100 || isFreeSpinAvailable()){
		$("#gacha_take_button").removeClass("cant_take")
	}
	else{
		$("#gacha_take_button").addClass("cant_take")	
	}
	if(save.coin >= 1000){
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
	.delay(500)
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
	//結果が出たら引き直してOK
	data.disable_gacha_button = false
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







