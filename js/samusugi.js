sentense = [] 

//ループ中かどうか
is_working = false

function randInt(min, max) {
	return Math.floor( Math.random() * (max - min + 1) ) + min;
}

function fetch(){
	$(function() {
		$.ajax({
			beforeSend: function(xhr){
				xhr.overrideMimeType('text/html;charset=utf-8');
			},
			type: "GET",
			url: "etc/samusugi.txt",
			timeout: 10000
		})
		.done(function(response, textStatus, jqXHR) {
			load(response)
		})
		.fail(function(jqXHR, textStatus, errorThrown ) {
			console.log("だめ")
		});
	});
}

function load(response){
	var lines = response.split("\n")
	for(var line of lines){
		sentense.push(line)
	}
}

function next(){
	//データ読み込み前は動かさない
	if(!sentense){
		return 
	}
	var samusugi = sentense[randInt(0,sentense.length)]
	$("#samusugi").text(samusugi)
}

function start(){
	//わざとグローバル
	loop = setInterval(next,60)
	is_working = true
}

function stop(){
	is_working = false
	clearInterval(loop)
}

function toggle(){
	if(is_working){
		stop()
		$("#control").text("はじめる")
	}
	else{
		start()
		$("#control").text("止める")
	}
}	

function tweet(){
	var baseurl = "http://twitter.com/home?status="
	var text = $("#samusugi").text()
	var suffix = " - 寒すぎて%sになった - https://jyllsarta.github.io/samusugi.html"
	window.open(encodeURI(baseurl+text+" "+suffix))
}

//最初に実行する
fetch()
start()

$("#control").click(toggle)
$("#tweet").click(tweet)