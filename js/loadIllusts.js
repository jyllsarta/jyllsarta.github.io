function loadIllusts(){
	var count = 125
	for(var i=count; i>0; --i){
		$("#illustBox").append(`<a href="images/illust_all/${i}.png"><div class="thumb"></div>`)
		$(".thumb:last").css("background-image",`url("images/illust_thumbnails/${i}.png")`)
	}
}

$(
	loadIllusts()
);