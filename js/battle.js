/*******************************************/
/* バトル関連 */
/*******************************************/


//敵の作成
function Enemy(rank,type="normal", enchant="none"){
	if(rank < 50){
		//ランク50以下の場合は特別処理
		this.atk = rank*2
		this.sld = 0
		this.hp = rank * 3
		return this
	}
	this.atk = Math.floor(Math.pow(rank-50,1.8) * 1.45) 
	this.sld = 0
	this.hp = Math.floor(Math.pow(rank-50,1.8) * 3)

	//TODO type か enchantに指定が入った際のパラメータ補正
}

//味方の作成
function Ally(charaname){
	var str = getTotalParameter(charaname,"str")
	var dex = getTotalParameter(charaname,"dex")
	var def = getTotalParameter(charaname,"def")
	var agi = getTotalParameter(charaname,"agi")

	this.atk = (str + dex)/2 + Math.min(str,dex)
	this.sld = (def + agi)/2 + Math.min(def,agi)
	this.hp = save.status[charaname].hp

}

//現在階層とダンジョンから出る敵のランクを返す
function getCurrentEnemyRank(){
	var start_ir = dungeon_data[save.current_dungeon_id].start_ir
	var depth = save.current_floor

	return Math.floor(start_ir+( depth/2))
}

//fromがtoに攻撃した際のダメージを返す
function calcDamage(from, to){
	var damage = Math.max(from.atk - to.sld,1)
	return damage
}

//バトル処理を行う
function processBattle(){
	var battle_log = []
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

	//敵と味方どちらかが全滅すると終了
	while(enemies.length>0 && allies.length>0){
		log("**ターン開始**")
		console.log(enemies)
		console.log(allies)
		for(var en of enemies){
				if(allies.length == 0){
					continue		
				}
				var target = randInt(0,allies.length-1)
				allies[target].hp -= calcDamage(en,allies[target])
				if(allies[target].hp <= 0){
					log("**味方死亡**")
					allies.splice(target,1)
				}
		}
		for(var al of allies){
				if(enemies.length == 0){
					continue		
				}
				var target = randInt(0,enemies.length-1)
				enemies[target].hp -= calcDamage(al,enemies[target])
				if(enemies[target].hp <= 0){
					log("**敵死亡**")
					enemies.splice(target,1)
				}
		}
	}

	save.status.siro.hp = allies[0].hp
	save.status.kuro.hp = allies[1].hp
	updateCurrentHP()

}