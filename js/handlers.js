
/*******************************************/
/* イベントハンドラ */
/* ロジックはここに書かない */
/* ボタンの挙動は個別の関数に分離する*/
/*******************************************/

//タイトルのクリックでステージ画面に遷移
$("#title").click(function(){
	changeGameMode("stage")
})

//ステージ画面のクリックでメイン画面に遷移
$("#stage").click(function(){
	changeGameMode("main")
})

//スプライト画像はクリックされたら消す
$("#sprite_image").click(function(){
	$("#sprite_image").addClass("hidden")
})

//ダンジョンリスト画面に戻るメニューを表示
$("#dungeon_list_show_button").click(function(){
	showDungeonSelectMenu()
})

//ステータス画面を開く
$("#status_show_button").click(function(){
	showStatusMenu()
})

//メニューボタンクリックでメニューを開く
$("#menu_equip_button").click(function(){
	showEquipmentMenu()
})

//装備メニュー戻るボタンクリックでメニュー閉じる
$("#dungeon_select_back_button").click(function(){
	fadeDungeonSelectMenu()
})

//ステータスメニュー戻るボタンクリックでメニュー閉じる
$("#status_back_button").click(function(){
	fadeStatusMenu()
})

//装備メニュー戻るボタンクリックでメニュー閉じる
$("#equipment_back_button").click(function(){
	fadeEquipmentMenu()
})

//装備リストページャの操作:次のページ
$("#pager_button_prev").click(function(){
	equipListPrevPage()
})

//装備リストページャの操作:前のページ
$("#pager_button_next").click(function(){
	equipListNextPage()
})

//ソート順クリックでソートルール変更
$("#sort_toggle_button").click(function(){
	toggleSortOrder()
})

//各装備マウスオーバーで詳細画面に対応したものを表示
$(".equip_item").mouseover(function(){
	equipDetailMouseOver(this)
})

//各装備クリックで該当の装備を装備
$(".equip_list_text").click(function(){
	equip(this)
})

//各装備の強化ボタンクリックで該当の装備強化ウィンドウを表示
$(".equip_build_button").click(function(){
	showEquipBuildMenu(this)
})

//装備強化メニューを閉じる
$("#equip_build_popup_quit_button").click(function(){
	hideEquipBuildMenu(this)
})

//装備強化メニューを閉じる
$("#build_decide_button").click(function(){
	buildButtonHandle()
})

//装備ウィンドウ右クリで装備を外す
$("#equipment_menu").bind("contextmenu",function(){
	unEquip()
	return false
})

//装備詳細にマウスオーバーでも詳細を表示
$(".current_equip_item").mouseover(function(){
	equipDetailMouseOver(this)
})

//装備詳細クリックは装備を外す
$(".current_equip_item").click(function(){
	unEquipClick(this)
})

//装備キャラ切り替えボタンでトグル
$("#equip_character_toggle_button").click(function(){
	toggleEquipEditCharacter()
})

//潜るボタンで潜る
$("#dungeon_decide_button").click(function(){
	changeStageButton()
})

//深さ+1ボタン
$("#depth_plus_1").click(function(){
	changeDepth(1)
})

//深さ+10ボタン
$("#depth_plus_10").click(function(){
	changeDepth(10)
})

//深さ+100ボタン
$("#depth_plus_100").click(function(){
	changeDepth(100)
})

//深さ-1ボタン
$("#depth_minus_1").click(function(){
	changeDepth(-1)
})

//深さ-10ボタン
$("#depth_minus_10").click(function(){
	changeDepth(-10)
})

//深さ-100ボタン
$("#depth_minus_100").click(function(){
	changeDepth(-100)
})

//深さ-100ボタン
$("#ressurect_button").click(function(){
	ressurect()
})

 //スクショ撮るボタン
 $("#screenshot").click(function(){
 	takeScreenshot()
 })


 //スクショ撮るボタン
 $("#save_button").click(function(){
 	makesave()
 })

//実績の詳細を出す
$(".achievement_icon_image").mouseover(function(){
	showAchievementIconDetail(this)
})

//実績アイコンからmouseoutすると表示を消す
$(".achievement_icon_image").mouseout(function(){
	hideAchievementDetail()
})

 //オプション閉じるボタン
 $("#option_back_button").click(function(){
 	fadeOptionMenu()
 })

 //オプション開くボタン
 $("#option_button").click(function(){
 	showOptionMenu()
 })

$("#option_animation_on").click(function(){
 	toggleEnableEventAnimationOption()
 })

$("#option_loitering_on").click(function(){
 	toggleEnableLoiteringOption()
 })

$("#option_scroll_background").click(function(){
 	toggleEnableScrollBackgroundOption()
 })

 //ガチャメニューを開く
 $("#gacha_menu_show_button").click(function(){
 	showGachaMenu()
 })

 //ガチャメニュー閉じる
 $("#gacha_back_button").click(function(){
 	fadeGachaMenu()
 })

$("#gacha_take_button").click(function(){
	spinGacha(1)
})

$("#gacha_take_10_button").click(function(){
	spinGacha(10)
})

$("#gacha_result_back_button").click(function(){
	fadeGachaResult()
})

$("#changestage_click_cover").click(function(){
	fadeChangeStageView()
})

$("#tutorial_click_cover").click(function(){
	fadeTutorial()
})

$("#option_notification").click(function(){
	toggleNotification()
})

$("#notification_death").click(function(){
	toggleNotificationDeath()
})
$("#notification_clear").click(function(){
	toggleNotificationClear()
})
$("#notification_freespin").click(function(){
	toggleNotificationFreeSpin()
})
$("#notification_jihou").click(function(){
	toggleNotificationJihou()
})

$("#epilogue_button").click(function(){
	showEpilogue()
})

$(".epilogue_illust").click(function(){
	proceedEpilogue()
})

$("#epilogue_text").click(function(){
	proceedEpilogue()
})

$("#omake_button").click(function(){
	showThankyouImage()
})
$("#omake_image").click(function(){
	fadeThankyouImage()
})


/*ミニゲーム関連*/
$("#jump").click(function(){
	proceedMiniGame()
})