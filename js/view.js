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
	$("#current_floor").text(save.current_floor)
	$(".dungeon_name").text(dungeon_data[stage_id].name)
	$("#next_event_sec").text(save.next_event_timer)

	updateCurrentHP()
	updateCurrentLVEXP()
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
	$("#background_image").css("left","-"+data.background_image_scroll_position+"px")	
}

//階段降り時のフェードアウトイン
function fadeOutAndFadeInStairs(){
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
		scrollBackgroundImageTo(background_pos)
		updateBackgroundImagePosition()
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

//メッセージを流す
function showMessage(message){
	var tag = '<li class="log"><span class="log_time">'+getCurrentTimeString()+'</span>'
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
	},400,"easeOutExpo")
}

//画面内のログ表示エリアにデータを吐く
function castMessage(message){
	$("#message_log_queue_dummy")
	.delay(150)
	.queue(function(){
		showMessage(message)
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

}

//しろがゆらゆら移動
function  loiteringSiro(){
	if(save.status.siro.hp <= 0){
		//たまーにピクピクする

		if(randInt(1,100) < 5){
			$("#character_siro")	
			.animate({
				left : data.siro.x-1
			},100,"linear")
			.animate({
				left : data.siro.x
			},70,"linear")
		}
		return
	}

	data.siro.x += data.siro.vx
	$("#character_siro").css("left",data.siro.x)
	//毎フレーム速度を更新するとカタカタ震えるだけになるので
	//10フレームに1回のみ更新する
	if (data.frame % 4 != 0){
		return
	}
	//[-0.25,0.25]
	var delta = (Math.random() -0.5)
	data.siro.vx += delta
	//両端に寄り過ぎてるときは逆向きに力を加える
	if (data.siro.x < 450 && data.siro.vx < 0){
		data.siro.vx += 0.2
	}
	if (data.siro.x > 700 && data.siro.vx > 0){
		data.siro.vx -= 0.2
	}
	if (data.siro.vx > 0){
		$("#character_siro img").addClass("flip")
	}
	else{
		$("#character_siro img").removeClass("flip")
	}
}

//くろがゆらゆら移動
function  loiteringKuro(){
	if(save.status.siro.hp <= 0){
		//たまーにピクピクする
		if(randInt(1,100) < 5){
			$("#character_kuro")	
			.animate({
				left : data.kuro.x-1
			},60,"linear")
			.animate({
				left : data.kuro.x
			},40,"linear")
		}
		return
	}


	data.kuro.x += data.kuro.vx
	$("#character_kuro").css("left",data.kuro.x)
	//毎フレーム速度を更新するとカタカタ震えるだけになるので
	//10フレームに1回のみ更新する
	if (data.frame % 6 != 0){
		return
	}
	//[-0.25,0.25]
	var delta = (Math.random() -0.5)
	data.kuro.vx += delta/2
	//両端に寄り過ぎてるときは逆向きに力を加える
	if (data.kuro.x < 450 && data.kuro.vx < 0){
		data.kuro.vx += 0.2
	}
	if (data.kuro.x > 700 && data.kuro.vx > 0){
		data.kuro.vx -= 0.2
	}
	if (data.kuro.vx > 0){
		$("#character_kuro img").addClass("flip")
	}
	else{
		$("#character_kuro img").removeClass("flip")
	}
}

//自動復活タイマーの更新
function updateAutoRessurectionCount(){
	$("#ressurect_count").text(save.auto_ressurect_timer)
}

//復活演出
function ressurectAnimation(){
	$("#ressurection_light")
	.removeClass("hidden")
	.animate({
		opacity:1
	},200,"easeOutQuart")
	.delay(300)
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
		default:
		return "images/neko/sprite/"+splite_kind+".png"
		break
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
		top:"120px"
	}, 500, "swing")
	.delay(3000)
	.animate({
		opacity	:0,
		top:"110px",
	},800,"easeOutQuart")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
		//バトル結果の画面反映はスプライト消えたあと
		updateCurrentHP() 
	})
}

//アイテム取得スプライトを初期状態に戻す
function resetItemSprite(){
	$("#item_sprite").addClass("hidden")
	$("#sprite_item_background").css("opacity",0)
	$("#item_sprite").css({
		top:80,
		opacity:0		
	})
	$("#sprite_item_treasure").css({
		top:-10,
		opacity:0		
	})
	$("#sprite_item_kuro").css({
		top:-10,
		opacity:0		
	})
	$("#sprite_item_siro").css({
		top:-10,
		opacity:0		
	})
	$("#sprite_item_text").css({
		top:-10,
		opacity:0		
	})
}

