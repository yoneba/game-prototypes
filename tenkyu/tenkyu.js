//             0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21    22 23 24 25 26 27 28 29 30 31
const all = [[1,1,2,2,3,3,5,5,6,6,8, 8, 9, 9, 10,10,11,11,12,12,13,13], [1, 1, 2, 2, 3, 3, 4, 5, 5, 7]];
var test = [[0,30,2,8,4,5,18,19], [6,7,3,16,10,11,12,13], [14,15,9,17,24,25,26,27], [1,23,28,29,22,31,20,21]];
var state; //状態変数
var substate = 0; //補助状態変数
var phase = 0; //何局目か
var turn; //誰の番か
var parent; //誰が親か
var winner; //誰がトリックを取ったか
const human = 3; //誰が人間か
var howmany = 0; //何枚出しされたか
var success = 2; //連チャンの倍率
var hide = true; //コンピュータの手札を隠す
var pairorder = true; //ペアでソートされていたらtrue
var speed = 1; //描画を行うスピード
var what = new Array(8); //手札選択用配列(決定段階)
var selected = new Array(9); //手札選択用配列(途中段階)。8番目の要素には選択されている数を格納
var p = new Array(4); //4人のプレイヤー
var pieces = new Array(32); //32個の牌
var field = new Array(4); //場に出ている牌を記録
var cx = 19; //牌の中心相対x座標
var cy = 51; //牌の中心相対y座標
var lw = 8; //横幅単位
var lh5 = 8; //5間隔の縦幅単位
var lh4 = 10; //4間隔の縦幅単位
var lh3 = 13; //3間隔の縦幅単位
var radius = 7; //半径

function Piece(_type, _power){ //牌
	this.type = _type; //文牌0,武牌1
	this.power = _power; //強さ。数字が小さいほど強い
	this.see = false; //表向きならtrue
}

