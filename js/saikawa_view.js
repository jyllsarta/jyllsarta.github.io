function clickEffect(){
	$("#add_btn_cover")
	.stop()
	.css({
		opacity : 1,
		scale : 1.0,
	})
	.animate({
		opacity : 0,
		scale : 1.05,
	},100,"linear")
}