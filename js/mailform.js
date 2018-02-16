sending = false

function post(requestParameters){
	$(function() {
		$.ajax({
			beforeSend: function(xhr){
				xhr.overrideMimeType('text/html;charset=utf-8')
			},
			type: "POST",
			url: "https://script.google.com/macros/s/AKfycbzbEZJMtB8uodJyYvn4QRdRFA3LQ4s8O9YtzPO_Yx-sMBf6WJT1/exec",
			datatype:"jsonp",
			data:requestParameters,
			timeout: 10000
		})
		.done(function(response, textStatus, jqXHR) {
			clearInterval(inv)
			$("#mailform").animate({"opacity":0.4},500,"linear")
			$("#sending").text("送信しました！")
			console.log(response)
		})
		.fail(function(jqXHR, textStatus, errorThrown ) {
			$("#sending").text("なんかしらダメっぽいです(twitter:@jyll に連絡してください...)")
			console.log("だめ")
		});
	});
}

function addPeriod(){
	$("#sending").append(".")
}

function showSending(){
	$("#sending").animate({"opacity":1, "margin-left":30}, 200, "linear")
	inv = setInterval(addPeriod,500)
}

function showError(errorMessage){
	$("#error")
	.css({"opacity":0, "margin-left":40})
	.text(errorMessage)
	.animate({"opacity":1, "margin-left":30}, 200, "linear")
}
function hideError(){
	$("#error")
	.css({"opacity":0, "margin-left":40})	
}

//バリデーションをかけてエラーメッセージを得る
function getErrorMessage(name, email, content){
	if(!name && !email && !content){
		return "全部空じゃないですかー！"
	}
	var msg = ""

	//nullチェック
	if(!name){
		msg += "お名前を埋めてください。　"
	}
	if(!email){
		msg += "メールアドレスを埋めてください。　"
	}
	if(!content){
		msg += "中身を書いてくださいー"
	}
	if(msg !== ""){
		return msg
	}

	//メアドチェック
	//正規表現あるのは知ってるけどそんな仰々しいもの作りたいわけでなし
	if(email.indexOf("@") == -1){
		return "メールアドレス、正しいものでしょうか...?"
	}

	//エラーチェック通過
	return ""
}

function sendmail(){
	if(sending){
		console.log("今送ってるとこ")
		return
	}
	var name = $("#name").val()
	var email = $("#email").val()
	var content = $("#content").val()

	//軽くバリデーション
	var msg = getErrorMessage(name,email,content)
	//エラーがあるならここで止める
	if(msg !== ""){
		showError(msg)
		return
	}

	sending = true
	var parameters = {
		name : name,
		email : email,
		content : content,
		isTest : false,
	}
	hideError()
	showSending()
	post(parameters)
}

$("#submit").click(sendmail)