//アイテム取得スプライトをスライドインする
function showItemSprite(){
	resetItemSprite()
	$("#item_sprite").removeClass("hidden")

	$("#item_sprite")
	.animate({
		top:110,
		opacity:1
	},500,"swing")
	.delay(3000)
	.animate({
		top:80,
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
		top:0,
		opacity:1
	},100,"easeOutQuart")

	$("#sprite_item_kuro")
	.delay(500)
	.animate({
		top:0,
		opacity:1,
	},800,"easeOutQuart")
	.delay(800)
	.animate({
		top:-30
	},100,"linear")
	.animate({
		top:0
	},100,"linear")
	.delay(80)
	.animate({
		top:-20
	},100,"linear")
	.animate({
		top:0
	},100,"linear")

	$("#sprite_item_siro")
	.delay(600)
	.animate({
		top:0,
		opacity:1,
	},800,"easeOutQuart")
	.delay(750)
	.animate({
		top:-30
	},100,"linear")
	.animate({
		top:0
	},100,"linear")
	.delay(10)
	.animate({
		top:-30
	},100,"linear")
	.animate({
		top:0
	},100,"linear")

	$("#sprite_item_text")
	.delay(100)
	.animate({
		top:0,
		opacity:1,
	},800,"easeOutQuart")
}

function resetBattleSprite(){
	$("#sprite_battle_enemy1").css({
		opacity:0,
		top:0,
		left:-50
	})
	$("#sprite_battle_enemy2").css({
		opacity:0,
		top:0,
		left:-50
	})
	$("#sprite_battle_enemy3").css({
		opacity:0,
		top:0,
		left:-50
	})
	$("#sprite_battle_siro").css({
		opacity:0,
		top:0,
		left:100
	})
	$("#sprite_battle_kuro").css({
		opacity:0,
		top:0,
		left:100
	})
	$("#sprite_battle_text").css({
		opacity:0,
		top:0,
		top:-20
	})
}

function showBattleSprite(){
	resetBattleSprite()
	$("#battle_sprite").removeClass("hidden")

	$("#battle_sprite")
	.animate({
		top:110,
		opacity:1
	},500,"swing")
	.delay(3400)
	.animate({
		top:80,
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
		top:0,
		opacity:1,
	},800,"easeOutQuart")

	$("#sprite_battle_enemy1")
	.delay(600)
	.animate({
		left:0,
		opacity:1
	},1500,"easeOutQuart")
	.delay(1400)
	.animate({
		top:-100,
		left:160,
	},2000,"easeOutQuart")	

	$("#sprite_battle_enemy2")
	.delay(800)
	.animate({
		left:0,
		opacity:1
	},1500,"easeOutQuart")
	.delay(1200)
	.animate({
		top:-100,
		left:120,
	},2000,"easeOutQuart")	

	$("#sprite_battle_enemy3")
	.delay(1000)
	.animate({
		left:0,
		opacity:1
	},1500,"easeOutQuart")
	.delay(1000)
	.animate({
		top:-100,
		left:160,
	},2000,"easeOutQuart")	

	$("#sprite_battle_siro")
	.delay(1500)
	.animate({
		left:0,
		opacity:1
	},1500,"easeOutQuart")
	.delay(500)
	.animate({
		top:-100,
		left:-180,
	},2000,"easeOutQuart")	

	$("#sprite_battle_kuro")
	.delay(1800)
	.animate({
		left:60,
		opacity:1
	},1500,"easeOutQuart")
	.delay(200)
	.animate({
		top:-100,
		left:-70,
	},2000,"easeOutQuart")	
	
}

function resetStairsSprite(){
	$("#sprite_stairs_text").css({
		opacity:0,
		top:-50
	})
	$("#sprite_stairs_siro").css({
		opacity:0,
		top:0,
		left:-50
	})
	$("#sprite_stairs_kuro").css({
		opacity:0,
		top:0,
		left:-50
	})

}

function showStairsSprite(){
	resetStairsSprite()
	$("#stairs_sprite").removeClass("hidden")

	$("#stairs_sprite")
	.animate({
		top:110,
		opacity:1
	},500,"swing")
	.delay(3400)
	.animate({
		top:80,
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
		top:0,
		opacity:1,
	},800,"easeOutQuart")

	$("#sprite_stairs_siro")
	.delay(400)
	.animate({
		left:0,
		opacity:1
	},500,"easeOutQuart")
	.delay(600)
	.animate({
		top:-50,
		left:30,
	},300,"linear")	
	.animate({
		top:-30,
		left:50,
	},300,"swing")	
	.delay(300)
	.animate({
		top:-70,
		left:80,
	},300,"linear")	
	.animate({
		top:-50,
		left:130,
	},300,"swing")	
	.delay(300)
	.animate({
		top:-90,
		left:160,
	},300,"linear")	
	.animate({
		top:-70,
		left:190,
	},300,"swing")
	.delay(250)
	.animate({
		top:-110,
		left:190,
	},300,"linear")	
	.animate({
		top:-90,
		left:220,
	},300,"swing")

	$("#sprite_stairs_kuro")
	.delay(700)
	.animate({
		left:0,
		opacity:1
	},500,"easeOutQuart")
	.delay(600)
	.animate({
		top:-50,
		left:30,
	},300,"linear")
	.animate({
		top:-30,
		left:50,
	},300,"swing")	
	.delay(250)
	.animate({
		top:-70,
		left:80,
	},300,"linear")	
	.animate({
		top:-50,
		left:130,
	},300,"swing")	
	.delay(250)
	.animate({
		top:-90,
		left:160,
	},300,"linear")	
	.animate({
		top:-70,
		left:190,
	},300,"swing")	
	.delay(250)
	.animate({
		top:-110,
		left:190,
	},300,"linear")	
	.animate({
		top:-90,
		left:220,
	},300,"swing")	
}


