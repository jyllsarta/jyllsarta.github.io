var defaultUserName;
var defaultComment;
var isSending = false;

function isPlayedInLocalFile(){
	return document.location.href.startsWith("file:///")
}

function loadGame(){
	//if(isPlayedInLocalFile()){
	//	console.log("ローカル環境なのでゲームの読み込みをキャンセルしました");
	//	return
	//}
	var gameInstance = UnityLoader.instantiate("gameContainer", "game/nekofade/Build.json");
}

$(function(){
	loadGame()
	defaultUserName = $("#userName").val();
	defaultComment = $("#comment").val();
})


function sendComment(userName, comment){
	if(isSending){
		console.log("もちもちまってるよ");
		return;
	}
	$("#send").text("送信中...")
	isSending = true;
	post({userName:userName, comment:comment})
}

function post(requestParameters){
	$(function() {
		$.ajax({
			beforeSend: function(xhr){
				xhr.overrideMimeType('text/html;charset=utf-8')
			},
			type: "POST",
			url: "https://script.google.com/macros/s/AKfycbwYpOss4D3YygNX2VcnfXaHDxXbLMLE2KLXxeHLhzMJXvGKo8j7/exec",
			datatype:"jsonp",
			data:requestParameters,
			timeout: 10000
		})
		.done(function(response, textStatus, jqXHR) {
			console.log(response)
			showSentMessage()
			clearMessageArea();
			isSending = false;
		})
		.fail(function(jqXHR, textStatus, errorThrown ) {
			console.log("だめ")
			$("#userName").text("送信失敗しました... 更新してもう一度試してみてね")
			isSending = false;
		});
	});
}

$(function(){
	$("#userName").focus(function(){
		if($(this).val() == defaultUserName){
			$(this).val("")
		}
	})

	$("#comment").focus(function(){
		if($("#comment").val() == defaultComment){
			$(this).val("")
		}
	})

	$("#send").click(function(){
		sendComment($("#userName").val(), $("#comment").val())
	})

})

function clearMessageArea(){
	$("#comment").val("")	
}

function showSentMessage(){
	$("#send")
	.text("送信しました！")
	.delay(5000)
	.queue(function(){
		$(this).text("送信")
		$(this).dequeue()
	})
}