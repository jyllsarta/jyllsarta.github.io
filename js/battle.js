/*******************************************/
/* バトル関連 */
/*******************************************/

var enemy_data = {

}

//敵の攻撃力を算出
function calcEnemyAtk(rank){
	if(rank < 40){
		return Math.max(rank*6 - 50,1)
	}
	return Math.floor(Math.pow(rank-40,1.8)/2.7) + rank*5 + 80
}

//敵HPを算出
function calcEnemyHp(rank){
	if(rank < 40){
		return Math.max(rank*6 - 50,1)*5
	}
	return Math.floor(Math.pow(rank-40,1.8)/2.7)*2 +rank*10 + 130 
}

//敵の作成
function Enemy(rank,type="normal", enchant="none"){
	this.atk = calcEnemyAtk(rank)
	this.sld = 0
	this.hp = calcEnemyHp(rank)
	this.maxHp = calcEnemyHp(rank)
	this.isDead  = false
	this.maxDamagedPersentage = 0

	if(rank > 200){
		this.sld = rank * 2
	}

	//TODO type か enchantに指定が入った際のパラメータ補正
}

//味方の作成
function Ally(charaname){
	var str = getTotalParameter(charaname,"str")
	var dex = getTotalParameter(charaname,"dex")
	var def = getTotalParameter(charaname,"def")
	var agi = getTotalParameter(charaname,"agi")

	this.atk = calcAttack(charaname)
	this.sld = calcDefence(charaname)
	this.hp = save.status[charaname].hp
	this.maxHp = save.status[charaname].max_hp
	if(this.hp > 0){
		this.isDead  = false
	}
	else{
		this.isDead  = true
	}
	this.maxDamagedPersentage = 0

}

//現在階層とダンジョンから出る敵のランクを返す
function getCurrentEnemyRank(){
	var start_ir = dungeon_data[save.current_dungeon_id].start_ir
	var depth = save.current_floor

	return Math.floor(start_ir+( depth/4))
}

//敵のランクを加味した経験値を計算して返す
function getExp(rank){
	var average_lv = (save.status.siro.lv + save.status.kuro.lv)/2
	var gap = Math.max((rank - average_lv),0)
	var exp = gap * randInt(5,10) + randInt(1,10)
	return  exp
}


//fromがtoに攻撃した際のダメージを返す
function calcDamage(from, to){
	var damage = Math.max(from.atk - to.sld,Math.floor(to.maxHp/100))
	return damage
}

//fromがそれぞれtoの生きているキャラに攻撃する
function attackAllCharacterToRandomTarget(from,to){
	for(attacker of from){
		if(attacker.isDead){
			continue
		}
		var target = selectRandomAliveCharacterIndex(to)
		if(target === null){
			continue
		}
		var damage = calcDamage(attacker,to[target])
		to[target].hp -= damage
		var  damagePersentage = Math.floor(damage*100 / to[target].maxHp)
		log(damagePersentage)
		if(damagePersentage > to[target].maxDamagedPersentage){
			to[target].maxDamagedPersentage = damagePersentage
		}
		if(to[target].hp <= 0){
			to[target].isDead = true
		}
	}

}

//1ターン分の処理を行う
function take1turn(enemies,allies){
	//敵攻撃
	attackAllCharacterToRandomTarget(enemies,allies)

	//味方反撃
	attackAllCharacterToRandomTarget(allies,enemies)
}

//敵一覧・味方一覧から生きているキャラをランダムに一人選択して添字を返す
function selectRandomAliveCharacterIndex(charactersArray){
	var aliveCharacters = listupAliveCharacter(charactersArray)
	if(aliveCharacters.length == 0){
		//return undefined を書いてはいけない以上
		//こうしたけど、なんか直感的にバッドプラクティスなコードに見えてよくない
		return null 
	}

	var idx = randInt(0,aliveCharacters.length-1)
	var selected = aliveCharacters[idx]
	return selected
}

