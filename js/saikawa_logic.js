var state = {
	users : [],
	local_score : 0,
	add_stones : 0,
	username : "",
	leaving_frame : 0,
	finished_load : false,
}


//ランダム
function randInt(min, max) {
	return Math.floor( Math.random() * (max - min + 1) ) + min;
}


//APIから取得した行データでローカルのデータを更新
function updateUserState(retrievedRows){
	//一旦リセット
	state.users = []
	//返ってきたデータを格納
	for(var row of retrievedRows){
		var userObject = {
			username : row[0],
			score : row[1],
			crashed : row[2],
			timestamp : row[3],
		}
		state.users.push(userObject)
	}

	//崩された判定 いっきに100以上減ってれば崩されたとみなす
	//0のときも初回取得なので反映
	if(state.local_score == 0){
		state.local_score = getStoneAmount(state.username)
	}
	if(state.local_score - getStoneAmount(state.username) > 100){
		state.local_score = getStoneAmount(state.username)
	}

	//まだ場になにもいないなら初回更新 配置
	if(!state.finished_load){
		state.finished_load = true
		putFriends()
	}
}

//ローカルにあるユーザ一覧をkeyでソート
function sortUsers(key){
	//object_array_sort.js に宣言有り
	//state.usersの並びを破壊するので今後やばいかも
	object_array_sort(state.users,"score")
}

function getRankUserTemplate(){
	var template = ""+
	'<div class="rankuser">'+
	'<div class="username">{{username}}</div>'+
	'<div class="score">{{score}}</div>'+
	'<div class="crashed">{{crashed}}</div>'+
	'</div>'
	return template
}

//{{hoge}}形式の文字列を置換していく
// '<div id="{{piyo}}">{{hoge}}</div>' に
//[["hoge","taro"],["piyo", "id_hoge"]]を与えるみたいに使う
function replaceTemplates(srcText, replacePairs){
	var replacing = srcText
	for(var pair of replacePairs){
		var [src,dst] = pair
		replacing = replacing.replace("{{"+src+"}}",dst)
	}
	return replacing
}

function updateRankArea(){
	$("#rankusers").text("")
	sortUsers()
	for(var user of state.users.slice(0,15)){
		var template = getRankUserTemplate()
		var replacePairs = [
			["username", user.username],
			["score", user.score],
			["crashed", user.crashed],
		]
		var replaced = replaceTemplates(template,replacePairs)
		$("#rankusers").append(replaced)
	}
}

//石を一つ積む
function addStone(){
	state.add_stones ++
	state.local_score ++
	state.leaving_frame = 0
}

//ローカルに積んでる途中の石をリモートに送信する
function sendRemainingStones(){
	if(state.add_stones > 0 && state.username){
		sendAddScore(state.username, state.add_stones)
		state.add_stones = 0
	}
}

//textareaに入力されたユーザ名をステートに反映
function checkUsername(){
	var username = $("#namearea").val().slice(0,4)
	if(!username){
		//console.log("ユーザ名が空")
		$("#namedisp").addClass("emphasise_name")
		$("#namedisp").text("ユーザ名を決めてね(最大4文字、他人に表示されます)")
		return
	}
	state.username = username
	$("#namearea").val(username)
	$("#namedisp").removeClass("emphasise_name")
	$("#namedisp").text("ユーザ名")
	$("#player .name").text(username)
}

//放置フレーム数が10(=20秒)以下の場合最新のデータを取りに行く
function fetchUserDataIfActive(){
	if(state.leaving_frame > 10){
		//console.log("放置中ですね...")
		return
	}
	fetchUserData()
}

function updateMyStone(){
	$("#mystones").animate({
		height : state.local_score,
		translateY : -state.local_score,
	},1,"linear")

}

function getStoneAmount(username){
	for(var u of state.users){
		if(u.username == username){
			return u.score
		}
	}
	return -1
}

//他のプレイヤーを更新
function updateFriends(){
	var domUsers = $("#friends").children()
	for(var i=0;i<domUsers.length;++i){
		var username = $($($(domUsers)[i]).children()[0]).text()
		var stones = getStoneAmount(username)
		$($($(domUsers)[i]).children()[2]).animate({
			height : stones,
			translateY : -stones,
		},1,"linear")

	}
}

function getFriendTemplate(){
	return ""+
	'<div class="user">'+
	'<div class="name">{{name}}</div>'+
	'<img src="images/saikawa/2p.png" class="player_icon">'+
	'<div class="stones"></div>'+
	'</div>'

}

//場にお友達を配置
function putFriends(){
	for(var user of state.users){
		if(user.username == state.username){
			continue
		}
		var template = getFriendTemplate()
		template = template.replace("{{name}}", user.username)
		$("#friends").append(template)
		$(".user:last .stones").animate({
			height : user.score,
			translateY : -user.score,
		},1,"linear")
		$(".user:last").css({
			top : randInt(100,500),
			left : randInt(10,600),
		})
	}
}

function putPlayer(){
		$("#player").css({
			top : randInt(410,450),
			left : randInt(30,200),
		})	
}

//2秒ごとのアップデート
function retrieveAndRefreshState(){
	checkUsername()
	sendRemainingStones()
	fetchUserDataIfActive()
	updateRankArea()
	updateMyStone()
	updateFriends()

	state.leaving_frame ++
}
setInterval(retrieveAndRefreshState,2000)

$(document).ready(function(){
	fetchUserDataIfActive()
	putPlayer()
})
$("#add").click(function(){
	addStone()
	clickEffect()
	updateMyStone()
})