function Player(n){ //プレイヤー
	this.hand = new Array(8); //手札。使用済みは-1
	this.handnum = 0; //手札の枚数
	for (var i = 0;i < 8;i++) this.hand[i] = -1;
	this.take = 0; //何山取ったか
	this.get = new Array(8); //取った牌
	this.point = 5000; //得点
	this.out = function(){ //牌を出す
		var i, j;
		var won = true;
		j = pieces[this.hand[what[0]]].power;
		if (this.handnum == 1 && this.take == 0) won = false;
		else if (winner != turn){
			if (field[winner][1] != -1){
				if (field[winner][1] == 31) won = false;
				if (field[winner][1] == 21){
					if (this.hand[what[0]] != 18 || this.hand[what[1]] != 19){
						won = false;
					}
				}
				if (field[winner][1] == 19 && field[(winner + 3) % 4][1] != -1) won = false;
			}
			for (i = 0;i < howmany;i++){
				if (pieces[this.hand[what[i]]].power != j) won = false;
				if ((pieces[this.hand[what[i]]].type != pieces[field[winner][i]].type
					|| pieces[this.hand[what[i]]].power >= pieces[field[winner][i]].power)){
					won = false;
				}
			}
		}
		if (won){
			winner = turn;
			for (i = 0;i < howmany;i++){
				field[turn][i] = this.hand[what[i]];
				pieces[this.hand[what[i]]].see = true;
			}
		}
		else{
			for (i = 0;i < howmany;i++){
				field[turn][i] = this.hand[what[i]];
				pieces[this.hand[what[i]]].see = false;
			}
		}
		what[howmany] = this.handnum;
		for (i = 0;i < howmany;i++){
			for (j = what[i];j < what[i + 1];j++){
				this.hand[j - i] = this.hand[j + 1];
			}
		}
		this.handnum -= howmany;
		turn = (turn + 1) % 4;
	}
	this.sort_ = function(pair){ //手札をソート。pairがtrueならペアを結合
		var i, j = this.handnum - 1, tmp, wall = 0;
		while (wall < j){
			while (wall < j && pieces[this.hand[wall]].type == 0) wall++;
			while (wall < j && pieces[this.hand[j]].type == 1) j--;
			tmp = this.hand[wall];
			this.hand[wall] = this.hand[j];
			this.hand[j] = tmp;
		}
		if (pieces[this.hand[wall]].type == 0) wall = this.handnum;
		if (pair){
			for (i = this.handnum - 1;i > 0;i--){
				for (j = 0;j < i;j++){
					if (pieces[this.hand[j]].power > pieces[this.hand[j + 1]].power
						|| pieces[this.hand[j]].power == pieces[this.hand[j + 1]].power && this.hand[j] > this.hand[j + 1]){
						tmp = this.hand[j];
						this.hand[j] = this.hand[j + 1];
						this.hand[j + 1] = tmp;
					}
				}
			}
			i = 0;
			while (i < this.handnum && pieces[this.hand[i]].power < 4) i++;
			if (this.hand[i] == 28){
				wall = i;
				while (i < this.handnum && pieces[this.hand[i]].power < 7) i++;
				if (this.hand[i] == 31){
					if (i - wall == 2){
						this.hand[i] = this.hand[i - 1];
						this.hand[i - 1] = 31;
					}
					else{
						for (j = wall;j < i - 1;j++){
							this.hand[j] = this.hand[j + 1];
						}
						this.hand[j] = 28;
					}
				}
			}
		}
		else{
			for (i = wall - 1;i > 0;i--){
				for (j = 0;j < i;j++){
					if (pieces[this.hand[j]].power > pieces[this.hand[j + 1]].power
						|| pieces[this.hand[j]].power == pieces[this.hand[j + 1]].power && this.hand[j] > this.hand[j + 1]){
						tmp = this.hand[j];
						this.hand[j] = this.hand[j + 1];
						this.hand[j + 1] = tmp;
					}
				}
			}
			for (i = this.handnum - 1;i > wall;i--){
				for (j = wall;j < i;j++){
					if (pieces[this.hand[j]].power > pieces[this.hand[j + 1]].power
						|| pieces[this.hand[j]].power == pieces[this.hand[j + 1]].power && this.hand[j] > this.hand[j + 1]){
						tmp = this.hand[j];
						this.hand[j] = this.hand[j + 1];
						this.hand[j + 1] = tmp;
					}
				}
			}
		}
	}
}

function collect(){ //回収
	var a, i, j = 1;
	for (i = 0;i < howmany;i++) p[winner].get[p[winner].take + i] = field[winner][howmany - i - 1];
	p[winner].take += howmany;
	howmany = 0;
	a = field[winner][1];
	if (a != -1 && (pieces[a].power == 13 || pieces[a].power == 7 || pieces[a].power == 12 && winner != turn)){
		for (i = 0;i < 4;i++) p[i].point -= 200;
		p[winner].point += 800;
		j = 2;
	}
	if (pieces[field[winner][0]].power == 13 || pieces[field[winner][0]].power == 7) j = 2;
	turn = winner;
	if (p[winner].handnum == 0){
		if (p[winner].take == 8) j *= 2;
		count(j);
		state = 5;
	}
	for (i = 0;i < 4;i++){
		for(j = 0;j < 4;j++){
			field[i][j] = -1;
		}
	}
}

function count(rate){ //点数計算
	var i;
	var pay = new Array(4);
	for (i = 0;i < 4;i++){
		if (p[i].take == 0) pay[i] = 5;
		else pay[i] = 4 - p[i].take;
		if (i == parent) pay[i] *= success;
	}
	for (i = 0;i < 4;i++){
		pay[i] *= rate;
		if (winner == parent) pay[i] *= success;
	}
	for (i = 0;i < 4;i++){
		p[i].point -= pay[i] * 100;
		p[winner].point += pay[i] * 100;
	}
}

