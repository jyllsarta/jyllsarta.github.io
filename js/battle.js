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
function Enemy(rank,type="normal",unique_boss_id=null){

	this.atk = calcEnemyAtk(rank) + randInt(1,10)
	this.sld = 0
	var enHp =  Math.floor(calcEnemyHp(rank)*randInt(80,100)/100 + randInt(1,20))
	this.hp = enHp
	this.maxHp = enHp
	this.isDead  = false
	this.maxDamagedPersentage = 0
	this.isBoss = false
	this.isUniqueBoss = false

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

	//ボスIDの指定があったら
	if(unique_boss_id !== null){
		this.hp = extra_boss_data[unique_boss_id].hp
		this.maxHp = extra_boss_data[unique_boss_id].hp
		this.atk = extra_boss_data[unique_boss_id].atk
		this.sld = extra_boss_data[unique_boss_id].sld
		this.isBoss = true
		this.isUniqueBoss = true
		this.skill =  extra_boss_data[unique_boss_id].skill
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

	//エクストラダンジョン<以外>は8階層ごとにランクアップ
	if(save.current_dungeon_id <= 4){
		depth /= 8
	}
	//エクストラダンジョンは毎階層ごとにランクアップ
	else if(save.current_dungeon_id == 5){
		// nothing
	}

	return Math.floor(start_ir+depth)
}

//これまで潜った中で一番強いランクの敵のランクを返す
function getMaxEnemyRank(){
	var deepest_dungeon_id = 0
	for(var i=0;i<save.dungeon_open.length;++i){
		if(save.dungeon_open[i] > 0){
			deepest_dungeon_id = i
		}
	} 
	var start_ir = dungeon_data[deepest_dungeon_id].start_ir
	var depth = Math.min(save.dungeon_process[deepest_dungeon_id],dungeon_data[deepest_dungeon_id].depth)

	//エクストラダンジョン<以外>は8階層ごとにランクアップ
	if(save.deepest_dungeon_id <= 4){
		depth /= 8
	}
	//エクストラダンジョンは毎階層ごとにランクアップ
	else if(save.deepest_dungeon_id == 5){
		// nothing
	}

	return Math.floor(start_ir+depth)
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
	// 通常敵なら0.25%, ボスなら5%のダメージ を最低ダメージの基本値とする
	// 最低ダメージ値の場合には攻撃力と守備力の比の逆数値を更に乗算してできあがり

	// HP800, sld200 にatt50で攻撃する場合
	// 基本の800の0.5%である4ダメージに attsld比0.25を乗算し
	// 1ダメージとなる

	// HP800, sld50 にatt150で攻撃する場合
	// DEF割れ状態なので100ダメージとなる

	//0.25%が基本のダメージ値
	var min_damage = Math.floor(to.maxHp/400)

	var att_def_ratio =  from.atk / to.sld

	if(att_def_ratio < 1){
		min_damage *= att_def_ratio
	}

	//ボスなら10倍 -> 比でいうと5%を保証ダメージとする
	if(from.isBoss){
		min_damage *= 20
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

	if(enemies[0].isUniqueBoss){
		eval(enemies[0].skill)
	}

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
//通常ボスならbossBattle、エクストラのユニークボスならunique_boss_idを指定
function processBattle(bossBattle=false,unique_boss_id=null){
	var enemies  = []
	var allies = []

	var enemy_rank = getCurrentEnemyRank()

	//敵を追加
	//ユニークボスの指定があるならそれを追加
	if(unique_boss_id !== null){
		enemies.push(new Enemy(enemy_rank,bossBattle=true,unique_boss_id=unique_boss_id))	
	}
	//それ以外の通常バトル
	else if(!bossBattle){
		enemies.push(new Enemy(enemy_rank))
		enemies.push(new Enemy(enemy_rank))
		enemies.push(new Enemy(enemy_rank))
	}
	//通常ボス
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

	//ユニークボスなら前口上を話し、スキル発動
	if(unique_boss_id !==null){
		for(var ms of extra_boss_data[unique_boss_id].pre_battle_message){
			castMessage(ms)
		}
		eval(extra_boss_data[unique_boss_id].pre_battle_skill)
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
			//レベル差があるときには経験値5を追加でプレゼント
			if(save.status.siro.lv < save.status.kuro.lv){
				save.status.siro.exp += 5
			}
		}
		if(allies[1].hp > 0){
			save.status.kuro.exp += expEarned
			//レベル差があるときには経験値5を追加でプレゼント
			if(save.status.kuro.lv < save.status.siro.lv){
				save.status.kuro.exp += 5
			}
		}
		var coinMessage = coinEarned?("、コイン"+ coinEarned	+ "枚"):""
		castMessage("経験値"+expEarned+coinMessage+"を獲得！")
		checkLevelUp()

		//勝利アニメーションを再生
		if(bossBattle){
			showBossBattleSprite(is_win=true)
		}
		else{
			showBattleSprite(is_win=true)			
		}

	}
	else{
		var damageDealedPersentage = 0
		for(var enemy of enemies){
			damageDealedPersentage += Math.min(100-Math.floor(enemy.hp / enemy.maxHp * 100),100)
		}
		damageDealedPersentage = Math.floor(damageDealedPersentage/ 3)
		//全滅時のメッセージ
		castMessage( "しろこ" + damage_siro +",くろこ" + damage_kuro + "ダメージ。")
		castMessage( turnCount+"ターン耐え,"+damageDealedPersentage+"%削ったが全滅した... ") 
		save.total_death++
		if(save.notify.onDeath){
			notify(title="全滅した...",body=("(この通知をクリックで全回復します...)"),icon="death",onClick=function(){ressurect()})
		}
		//敗北アニメーションを再生
		if(bossBattle){
			showBossBattleSprite(is_win=false)
		}
		else{
			showBattleSprite(is_win=false)			
		}

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


var extra_boss_data = {
	0 : {
		name : "エクリテ",
		pre_battle_message : ["「私は秩序の妖精エクリテ。",
														"妖精郷に踏み入る資格と実力があるか、",
														"その腕で証明してみせなさい！」",
														"エクリテ：HP214m,ATK280k,DEF40k"
														],
		hp : 2140000,
		atk : 278000,
		sld : 40000,
		pre_battle_skill : '\
		castMessage("「これが法の光よ！");\
		castMessage("耐えてみせなさい！」");\
		allies[0].hp /= 2;\
		allies[1].hp /= 2;\
		castMessage("しろこに"+Math.floor(allies[0].hp)+"、くろこに"+Math.floor(allies[1].hp)+"のダメージ。");\
		',
		skill : '\
			if(getParameterDiffRatio("siro") > 1.2 && allies[0].hp > 0){\
				var ratio = getParameterDiffRatio("siro");\
				castMessage("「...パラメータがばらつきすぎです！");\
				castMessage("　お仕置きでーす！」");\
				allies[0].hp-=10000;\
				castMessage("しろこに10000ダメージ！");\
			}\
			if(getParameterDiffRatio("kuro") > 1.2 && allies[1].hp > 0){\
				var ratio = getParameterDiffRatio("siro");\
				castMessage("「...パラメータがばらつきすぎです！");\
				castMessage("　お仕置きでーす！」");\
				allies[1].hp -= 10000;\
				castMessage("くろこに10000ダメージ！");\
			}\
		',
	},


}
