function post(requestParameters){
	$(function() {
		$.ajax({
			beforeSend: function(xhr){
				xhr.overrideMimeType('text/html;charset=utf-8')
			},
			type: "POST",
			url: "https://script.google.com/macros/s/AKfycbxICo0gyKM-sFmiyivBJOGsvXJdDe-8vaZKP4A6oUc7PkBDXgM/exec",
			datatype:"jsonp",
			data:requestParameters,
			timeout: 10000
		})
		.done(function(response, textStatus, jqXHR) {
			console.log(response)
		})
		.fail(function(jqXHR, textStatus, errorThrown ) {
			console.log("だめ")
		});
	});
}

function get(requestParameters){
}


function sendAddScore(username,score){
	var posts={
		"method" : "add_score",
		"user" : username,
		"score" : score,	
	}
	post(posts)
}

function sendCrash(attackerUsername, targetUsername){
	var posts={
		"method" : "crash",
		"user" : attackerUsername,
		"target" : targetUsername,	
	}
	post(posts)
}

function fetchUserData(){
	var params={
		"method" : "fetch_data",
	}
	$.ajax({
		beforeSend: function(xhr){
			xhr.overrideMimeType('text/html;charset=utf-8')
		},
		type: "GET",
		url: "https://script.google.com/macros/s/AKfycbxICo0gyKM-sFmiyivBJOGsvXJdDe-8vaZKP4A6oUc7PkBDXgM/exec",
		datatype:"jsonp",
		data:params,
		timeout: 10000
	})
	.done(function(response, textStatus, jqXHR) {
		updateUserState(JSON.parse(response))
	})
	.fail(function(jqXHR, textStatus, errorThrown ) {
		console.log("だめ")
	});
}