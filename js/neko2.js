function playedInLocalFile(){
	return document.location.href.startsWith("file:///")
}

function loadGame(){
	if(playedInLocalFile()){
		return
	}
	var gameInstance = UnityLoader.instantiate("gameContainer", "game/nekofade/Build.json");
}

loadGame()
