/***************************************/
/*プッシュ通知を送るやつ*/
/***************************************/

function getFocus(){
	//デフォルトの動作でフォーカスを撮ることにしたので廃止
	log("フォーカス取ったよ!")
}

function notify(title="タイトル未指定",body="内容未指定",icon="default",on_click=getFocus){

	//save.enabledがオフなら一切通知を行わない
	if(!save.notify.enabled){
		return
	}

	//久々にログインしたら全滅通知で埋まってうざい現象対策に
	//追加イベント再生中は通知を送らない
	if(data.hyper_event_dash_mode ){
		return
	}

	if(save.playtime < 200){
		//実際には時報が不幸にも発火する以外無いだろうけど一応止めておく
		log("開始200秒以内は通知を行いません...")
		return
	}

	castMessage("✉"+title)
	castMessage("✉"+body)

	var icon = "images/neko/notification/"+icon+".png"
	//お仕事モードの場合アイコンを落ち着いたやつにする
	if(save.notify.working_mode){
		icon = "images/neko/notification/work.png"
	}

	Push.create(title, 
	{
		body: body,
		icon: icon,
		timeout: 5000,
		onClick: function() {
			on_click()
			window.focus()
			save.notify.enabled = true
		}
	})
}

function promise(){
	Push.Permission.request(
		onGranted=function(){
			fadeTutorial()
			save.notify.enabled = true	
			castMessage("ブラウザの↗に出ているはずです。")
			notify(title="こんな感じに表示されます！",body="これからよろしくね！",icon="default")
		},
		onDenied=function(){
			fadeTutorial()
			save.notify.enabled = false
			castMessage("お手紙通知機能をオフにしました！")			
			castMessage("いつでもオンにできるので、")	
			castMessage("いつか試してみてくださいね！")			
		}
		);
}