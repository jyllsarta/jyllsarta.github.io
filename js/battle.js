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
	if(deepest_dungeon_id <= 4){
		depth /= 8
	}
	//エクストラダンジョンは毎階層ごとにランクアップ
	else if(deepest_dungeon_id == 5){
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

function getRewardCoin(){
	var coins =  randInt(0,2)
	if(save.current_dungeon_id == 5){
		coins += randInt(5,10)
	}
	return coins
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
			var coinEarned = getRewardCoin()
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

		//鱗粉がもらえるのは初回のみ
		if(unique_boss_id !== null && save.dungeon_process[save.current_dungeon_id] <= save.current_floor ){
			var powder_earned = randInt(4800,7000)
			castMessage(""+powder_earned+"個の鱗粉を譲り受けた！")
			save.powder += powder_earned
		}

		//勝利アニメーションを再生
		if(unique_boss_id !== null){
			showFailyBattleSprite(unique_boss_id,is_win=true)
		}
		else if(bossBattle){
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
		damageDealedPersentage = Math.max(Math.floor(damageDealedPersentage/ enemies.length),0)
		//全滅時のメッセージ
		castMessage( "しろこ" + damage_siro +",くろこ" + damage_kuro + "ダメージ。")
		castMessage( turnCount+"ターン耐え,"+damageDealedPersentage+"%削ったが全滅した... ") 
		save.total_death++
		if(save.notify.onDeath){
			notify(title="全滅した...",body=("(この通知をクリックで全回復します...)"),icon="death",onClick=function(){ressurect()})
		}
		//敗北アニメーションを再生
		if(unique_boss_id !== null){
			showFailyBattleSprite(unique_boss_id,is_win=false)
		}
		else if(bossBattle){
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
		"エクリテ：HP2.74m,攻280k,守40k"
		],
		hp : 2740000,
		atk : 278000,
		sld : 40000,
		pre_battle_skill : '\
		castMessage("<戦闘開始！>");\
		castMessage("「これが法の光よ！耐えてみせなさい！」");\
		allies[0].hp -= Math.floor(allies[0].hp/2);\
		allies[1].hp -= Math.floor(allies[1].hp/2);\
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
	1 : {
		name : "ピリカ",
		pre_battle_message : ["「やぁやぁ、ショップでおなじみピリカちゃんだよ！",
		"まぁちょっと、一緒に遊ぼうよ！」",
		"ピリカ：HP1.4m,攻350k,守350k"
		],
		hp : 1400000,
		atk : 350000,
		sld : 350000,
		pre_battle_skill : '\
		castMessage("「さーてさて、私オリジナルの武器は持ってきてくれたかな？」");\
		castMessage("「ピリカちゃん装備はこの戦闘でのみ大ボーナスだよー！」");\
		var siro_pirika = countPirikaWeaponEquipped("siro");\
		var kuro_pirika = countPirikaWeaponEquipped("kuro");\
		if(siro_pirika){\
			castMessage("「おぉー！しろこさんまいどっす！"+siro_pirika+"つ持ってきてくれたんすね！」");\
			allies[0].atk += 200000 * siro_pirika;\
			castMessage("しろこの攻撃力が"+(siro_pirika*200000)+"上昇！");\
		};\
		if(kuro_pirika){\
			castMessage("「おほー！くろこさんまいどっす！"+kuro_pirika+"つ持ってきてくれたんすね！」");\
			allies[1].sld += 200000 * kuro_pirika;\
			castMessage("くろこの防御力が"+(kuro_pirika*200000)+"上昇！");\
		}\
		if(!siro_pirika && !kuro_pirika){\
			castMessage("もー、持ってきてくれてないじゃないっすかー！ざんねんだなー！");\
		}\
		castMessage("<戦闘開始！>");\
		',
		skill : '\
		castMessage("「『天地砕く唯一の雷光』！さぁ、どんどん強くなるっすよー！」");\
		castMessage("ピリカの全パラメータが25000上昇！");\
		enemies[0].atk += 25000;\
		enemies[0].sld += 25000;\
		',
	},
	2 : {
		name : "ラスト",
		pre_battle_message : ["「序盤に召喚されたラストです...",
		"腐食しちゃります...よろしくね...」",
		"ラスト：HP2.5m,攻250k,守0"
		],
		hp : 2500000,
		atk : 250000,
		sld : 0,
		pre_battle_skill : '\
		castMessage("「おおいなる、だいちのめぐみよ、そのちにあしをつけるもののちからを、ことごとくうばいされい...！」");\
		allies[0].atk = Math.max(allies[0].atk - 500000,0);\
		allies[1].atk = Math.max(allies[1].atk - 500000,0);\
		castMessage("二人の攻撃力が500000減少！");\
		if(allies[0].atk == 0){\
			castMessage("「おお、ちからをすいつくしてしまったか...ふふ...」");\
			castMessage("しろこは力を吸い尽くされてぐんにゃりした！");\
			enemies[0].hp += 5000000;\
			castMessage("ラストのHPが500万上昇！");\
		}\
		if(allies[1].atk == 0){\
			castMessage("「おお、ちからをすいつくしてしまったか...ふふ...」");\
			castMessage("くろこは力を吸い尽くされてぐんにゃりした！");\
			enemies[0].hp += 5000000;\
			castMessage("ラストのHPが500万上昇！");\
		}\
		castMessage("<戦闘開始！>");\
		',
		skill : '\
		enemies[0].atk += 1000;\
		',
	},
	3 : {
		name : "ミミカ",
		pre_battle_message : ["「ミミカだよー！　えっとねー、なんだっけ... ...んーよろしく！！！」",
		"ミミカ：HP1m,攻420k,守420k"
		],
		hp : 1000000,
		atk : 420000,
		sld : 420000,
		pre_battle_skill : '\
		castMessage("(ミミカちゃんは漢字が読めないので、かんたんな文字の装備で挑みましょう。)");\
		var kanjis = countKanjiWeaponEquipped("siro") + countKanjiWeaponEquipped("kuro");\
		if(kanjis >0){\
			castMessage("もぉー！なにそのもじ！よめないんですけど！！！！やだー！");\
			castMessage("ミミカの全パラメータが"+(kanjis * 50000)+"上昇！");\
			enemies[0].atk += kanjis * 50000;\
			enemies[0].sld += kanjis * 50000;\
			enemies[0].hp += kanjis * 50000;\
		}\
		castMessage("<戦闘開始！>");\
		',
		skill : '\
		enemies[0].atk += 2000;\
		',
	},
	4 : {
		name : "コレット",
		pre_battle_message : ["「はいはーい！はじめまして！",
		"造園担当のコレットだよ！」",
		"コレット：HP0.5m,攻680k,守600k"
		],
		hp : 500000,
		atk : 680000,
		sld : 600000,	
		pre_battle_skill : '\
		castMessage("「苗木さんたちにあげるごはん、持ってませんかー？」");\
		var okashi_count = countWeaponEquippedCategoryIs("siro",4) +countWeaponEquippedCategoryIs("kuro",4);\
		if(okashi_count > 0){\
			castMessage("「二人で"+okashi_count+"個持ってきてくださったのですね！」");\
			castMessage("「お返しにサービスです！どうぞ！」");\
			allies[0].atk += okashi_count*40000;\
			allies[0].sld += okashi_count*40000;\
			allies[1].atk += okashi_count*40000;\
			allies[1].sld += okashi_count*40000;\
			castMessage("二人の攻守が"+(okashi_count*40000)+"上昇！");\
		}\
		else{\
			castMessage("「ごはん！ごはんです！具体的に言うとケーキアイコンです！分けてくれたらちょっと協力してあげるのになー！")\
		}\
		castMessage("<戦闘開始！>");\
		',
		skill : '\
		enemies[0].atk += 2000;\
		',
	},
	5 : {
		name : "サクラ",
		pre_battle_message : ["「はーい、サクラですっ！カラフルに、鮮やかに楽しみましょう！」",
		"サクラ：HP1m,攻610k,守640k"
		],
		hp : 1000000,
		atk : 610000,
		sld : 640000,
		pre_battle_skill : '\
		var siro_equips_no_duplicate_rarity = isCharacterEquipsNoDuplicateRarity("siro");\
		if(siro_equips_no_duplicate_rarity){\
			castMessage("「素敵ですしろこさんっ！素晴らしい鮮やかさです！」");\
			castMessage("しろこの攻撃力が300000、防御力が200000上昇！");\
			allies[0].atk += 300000;\
			allies[0].sld += 200000;\
		}\
		else{\
			castMessage("しろこさんの装備欄もっとレアリティバラけさせるべきだと思いますぅー！");\
		}\
		var kuro_equips_no_duplicate_rarity = isCharacterEquipsNoDuplicateRarity("kuro");\
		if(kuro_equips_no_duplicate_rarity){\
			castMessage("「くろこさん...素晴らしいです...！カラフルさ大事ですよねぇ...!");\
			castMessage("くろこの攻撃力が200000、防御力が300000上昇！");\
			allies[1].atk += 200000;\
			allies[1].sld += 300000;\
		}\
		else{\
			castMessage("くろこさんの装備欄もっとレアリティバラけさせるべきだと思いますぅー！");\
		}\
		castMessage("<戦闘開始！>");\
		',
		skill : '\
		enemies[0].atk += 2000;\
		',
	},
	6 : {
		name : "シール",
		pre_battle_message : ["「封魔の妖精シールでーぇす...",
		"......超ぅすごい硬いバリア貼れるんで、ささーぁがんばって割ってみてください....」",
		"シール：HP1k,攻150k,守800k"
		],
		hp : 1000,
		atk : 150000,
		sld : 800000,
		pre_battle_skill : '\
		castMessage("<戦闘開始！>");\
		if(allies[0].sld < 150000 || allies[1].sld < 150000){\
			castMessage("「あ、でもボクの攻撃で沈むくらいの無茶な装備はダメですよ、あぶないから... ...ってしてるし...」");\
			castMessage("しろことくろこに50000ダメージ！");\
			allies[0].hp =0;\
			allies[1].hp =0;\
		}\
		',
		skill : '\
		enemies[0].atk += 2000;\
		',
	},

	7 : {
		name : "チョウゼン",
		pre_battle_message : ["「我超然。我漢字大好。夜露死苦！」",
		"超然：体力伍百萬,破六十伍萬,防伍十萬"
		],
		hp : 5000000,
		atk : 650000,
		sld : 500000,
		pre_battle_skill : '\
		castMessage("(チョウゼンさんは嘘中国語にハマっているようなので、漢字をたくさん集めましょう。喜んでくれるはずです。)");\
		var kanjis_siro = countKanjiWeaponEquipped("siro");\
		var kanjis_kuro = countKanjiWeaponEquipped("kuro");\
		if(kanjis_siro >= 15){\
			castMessage("「好！白子、汝使用超拾伍的漢字！汝良理解漢字的魅力！譲汝＜圧倒的防御壁＞」");\
			castMessage("弥弥！白子的防御能今参倍！");\
			allies[0].sld *= 3\
		}\
		else{\
			castMessage("「白子！！！汝不理解漢字的魅力！！！汝必要合計拾伍超的漢字於所持道具！");\
			castMessage("白子今受超絶呪被害。白子防御能只今一点。即死不可避。");\
			allies[0].sld = 1;\
		}\
		if(kanjis_kuro >= 15){\
			castMessage("「好！黑子、汝使用超拾伍的漢字！汝良理解漢字的魅力！譲汝＜圧倒的破壊能＞」");\
			castMessage("弥弥！黑子的破壊能今参倍！");\
			allies[1].atk *= 3\
		}\
		else{\
			castMessage("「黑子！！！汝不理解漢字的魅力！！！汝必要合計拾伍超的漢字於所持道具！");\
			castMessage("黑子今受超絶呪被害。黑子破壊能只今一点。雑魚同然。");\
			allies[0].atk = 1;\
		}\
		castMessage("<戦闘開始！>");\
		',
		skill : '\
		enemies[0].atk += 2000;\
		if(allies[0].isDead){\
			castMessage("「弥ー！白子今気絶！二人揃戦闘非常重要！我夢想共闘友情親愛！我倒限定二人共生存状況！汝必要出直！」");\
			castMessage("黑子今受超絶呪被害！黑子即気絶！");\
			allies[1].isDead=true;\
			allies[1].hp=0;\
		}\
		if(allies[1].isDead){\
			castMessage("「弥弥！黑子今気絶！二人揃戦闘非常重要！我夢想共闘友情親愛！我倒限定二人共生存状況！汝必要出直！」");\
			castMessage("白子今受超絶呪被害！白子即気絶！");\
			allies[0].isDead=true;\
			allies[0].hp=0;\
		}\
		',
	},
	8 : {
		name : "アリス",
		pre_battle_message : ["「アリス...です。あまり派手なのは好きじゃないです...」",
		"★✰*装備をなるべく抑えて挑もう！(少しだけならセーフ)",
		"アリス：HP3m,攻800k,守840k"
		],
		hp : 3000000,
		atk : 800000,
		sld : 840000,
		pre_battle_skill : '\
		var siro_cost_count = countWeaponEquippedTotalRarity("siro");\
		if(siro_cost_count < 6 ){\
			castMessage("「しろこさん...いいですね...。レア装備に頼らないそのこだわり、素敵です...」");\
			castMessage("しろこの攻撃力が400000、防御力が200000上昇！");\
			allies[0].atk += 400000;\
			allies[0].sld += 200000;\
		}\
		else{\
			castMessage("しろこさんのアイテム、キラキラしてますねぇー...そういうのあんまり良くないと思いますぅー...");\
		}\
		var kuro_cost_count = countWeaponEquippedTotalRarity("kuro");\
		if(kuro_cost_count < 6 ){\
			castMessage("「くろこさん...それいいです...！低レア装備をかわいがってもらえてるみたいで何よりです...」");\
			castMessage("くろこの攻撃力が200000、防御力が400000上昇！");\
			allies[1].atk += 200000;\
			allies[1].sld += 400000;\
		}\
		else{\
			castMessage("くろこさんの装備、キラキラしてますねぇー...そういうのあんまり良くないと思いますぅー...");\
		}\
		castMessage("<戦闘開始！>");\
		',
		skill : '\
		enemies[0].atk += 2000;\
		if(allies[0].isDead){\
			castMessage("「しろこさんが倒れてしまったようですね...まだまだですね。一人相手に遅れを取るほど腑抜けていません。」");\
			castMessage("くろこに30000ダメージ！");\
			allies[1].isDead=true;\
			allies[1].hp-=30000;\
		}\
		if(allies[1].isDead){\
			castMessage("「くろこさんが倒れてしまったようですね...まだまだですね。一人相手に遅れを取るほど腑抜けていません。」");\
			castMessage("しろこに30000ダメージ！");\
			allies[0].isDead=true;\
			allies[0].hp-=30000;\
		}\
		',
	},

	9 : {
		name : "ティターニア",
		pre_battle_message : ["「女王、ティターニア。よくぞ9体の妖精を伸した！...まあセールス根性モリモリだったり漢字かぶれの中二病だったり気の抜けた奴らもいたが、ここまで辿りつけたのは真に実力があってのことだろう！その力、我にも示してみせよ！」",
		"ティターニア：HP3m,攻1.48m,守1.4m"
		],
		hp : 3000000,
		atk : 1480000,
		sld : 1400000,
		pre_battle_skill : '\
		var buff_succeeded = getFailyBattleAllBuff();\
		var buff_succeeded_text = buff_succeeded.map(x=>x?"成功！":"失敗！");\
		castMessage("「まあ我は強い！いくらでも助けを呼ぶが良い！郷で仲良くなった者もいるだろう！一気にかかってこい！」");\
		castMessage("二人は妖精たちに協力を仰いだ！");\
		castMessage("エクリテの<パラ均一バフ> ..." + buff_succeeded_text[0]);\
		castMessage("(各々基礎パラの範囲が50%以内で発動)");\
		castMessage("ピリカの<自社商品宣伝> ..." + buff_succeeded_text[1]);\
		castMessage("(誰かがピリカ装備を持てば発動)");\
		castMessage("ラストの<吸精霊力還元> ..." + buff_succeeded_text[2]);\
		castMessage("(二人とも攻撃力400k達成で発動)");\
		castMessage("ミミカの<ひらがなバースト> ..." + buff_succeeded_text[3]);\
		castMessage("(二人で非漢字文字計15文字で発動)");\
		castMessage("コレットの<菓子要求> ..." + buff_succeeded_text[4]);\
		castMessage("(誰か食物カテゴリを装備で発動)");\
		castMessage("サクラの<カラフルブースト> ..." + buff_succeeded_text[5]);\
		castMessage("(誰かが3色以上装備に所持で発動)");\
		castMessage("シールの<防壁増幅> ..." + buff_succeeded_text[6]);\
		castMessage("(誰かがDEF500k達成で発動)");\
		castMessage("超然的<漢字爆発> ..." + buff_succeeded_text[7]);\
		castMessage("(任意一人装備漢字含拾弐文字発動)");\
		castMessage("アリスの<低レア戦略> ..." + buff_succeeded_text[8]);\
		castMessage("(★=3,✰=2,*=1として二人の合計が15以下で発動)");\
		castMessage("...");\
		var buff_count = buff_succeeded.filter(x=>x).length;\
		castMessage(buff_count + "個のバフを受けられた！");\
		castMessage("一つにつき、攻守1.1倍の強化を付与！");\
		allies[0].atk = Math.floor(allies[0].atk * Math.pow(1.1,buff_count));\
		allies[0].sld = Math.floor(allies[0].sld * Math.pow(1.1,buff_count));\
		allies[1].atk = Math.floor(allies[1].atk * Math.pow(1.1,buff_count));\
		allies[1].sld = Math.floor(allies[1].sld * Math.pow(1.1,buff_count));\
		castMessage("しろこ:攻"+allies[0].atk+",守"+allies[0].sld);\
		castMessage("くろこ:攻"+allies[1].atk+",守"+allies[1].sld);\
		castMessage("<戦闘開始！>");\
		',
		skill : '\
		enemies[0].atk += 2000;\
		if(allies[0].isDead){\
			castMessage("「しろこが倒れたので追加攻撃！」");\
			castMessage("くろこに7000ダメージ！");\
			allies[1].hp-=7000;\
		}\
		if(allies[1].isDead){\
			castMessage("「くろこが倒れたので追加攻撃！」");\
			castMessage("しろこに7000ダメージ！");\
			allies[0].hp-=7000;\
		}\
		',
	},	


}
