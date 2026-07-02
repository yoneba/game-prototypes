//価値
//0:最強、1:相手のターンでも強いペア、2:自分のターンなら強いペア、3:弱いペア、4:まあまあ、5:ゴミ
//武牌と文牌のバランス、最強牌を更新、地八の評価の向上、武牌が取り残されることへの危惧、自分のターンでしか使えないペアを放出する、天九を温存しすぎない

function routine(){ //思考ルーチン
	var a, b, c, d, i;
	var value = new Array(p[turn].handnum);
	var coup = new Array(6);
	for (i = 0;i < p[turn].handnum;i++) value[i] = -1;
	for (i = 0;i < 6;i++) coup[i] = 0;
	for (i = 0;i < p[turn].handnum;i++){ //手札を価値で分類
		a = pieces[p[turn].hand[i]].power;
		if (a == 1){
			value[i] = 0;
			coup[0]++;
			continue;
		}
		if (a == 4 && i != p[turn].handnum - 1 && p[turn].hand[i + 1] == 31){
			value[i] = 2;
			value[++i] = 2;
			coup[2]++;
			continue;
		}
		while (i != p[turn].handnum - 1 && pieces[p[turn].hand[i + 1]].power == a){
			if (a <= 3){
				if (value[i] == -1){
					value[i] = 1;
					coup[1]++;
				}
				value[++i] = 1;
				coup[1]++;
			}
			else if (a == 13){
				value[i] = 2;
				value[++i] = 2;
				coup[2]++;
			}
			else{
				if (value[i] == -1){
					value[i] = 3;
					coup[3]++;
				}
				value[++i] = 3;
				coup[3]++;
			}
		}
		if (value[i] == -1){
			if (a <= 5){
				value[i] = 4;
				coup[4]++;
			}
			else{
				value[i] = 5;
				coup[5]++;
			}
		}
	}
	if (winner == turn){ //自分が打ち出しの時
		if (coup[2] > 0){
			if (coup[0] > 0 && coup[0] + coup[2] == p[turn].handnum){
				for (i = 0;pieces[p[turn].hand[i]].power == 1;i++) what[i] = i;
				howmany = i;
			}
			else{
				for (i = 0;i < p[turn].handnum;i++){
					if (value[i] == 2){
						what[0] = i;
						what[1] = i + 1;
						howmany = 2;
						break;
					}
				}
			}
		}
		else if (coup[0] > 0 && (coup[0] <= 2 || p[turn].handnum + p[turn].take == 8) && coup[0] < p[turn].handnum
			&& pieces[p[turn].hand[coup[0]]].type == pieces[p[turn].hand[p[turn].handnum - 1]].type
			&& pieces[p[turn].hand[coup[0]]].power == pieces[p[turn].hand[p[turn].handnum - 1]].power){
			what[0] = 0;
			howmany = 1;
			if (coup[0] + 1 == p[turn].handnum){
				a = 0;
				for (i = 0;i < 4;i++){
					if (p[i].take == 0) a++;
				}
				if (a == 0 || a <= 1 && coup[0] >= 2) what[0] = p[turn].handnum - 1;
			}
		}
		else if (coup[4] + coup[5] >= 4 && coup[0] <= 1 || p[turn].handnum <= 5 && coup[0] == 0){
			if (coup[1] > 0 || coup[3] > 0){
				if (coup[1] > 0) b = 1;
				else b = 3;
				a = 0;
				for (i = 0;i < p[turn].handnum;i++){
					while (value[i + a] == b && pieces[p[turn].hand[i]].power == pieces[p[turn].hand[i + a]].power){
						what[a] = i + a;
						a++;
						if (i + a == p[turn].handnum) break;
					}
					howmany = a;
					if (a > 0) break;
				}
			}
			else{
				what[0] = 0;
				for (i = 0;i < p[turn].handnum;i++){
					if (pieces[p[turn].hand[i]].power != pieces[p[turn].hand[0]].power){
						what[0] = i;
						break;
					}
				}
				howmany = 1;
			}
		}
		else if (coup[3] > 0 && coup[4] + coup[5] <= 2){
			a = 0;
			for (i = 0;i < p[turn].handnum;i++){
				while (value[i + a] == 3 && pieces[p[turn].hand[i]].power == pieces[p[turn].hand[i + a]].power){
					what[a] = i + a;
					a++;
					if (i + a == p[turn].handnum) break;
				}
				howmany = a;
				if (a > 0) break;
			}
		}
		else{
			a = 0;
			if (coup[5] >= 2) a = coup[5];
			else if (coup[4] + coup[5] >= 2) a = 1 + coup[5];
			if (a != 0){
				for (i = p[turn].handnum - 1;i >= 0;i--){
					if (value[i] == 5) a--;
					if (value[i] == 4 && coup[5] < 2) a--;
					if (a == 0) break;
				}
				what[0] = i;
				howmany = 1;
			}
			else{
				if (coup[0] == 0 && (coup[1] > 0 || coup[3] > 0)){
					if (coup[1] > 0) b = 1;
					else b = 3;
					a = 0;
					for (i = 0;i < p[turn].handnum;i++){
						while (value[i + a] == b && pieces[p[turn].hand[i]].power == pieces[p[turn].hand[i + a]].power){
							what[a] = i + a;
							a++;
							if (i + a == p[turn].handnum) break;
						}
						howmany = a;
						if (a > 0) break;
					}
				}
				else{
					if (coup[1] > 0){
						a = 0;
						for (i = p[turn].handnum - 1;i >= 0;i--){
							while (value[i - a] == 1 && pieces[p[turn].hand[i]].power == pieces[p[turn].hand[i - a]].power){
								what[7 - a] = i - a;
								a++;
								if (i - a == -1) break;
							}
							howmany = a;
							if (a > 0){
								for (b = 0;b < howmany;b++) what[b] = what[8 - howmany + b];
								break;
							}
						}
					}
					else{
						a = pieces[p[turn].hand[p[turn].handnum - 1]].power;
						i = 1;
						while (i < p[turn].handnum && pieces[p[turn].hand[p[turn].handnum - i - 1]].power == a){
							i++;
						}
						howmany = i;
						for (i = 0;i < howmany;i++){
							what[i] = p[turn].handnum - howmany + i;
						}
					}
				}
			}
		}
	}
	else if (howmany == 1){ //1枚で出す時
		b = 8;
		c = 8;
		d = 8;
		for (i = p[turn].handnum - 1; i >= 0;i--){
			a = pieces[p[turn].hand[i]].power;
			if (value[i] >= 4 && c == 8) c = i;
			if (pieces[p[turn].hand[i]].type == pieces[field[winner][0]].type
				&& a < pieces[field[winner][0]].power){
				if (d == 8 && value[i] != 2) d = i;
				if (value[i] == 0 || value[i] >= 4){
					if (b == 8) b = i;
				}
			}
		}
		if (b != 8 && value[b] != 0){
			if (field[(turn + 1) % 4][0] == -1){
				a = 4;
				if (p[turn].handnum == 2){
					for (a = 0;a < 4;a++){
						if (p[a].take == 0) break;
					}
				}
				if (a != 4 || p[turn].handnum <= 4 && (p[turn].take == 0 || coup[0] == 0)
					 || coup[4] + coup[5] >= 5 && coup[0] == 0 || coup[2] > 0){
					for (i = 0;i < p[turn].handnum;i++){
						a = pieces[p[turn].hand[i]].power;
						if (pieces[p[turn].hand[i]].type == pieces[field[winner][0]].type
							&& a < pieces[field[winner][0]].power && (value[i] == 0 || value[i] >= 4)){
							what[0] = i;
							break;
						}
					}
				}
				else what[0] = b;
			}
			else what[0] = b;
		}
		else{		
			if ((coup[5] > 0 || coup[4] > 1) && (p[turn].handnum >= 5 || p[turn].take > 0) && coup[2] == 0) what[0] = c;
			else if (b != 8) what[0] = b;
			else if (d != 8 && (field[(turn + 1) % 4][0] != -1 || c == 8)) what[0] = d;
			else if (c != 8) what[0] = c;
			else what[0] = p[turn].handnum - 1;
		}
	}
	else if (howmany > 1){ //2枚以上で出す時
		a = 1;
		for (i = p[turn].handnum - 1; i >= 0;i--){
			if (pieces[p[turn].hand[i]].power >= pieces[field[winner][howmany - a]].power) continue;
			if (a > 1 && pieces[p[turn].hand[i]].power != pieces[p[turn].hand[what[howmany - 1]]].power){
				a = 1;
			}
			if (pieces[p[turn].hand[i]].type == pieces[field[winner][howmany - a]].type){
				what[howmany - a] = i;
				a++;
				if (a == howmany + 1) break;
			}
		}
		if (howmany == 2){
			if (pieces[field[winner][1]].power == 7) a = 1;
			if (pieces[field[winner][1]].power == 12 && field[(winner + 3) % 4][1] != -1) a = 1;
		}
		if (howmany == 2 && pieces[field[winner][1]].power == 13) a = 1;
		if (coup[4] + coup[5] >= howmany && coup[0] > 0 && (p[turn].take > 0 || p[turn].handnum - howmany >= 4)) a = 1;
		if (howmany == 2 && pieces[field[winner][1]].power == 13 &&
			(pieces[p[turn].hand[what[0]]].power == 12 && pieces[p[turn].hand[what[1]]].power == 12)) a = 3;
		if (a != howmany + 1){
			if (howmany == 2 && p[turn].handnum - howmany <= coup[2] && coup[2] > 0){
				a = howmany;
				for (i = p[turn].handnum - 1;i >= 0;i--){
					if (value[i] == 2){
						what[--a] = i--;
						what[--a] = i--;
						break;
					}
				}
			}
			else if (coup[5] >= howmany || coup[4] + coup[5] >= howmany){
				b = howmany;
				for (i = p[turn].handnum - 1;i >= 0;i--){
					if (value[i] == 5 || value[i] == 4){
						what[--b] = i;
						if (b == 0) break;
					}
				}
			}
			else{
				if (coup[3] + coup[5] >= howmany || coup[3] + coup[4] + coup[5] >= howmany){
					a = howmany;
					for (i = p[turn].handnum - 1;i >= 0;i--){
						if (value[i] == 3 || value[i] == 5 || coup[3] + coup[5] < howmany && value[i] == 4){
							what[--a] = i;
							if (a == 0) break;
						}
					}
				}
				else{
					for (i = 0;i < howmany;i++){
						what[i] = p[turn].handnum - howmany + i;
					}
				}
			}
		}
	}
	if (turn != human) p[turn].out();
}