function resetBossBattleSprite(){
$("#sprite_boss_battle_boss").css({
	top:-100,
	opacity:0
})
$("#sprite_boss_battle_siro").css({
	top:0,
	left:500,
	opacity:0
})
$("#sprite_boss_battle_kuro").css({
	top:0,
	left:-500,
	opacity:0
})
}

function showBossBattleSprite(){
	resetBossBattleSprite()
	$("#boss_battle_sprite").removeClass("hidden")

	$("#boss_battle_sprite")
	.animate({
		top:110,
		opacity:1
	},500,"swing")
	.delay(3000)
	.animate({
		top:80,
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
		top:0,
		opacity:1,
	},800,"easeOutQuart")

	$("#sprite_boss_battle_kuro")
	.delay(1200)
	.animate({
		left:0,
		opacity:1
	}, 1500,"easeOutQuart")
	.delay(800)
	.animate({
		left:-400,
		top:-170,
		opacity:.4
	}, 1000,"easeOutQuart")

	$("#sprite_boss_battle_siro")
	.delay(1200)
	.animate({
		left:0,
		opacity:1
	}, 1500,"easeOutQuart")
	.delay(800)
	.animate({
		left:400,
		top:-170,
		opacity:.4
	}, 1000,"easeOutQuart")

}

//HPの表記反映
function updateCurrentHP(){
	$("#hp_siro").text(save.status.siro.hp)
	$("#hp_kuro").text(save.status.kuro.hp)
	$("#hp_max_siro").text(save.status.siro.max_hp)
	$("#hp_max_kuro").text(save.status.kuro.max_hp)
}

//lv, expの表記反映
function updateCurrentLVEXP(){
	$("#lv_siro").text(save.status.siro.lv)
	$("#lv_kuro").text(save.status.kuro.lv)
	$("#exp_siro").text(save.status.siro.exp)
	$("#exp_kuro").text(save.status.kuro.lv)
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
	prepareStatusParameters()
	hideAllStatusBoardElements()
	$("#status_menu")
	.removeClass("hidden")
	.animate({
		opacity:0.98,
		top:"50px",
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
		top:"50px",
	},200,"easeOutQuart")
}