//敵一覧・味方一覧から生きているキャラのインデックスのリストを返す
function listupAliveCharacter(charactersArray){
	var idxes = []
	for(var i=0;i<charactersArray.length;++i){
		if(!charactersArray[i].isDead){
			idxes.push(i)
		}
	}
	return idxes
}

//敵一覧から与えたダメージ率の最も大きいものを返す
function getBiggestMaxDamage(enemies){
	var max = 0
	for(en of enemies){
		if(max < en.maxDamagedPersentage){
			max = en.maxDamagedPersentage
		}
	}
	return max
}

//バトル処理を行う
function processBattle(){
	var enemies  = []
	var allies = []

	var enemy_rank = getCurrentEnemyRank()

	//敵を追加
	enemies.push(new Enemy(enemy_rank))
	enemies.push(new Enemy(enemy_rank))
	enemies.push(new Enemy(enemy_rank))

	//味方を追加
	allies.push(new Ally("siro"))
	allies.push(new Ally("kuro"))

	var turnCount = 0

	castMessage("戦闘開始！")

	//敵と味方どちらかが全滅すると終了
	while(listupAliveCharacter(enemies).length > 0 && listupAliveCharacter(allies).length > 0 && turnCount	< 10){
		take1turn(enemies,allies)
		turnCount++
	}
	var damage_siro =  save.status.siro.hp - allies[0].hp
	var damage_kuro =  save.status.kuro.hp - allies[1].hp

	if(allies[0].hp > 0 || allies[1].hp > 0){
		//勝利していた場合のメッセージ
		var message = ""
		if(turnCount == 10){
			message += "タイムアップ!"
		}
		else{
			message += turnCount + "ターンで勝利！" 
		}
		castMessage(message)

		castMessage( "しろこ" + damage_siro +",くろこ" + damage_kuro + "のダメージ。")

		var biggestMaxDamage = getBiggestMaxDamage(enemies)
		if(biggestMaxDamage > 30){
			var reduceTime = Math.min( biggestMaxDamage*2,100)
			castMessage(Math.min(biggestMaxDamage,200) + "%オーバーキル！")
			castMessage(reduceTime+ "秒次イベントが早く回ってきます。")
			reduceNextEventTime(reduceTime)
		}

		//経験値を獲得
		var expEarned = getExp(enemy_rank)
		if(allies[0].hp > 0){
			save.status.siro.exp += expEarned
		}
		if(allies[1].hp > 0){
			save.status.kuro.exp += expEarned
		}
		castMessage(expEarned+"の経験値を獲得！")
		checkLevelUp()

		//コインを獲得
		var coinEarned = randInt(0,2)
		if(coinEarned > 0){
			save.coin += coinEarned
			save.total_coin_achieved += coinEarned
			castMessage(coinEarned+"枚のコインを拾った！")
		}
	}
	else{
		//全滅時のメッセージ
		castMessage( "しろこ" + damage_siro +",くろこ" + damage_kuro + "ダメージ。")
		castMessage( "全滅した... ") 
	}

	save.status.siro.hp = Math.max(allies[0].hp,0)
	save.status.kuro.hp = Math.max(allies[1].hp,0)
	updateCurrentHP()
	updateLoiteringCharactersState()
}

//経験値テーブルを見てレベルを更新する
function checkLevelUp(){
	while(save.status.siro.exp > 100  || save.status.kuro.exp > 100){
		if(save.status.siro.exp > 100){
			save.status.siro.lv ++
			save.status.siro.exp -= 100
			castMessage("しろこは"+save.status.siro.lv+"レベルになった！")
		}
		if(save.status.kuro.exp > 100){
			save.status.kuro.lv ++
			save.status.kuro.exp -= 100
			castMessage("くろこは"+save.status.kuro.lv+"レベルになった！")
		}
	}
	updateMaxHP()
	updateCurrentHP()
}

//レベルに応じた最大HPを計算し直す
function updateMaxHP(){
	save.status.siro.max_hp = save.status.siro.lv * 10 + 100
	save.status.kuro.max_hp = save.status.kuro.lv * 10 + 100
}