function deal(){ //配牌
	var i, j, a;
	var yet = new Array(32);
	for (i = 0;i < 32;i++){
		yet[i] = i;
	}
	for (i = 3;i >= 0;i--){
		p[i].handnum = 8;
		for (j = 7;j >= 0;j--){
			a = Math.floor(Math.random() * (i * 8 + j + 1));
			p[i].hand[j] = yet[a];
			yet[a] = yet[i * 8 + j];
		}
	}
}

function work(){ //処理を統括する関数。一定の時間間隔で呼ばれる。
	var i;
	switch(state){
	case 1: //ゲーム開始
		if (document.getElementById('D').checked) speed = 0.5;
		paint();
		state = 3;
		break;
	case 2: //通常プレイ時
		if (field[turn][0] != -1){
			collect();
			if (state == 5 && phase == 7 && winner != parent){
				state = 4;
			}
			paint();
		}
		else if (turn != human){
			routine();
			paint();
		}
		break;
	case 3: //配牌などの処理
		substate++;
		if (substate == 1){
			deal();
			for (i = 0;i < 4;i++) p[i].handnum = 4;
			clearInterval(process);
			process = setInterval(work, 400);
		}
		else if (substate == 2){
			for (i = 0;i < 4;i++) p[i].handnum = 8;
		}
		else if (substate == 3){
			for (i = 0;i < 4;i++) p[i].sort_(pairorder);
		}
		else if (substate == 4){
			substate = 0;
			state = 2;
			clearInterval(process);
			process = setInterval(work, 1000*speed);
		}
		paint();
		break;
	case 5:
		substate = -1;
		paint();
		break;
	}
}

function clicked(e){ //クリックされたとき
	var x = e.clientX - e.target.getBoundingClientRect().left;
	var y = e.clientY - e.target.getBoundingClientRect().top;
	var i;
	if (state == 5){
		if (winner == parent) success++;
		else{
			success = 2;
			phase++;
			parent = (parent + 1) % 4;
		}
		turn = parent;
		winner = turn;
		for (i = 0;i < 4;i++) p[i].take = 0;
		substate = -2;
		paint();
		state = 3;
		substate = 0;
		clearInterval(process);
		process = setInterval(work, 800*speed);
		return;
	}
	if (y >= 40+2.5*human*cy && y <= 40+(2.5*human + 2)*cy
		&& x >= 30 && x < 30 + 2.5*cx*p[human].handnum){
		if ((x - 30) % Math.floor(2.5*cx) <= 2*cx){
			i = Math.floor((x - 30) / (2.5*cx));
			selected[i] *= -1;
			selected[8] += selected[i];
			paint();
		}
	}
}

function outbutton(){ //「出す」ボタンが押されたとき
    if (state != 2 || turn != human || field[turn][0] != -1) return false;
    var i;
    if (selected[8] == 0) {
        if (p[human].handnum == howmany || p[human].handnum == 1) {
            for (i = 0; i < p[human].handnum; i++) selected[i] = 1;
            howmany = p[human].handnum;
            selected[8] = howmany;
        }
        else return false;
    }
	if (winner == turn){
		var a = -1;
		for (i = 0;i < p[human].handnum;i++){
			if (selected[i] == 1){
				if (a == -1) a = pieces[p[human].hand[i]].power;
				if (a != -1){
					if (pieces[p[human].hand[i]].power != a){
						if (a == 4 && pieces[p[human].hand[i]].power == 7){
							if (selected[8] == 2) break;
							//お祝い判定。ソートされていることが前提。
						}
						return false;
					}
				}
			}
		}
	}
	if (winner == turn || selected[8] == howmany){
		howmany = selected[8];
		for (i = p[human].handnum - 1;i >= 0;i--){
			if (selected[i] == 1){
				what[--selected[8]] = i;
				selected[i] = -1;
			}
		}
		p[human].out();
		paint();
		clearInterval(process);
		process = setInterval(work, 1000*speed);
	}
	oracle = document.getElementById('hint');
	if (oracle.hasChildNodes()){
		oracle.removeChild(oracle.childNodes.item(0));
	}
	return true;
}