//装備強化メニューの表示項目をitem_idのものに更新
function prepareEquipBuildMenu(item_id){
	$("#coin_amount").text(save.coin)
	$(".equip_name").text(data.item_data[item_id].name)
	$(".build_prev").text("+"+(save.item[item_id]-1))
	$(".build_after").text("+"+Math.min(MAX_EQUIP_BUILD-1,save.item[item_id]))
	$("#build_cost").text(getBuildCost(item_id))


	var param_prevs = $(".param_prev")
	var param_afters = $(".param_after")
	param_prevs[0].textContent = (getBuildedParameter(item_id,"str"))
	param_prevs[1].textContent = (getBuildedParameter(item_id,"dex"))
	param_prevs[2].textContent = (getBuildedParameter(item_id,"def"))
	param_prevs[3].textContent = (getBuildedParameter(item_id,"agi"))
	if(save.item[item_id] < MAX_EQUIP_BUILD){
		param_afters[0].textContent = (Math.floor(getBuildedParameter(item_id,"str")*1.1))
		param_afters[1].textContent = (Math.floor(getBuildedParameter(item_id,"dex")*1.1))
		param_afters[2].textContent = (Math.floor(getBuildedParameter(item_id,"def")*1.1))
		param_afters[3].textContent = (Math.floor(getBuildedParameter(item_id,"agi")*1.1))
	}
	else{
		param_afters[0].textContent = (Math.floor(getBuildedParameter(item_id,"str")))
		param_afters[1].textContent = (Math.floor(getBuildedParameter(item_id,"dex")))
		param_afters[2].textContent = (Math.floor(getBuildedParameter(item_id,"def")))
		param_afters[3].textContent = (Math.floor(getBuildedParameter(item_id,"agi")))
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
		top:"30px",
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
		top:"30px",
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
		top:"30px",
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
}

//現在装備エリアに表示されるべきアイテムIDのリストを作成する
function getCurrentPageItemList(){
	var item_ids = []
	var sort_order = data.equipment_menu.sort_order
	var current_page = data.equipment_menu.current_page

	//sort_order==0 -> ID順
	//sort_order==1 -> 総パラメータ順
	if(sort_order === 0){
		for(var i=0;i<10;++i){
			item_ids.push((current_page-1)*10 + i)
		}
		return item_ids
	}

	if(sort_order === 1){
		item_ids = getItemIDListOrderByTotalParameter(current_page)
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
	updateEquipBuildButtonShowState()
	updateSortOrderButtonState()
}


function updatePagerCurrentPage(){
	$("#current_page").text(data.equipment_menu.current_page)
}


function updateSortOrderButtonState(){
	var lavel = ""
	if(data.equipment_menu.sort_order === 0){
		lavel = "[ID順]"
	}
	else{
		lavel = "[つよさ順]"
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

	var icon_name = getItemIconNameFromTypeID(item.category)

	$("#equip_detail_name").text(item.name)
	$("#equipment_detail_icon").attr("src","images/neko/icons/"+icon_name +".png")
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
	.css("left","-40px")
	.css("opacity",.7)
	.animate({
		opacity:1,
		left:"-30px"
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
		var item_id = $(button).parent().attr("item_id")
		if(save.item[item_id] === undefined || save.item[item_id] === null || save.item[item_id] ==0){
			$(button).css("display","none")
		}
		else if(save.item[item_id] == MAX_EQUIP_BUILD){
			$(button).css("display","none")
		}
		else{
			$(button).css("display","inline-block")
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
		left : "-100px",
		opacity:0
	})
	$("#status_character_kuro").css({
		left : "710px",
		opacity:0
	})
	$("#status_siro").css({
		opacity:0
	})
	$("#status_kuro").css({
		opacity:0
	})
	$("#equip_siro").css({
		opacity:0
	})
	$("#equip_kuro").css({
		opacity:0
	})
	$(".status_equip_item").css({
		opacity:0
	})
	$("#status_achievement_list").css({
		opacity:0
	})
	//status_equip_item
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
		left:"-40px",
		opacity:1
	},2000,"easeOutQuart")

	$("#status_character_kuro").animate({
		left:"650px",
		opacity:1
	},2000,"easeOutQuart")

	$("#status_siro").delay(300)
	.animate({
		opacity:0.8
	},2000,"easeOutQuart")

	$("#status_kuro").delay(300)
	.animate({
		opacity:0.8
	},2000,"easeOutQuart")

	$("#equip_siro").delay(900)
	.animate({
		opacity:0.8
	},200,"swing")

	$("#equip_kuro").delay(900)
	.animate({
		opacity:0.8
	},200,"swing")

	$(".status_equip_item").animate({
		opacity:0.8
	},1000,"easeOutQuart")

	$("#status_achievement_list").delay(2000)
	.animate({
		opacity:0.8
	},1000,"swing")

}

//実績部分を更新
function updateAchievementArea(){
	$("#achievement_item_found").text(getSumItemFounded())
	$("#achievement_item_builded").text(getSumItemFoundedFullBuilded())
	$("#achievement_coin_earned").text(save.total_coin_achieved)
	$("#achievement_depth").text(getDeepestDepthCrawled())
}

/*******************************************/
/* ダンジョン選択画面 */
/*******************************************/

function changeStageToView(stage_id,depth){

	//ダンジョン選択画面を閉じる
	$("#dungeon_select_menu")
	.animate({
		opacity:0,
		top:"30px",
	},1,"linear")
	.queue(function () {
		$(this).addClass("hidden").dequeue();
	})


	//切り替え用アニメーションを再生
	$("#fadeouter")
	.css("display","block")
	.animate({
		opacity:1
	},300,"easeOutQuart")
	.queue(function(){
		$("#background_image").attr("src","images/neko/bg/st"+stage_id+".png")	
		$(".dungeon_name").text(dungeon_data[stage_id].name)
		$("#current_floor").text(save.current_floor)
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

//階層メニューの反映
function updateDungeonSelectFloorData(){
	var stage_id = data.dungeon_select_menu.stage_id
	var depth = data.dungeon_select_menu.depth
	$("#dungeon_detail_total_floor").text(dungeon_data[stage_id].depth)
	$("#dungeon_detail_completed_floor").text(save.dungeon_process[stage_id])
	$("#dungeon_decide_current_depth").text(data.dungeon_select_menu.depth)
}

