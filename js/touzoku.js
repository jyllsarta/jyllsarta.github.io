
//ランダム用
function getRandomInt(min, max) {
  return Math.floor( Math.random() * (max - min + 1) ) + min;
}

//
// ボタンに対する反応
//

//メニューを開く
$("#menu_button").click(function(){
	console.log("menu open");	
	$("#menu").removeClass("collapse");
});

//メニューを閉じる
$("#menu_collapse_button").click(function(){
	console.log("menu close");	
	$("#menu").addClass("collapse");
});

//レバークリックでまんじゅうを生産
$("#lever").click(function(){
	console.log("siso create");
	$("#siso_list").append('<li class="siso"><img class="siso_image" src="images/touzoku/siso.png"></li>');
	//今追加したアイテムの初期位置をいじる
	$(".siso:last").css("top", getRandomInt(-20,30)+"px");
});


//まんじゅうの移動関連
(function(){


	//スコアの加算
	var add_score = function(value){
		var now = parseFloat($("#score").text());
		$("#score").text(now + value);
	}


	var move_siso = function(){
		$(".siso").each(function(){
			var now = parseFloat($(this).css("left").slice(0,-2));
			$(this).css("left",now-2+"px");

			if(now < 10){
				//ギリギリになると消え始める
				var now_opacity = parseFloat($(this).css("opacity"));
				console.log(now_opacity)
				$(this).css("opacity",now_opacity-0.1);

				//消えきったまんじゅうはDOMから削除する
				if(now_opacity <= 0){
					add_score(1);
					$(this).remove();
				}
			}

 		 });
	}

	//10ミリ秒ごとに少しずつ動かす
	window.setInterval(move_siso,10);

}());