function sortbutton(){ //ソートのボタンが押されたとき
	if (state != 2) return;
	for (var i = 0;i < 8;i++) selected[i] = -1;
	selected[8] = 0;
	if (S.value == "牌種でソート" && pairorder) {
		S.value = "ペアを結合";
		p[human].sort_(false);
		pairorder = false;
	}
	else if (S.value == "ペアを結合" && !pairorder) {
		S.value = "牌種でソート";
		p[human].sort_(true);
		pairorder = true;
	}
	paint();
}

function hintbutton(){ //ヒントボタンが押されたとき
	var i, j;
	var str = '　私なら左から';
	if (state != 2 || turn != human) return;
	oracle = document.getElementById('hint');
	if (oracle.hasChildNodes()){
		oracle.removeChild(oracle.childNodes.item(0));
	}
	p[human].sort_(true);
	routine();
	if (pairorder) for (i = 0;i < howmany;i++) str += (what[i] + 1) + ' ';
	else{
		var stock = new Array(howmany);
		for (i = 0;i < howmany;i++) stock[i] = p[human].hand[what[i]];
		p[human].sort_(false);
		j = 0;
		for (i = 0;i < howmany;i++){
			for (j = 0;j < p[human].handnum;j++){
				if (p[human].hand[j] == stock[i]){
					str += (j + 1) + ' ';
					break;
				}
			}
		}
	}
	str += '番目を出します';
	hint = document.createTextNode(str);
	oracle.appendChild(hint);
}

function fastcheck(checked){
	clearInterval(process);
	if (checked) speed = 0.5;
	else speed = 1;
	process = setInterval(work, 1000*speed);
}

document.onkeydown = function(e){ //コンピュータの手牌を見る(Ctrl+U)、ヒントの表示(Ctrl+H)
	var shift_, ctrl_;

	// Mozilla(Firefox, NN) and Opera
	if (e != null){
		keycode = e.which;
		ctrl_ = typeof e.modifiers == 'undefined' ? e.ctrlKey : e.modifiers & Event.CONTROL_MASK;
		shift_ = typeof e.modifiers == 'undefined' ? e.shiftKey : e.modifiers & Event.SHIFT_MASK;
	// Internet Explorer
	}else{
		keycode = event.keyCode;
		ctrl_    = event.ctrlKey;
		shift_   = event.shiftKey;
	}

    // キーコードの文字を取得 
    keychar = String.fromCharCode(keycode).toUpperCase();
	if (ctrl_){
		if (e != null){
			e.preventDefault();
			e.stopPropagation();
		}
		else{
			event.returnValue = false;
			event.cancelBubble = true;
		}
	    switch (keycode) {
		case 72: //H
			hintbutton();
			break;
    	case 85: //U
			hide = !hide;
			paint();
			break;
		}
    }
}

function game(){ //ゲーム進行
	canvas = document.getElementById('F');
	if (!canvas || !canvas.getContext){
		alert("お使いのブラウザはキャンバス機能に未対応です");
		return false;
	}
	canvas.addEventListener('click', clicked, false);
	var i, j;
	for (i = 0;i < 22;i++){
		pieces[i] = new Piece(0, all[0][i]);
	}
	for (i = 22;i < 32;i++){
		pieces[i] = new Piece(1, all[1][i - 22]);
	}
	parent = Math.floor(Math.random() * 4);
	turn = parent;
	winner = turn;
	for (i = 0;i < 4;i++){
		p[i] = new Player(i);
	}
	for (i = 0;i < 8;i++){
		selected[i] = -1;
	}
	selected[8] = 0;
	for (i = 0;i < 4;i++){
		field[i] = new Array(4);
		for (j = 0;j < 4;j++) field[i][j] = -1;
	}
	state = 1;
	process = setInterval(work, 200);
}