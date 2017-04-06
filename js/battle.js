/*******************************************/
/* バトル関連 */
/*******************************************/

var enemy_data = {

}

//敵の攻撃力を算出
function calcEnemyAtk(rank){
	if(rank < 40){
		return Math.max(rank*4 ,10)
	}
	return Math.floor(Math.pow(rank-10,1.8)/2.7) + rank - 10
}

//敵HPを算出
function calcEnemyHp(rank){
	if(rank < 40){
		return Math.max(rank*4,30)*2
	}
	return Math.floor(Math.pow(rank-10,1.8)/2.7*2)+rank*2 +200 
}

//敵の作成
function Enemy(rank,type="normal", enchant="none"){
	this.atk = calcEnemyAtk(rank) + randInt(1,10)
	this.sld = 0
	var enHp =  Math.floor(calcEnemyHp(rank)*randInt(80,100)/100 + randInt(1,20))
	this.hp = enHp
	this.maxHp = enHp
	this.isDead  = false
	this.maxDamagedPersentage = 0
	this.isBoss = false

	if(rank > 100){
		this.sld = Math.floor(this.atk/4)
	}

	if(type==="boss"){
		this.hp *= 3
		this.maxHp *= 3
		this.sld = Math.floor(this.atk/2)
		this.atk = Math.floor(this.atk *1.2)
		this.isBoss = true
	}

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
	this.isBoss = false

}

//現在階層とダンジョンから出る敵のランクを返す
function getCurrentEnemyRank(){
	var start_ir = dungeon_data[save.current_dungeon_id].start_ir
	var depth = Math.min(save.current_floor,dungeon_data[save.current_dungeon_id].depth)

	return Math.floor(start_ir+( depth/8))
}

//敵のランクを加味した経験値を計算して返す
function getExp(rank){
	var average_lv = (save.status.siro.lv + save.status.kuro.lv)/2
	var gap = Math.max((rank - average_lv),0)
	var exp = gap * 5 + randInt(1,2)
	return  Math.floor(exp)
}


//fromがtoに攻撃した際のダメージを返す
function calcDamage(from, to){
	//攻撃-守備が原則ダメージ

	// 防御値のほうが上回っている場合
	// 最低限1ダメージは絶対保証とし
	// 通常敵なら0.5, ボスなら5%のダメージ を最低ダメージの基本値とする
	// 最低ダメージ値の場合には攻撃力と守備力の比の逆数値を更に乗算してできあがり

	// HP800, sld200 にatt50で攻撃する場合
	// 基本の800の0.5%である4ダメージに attsld比0.25を乗算し
	// 1ダメージとなる

	// HP800, sld50 にatt150で攻撃する場合
	// DEF割れ状態なので100ダメージとなる

	//0.5%が基本のダメージ値
	var min_damage = Math.floor(to.maxHp/200)

	var att_def_ratio =  from.atk / to.sld

	if(att_def_ratio < 1){
		min_damage *= att_def_ratio
	}

	//ボスなら10倍 -> 比でいうと5%を保証ダメージとする
	if(from.isBoss){
		min_damage *= 10
	}

	//1ダメ、最低基準ダメージ、攻-守の最も大きいものをダメージとする
	var damage = Math.floor(Math.max(from.atk - to.sld, min_damage,1))

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

	//味方攻撃
	attackAllCharacterToRandomTarget(allies,enemies)

	//敵反撃
	attackAllCharacterToRandomTarget(enemies,allies)

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
function processBattle(bossBattle=false){
	var enemies  = []
	var allies = []

	var enemy_rank = getCurrentEnemyRank()

	//敵を追加
	if(!bossBattle){
		enemies.push(new Enemy(enemy_rank))
		enemies.push(new Enemy(enemy_rank))
		enemies.push(new Enemy(enemy_rank))
	}
	else{
		enemies.push(new Enemy(enemy_rank,type="boss"))		
	}

	//味方を追加
	allies.push(new Ally("siro"))
	allies.push(new Ally("kuro"))

	var turnCount = 0

	//バトルターン数
	var battleTurn = 10 

	if(bossBattle){
		battleTurn = 201
	}

	//敵と味方どちらかが全滅すると終了
	while(listupAliveCharacter(enemies).length > 0 && listupAliveCharacter(allies).length > 0 && turnCount< battleTurn){
		take1turn(enemies,allies)
		turnCount++
	}
	var damage_siro =  save.status.siro.hp - allies[0].hp
	var damage_kuro =  save.status.kuro.hp - allies[1].hp

	if(allies[0].hp > 0 || allies[1].hp > 0){
		//勝利していた場合のメッセージ
		var message = ""
		if(turnCount == battleTurn){
			castMessage("タイムアップ!なんとか攻撃を耐えきった!")
		}
		else{
			message += turnCount + "T戦い, " 
		}

		//2ターンキルしていたら実績のためにカウント
		if(turnCount == 2){
			save.total_2kill ++
		}

		message += ( "しろこ" + damage_siro +",くろこ" + damage_kuro + "ダメージ。")
		castMessage(message)

		var biggestMaxDamage = getBiggestMaxDamage(enemies)
		if(biggestMaxDamage > 30){
			var reduceTime = Math.floor(Math.min( biggestMaxDamage/4,25))
			castMessage("最大"+Math.min(biggestMaxDamage,100) + "%ダメージ！"+reduceTime+ "秒加速します！")
			reduceNextEventTime(reduceTime)
		}

		//コインを獲得(ボス戦では初回討伐ボーナスのみ)
		if(!bossBattle){
			var coinEarned = randInt(0,2)
			save.coin += coinEarned
			save.total_coin_achieved += coinEarned
		}

		//経験値を獲得
		var expEarned = getExp(enemy_rank)
		if(allies[0].hp > 0){
			save.status.siro.exp += expEarned
		}
		if(allies[1].hp > 0){
			save.status.kuro.exp += expEarned
		}
		var coinMessage = coinEarned?("、コイン"+ coinEarned	+ "枚"):""
		castMessage("経験値"+expEarned+coinMessage+"を獲得！")
		checkLevelUp()

	}
	else{
		var damageDealedPersentage =100-Math.floor(enemies[0].hp / enemies[0].maxHp * 100)
		//全滅時のメッセージ
		castMessage( "しろこ" + damage_siro +",くろこ" + damage_kuro + "ダメージ。")
		castMessage( turnCount+"ターン耐え,"+damageDealedPersentage+"%削ったが全滅した... ") 
		save.total_death++
	}

	save.status.siro.hp = Math.max(allies[0].hp,0)
	save.status.kuro.hp = Math.max(allies[1].hp,0)
	updateCurrentHP()
	updateLoiteringCharactersState()
	updateCurrentLVEXP()
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

