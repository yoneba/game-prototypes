const already = p.length; //既出カード
const numvalue = [0, 3, 7, 8, 9, 11, 13, 14, 12, 10, 6, 5, 4, 2]; //数字の価値
var movestack = new Array; //試行記録スタック

function decision_making(who) {
    var plan = { move: new Array, score: -Infinity }, loc = locate_cards();
    movestack = new Array;
    meld_phase(who, 0, 0, loc, plan);
    return plan.move;
}

function declare_furo(who) {
    var cho = p[who].chowcomponents(trash[trash.length - 1]), pun = p[who].pungcomponents(trash[trash.length - 1]);
    if (pun.length >= 3) {
        return { action: "pung", obj: pun };
    }
    else if (cho.length != 0) {
        return { action: "chow", obj: cho[0] };
    }
    return { action: "through" };
}

function locate_cards() {
    var t = new Array(law * kind + jkrnum);
    for (var i = 0; i < field.length; i++) {
        for (var j = 0; j < field[i].length; j++) {
            t[field[i][j]] = already;
        }
    }
    for (var i = 0; i < trash.length; i++) {
        t[trash[i]] = already;
    }
    for (var i = 0; i < p.length; i++) {
        for (var j = 0; j < p[i].hand.length; j++) {
            t[p[i].hand[j]] = i;
        }
    }
    for (var i = 0; i < deck.length; i++) {
        t[deck[i]] = nil;
    }
    return t;
}

function meld_phase(who, spent, edge, loc, best) {
    var full = (1 << p[who].hand.length) - 1, subset = new Array;
    for (var i = edge + 1; i < full; i++) {
        if (i & spent || (i ^ spent) == full) continue;
        subset.length = 0;
        for (var j = 0; j < p[who].hand.length; j++)if ((1 << j) & i) subset.push(p[who].hand[j]);
        var mel = subset.ismeldable();
        if (mel) {
            movestack.push({ action: "meld", obj: subset });
            meld_phase(who, spent ^ i, i, loc, best);
            movestack.pop();
            if (best.score == Infinity) return;
        }
    }
    if (spent != 0 || p[who].hand.length < outset) tag_phase(who, spent, 0, loc, best);
    else discard_phase(who, spent, loc, best);
}

function tag_phase(who, spent, begin, loc, best) {
    var full = (1 << p[who].hand.length) - 1, subset = new Array;
    for (var i = 1; i < full; i++) {
        if (i & spent || (i ^ spent) == full) continue;
        subset.length = 0;
        for (var j = 0; j < p[who].hand.length; j++)if ((1 << j) & i) subset.push(p[who].hand[j]);
        for (var j = begin; j < field.length; j++) {
            var merge = field[j].addable(subset);
            if (merge) {
                movestack.push({ action: "tag", obj: subset, base: field[j] });
                tag_phase(who, spent ^ i, j + 1, loc, best);
                movestack.pop();
                if (best.score == Infinity) return;
            }
        }
    }
    discard_phase(who, spent, loc, best);
}

function discard_phase(who, spent, loc, best) {
    var possess = new Array(law * kind + jkrnum), connectivity = new Array(p[who].hand.length), dispose = nil, pres = 0;
    for (var i = 0; i < law * kind + jkrnum; i++) possess[i] = false;
    for (var i = 0; i < p[who].hand.length; i++) {
        if ((1 << i) & spent) continue;
        possess[p[who].hand[i]] = true;
        ++pres;
    }
    for (var i = 0; i < p[who].hand.length; i++) {
        if ((1 << i) & spent || isjoker(p[who].hand[i])) continue;
        var n = numof(p[who].hand[i]), s = suitof(p[who].hand[i]), same = 0;
        for (var j = 0; j < kind; j++)if (possess[card(j, n)])++same;
        var c = same * same;
        if (n > 2 && possess[card(s, n - 2)]) c += 1;
        if (n > 1 && possess[card(s, n - 1)]) c += 2;
        if (n < 13 && possess[card(s, n + 1)]) c += 2;
        if (n < 12 && possess[card(s, n + 2)]) c += 1;
        connectivity[i] = c;
        if (dispose == nil) dispose = i;
        else {
            if (pres == 3) {
                if (numvalue[n] < numvalue[numof(p[who].hand[dispose])]) dispose = i;
            }
            else {
                if (c < connectivity[dispose] || c == connectivity[dispose] && numvalue[n] < numvalue[numof(p[who].hand[dispose])]) dispose = i;
            }
        }
    }
    if (dispose == nil) return;
    var v = assess_return(who, spent | (1 << dispose), pres - 1, connectivity) - assess_risk(who, spent | (1 << dispose));
    if (v > best.score) {
        best.score = v;
        best.move.length = movestack.length;
        for (var i = 0; i < movestack.length; i++) {
            var a = { action: movestack[i].action };
            if (a.action == "meld") a.obj = movestack[i].obj.slice();
            else if (a.action == "tag") {
                a.obj = movestack[i].obj.slice();
                a.base = movestack[i].base;
            }
            best.move[i] = a;
        }
        best.move.push({ action: "discard", obj: p[who].hand[dispose] });
    }
}

function assess_return(who, spent, residue, connectivity) {
    var disuse = 0, connectsum = 0;
    for (var i = 0; i < p[who].hand.length; i++) {
        if ((1 << i) & spent) continue;
        if (connectivity[i] <= 4) connectsum += connectivity[i];
        if (connectivity[i] == 1 && numof(p[who].hand[i]) != 7)++disuse;
    }
    switch (residue) {
        case 0:
            return Infinity;
        case 1:
            return 10;
        case 2:
            return 0;
        case 3:
            return connectsum / 3;
        default:
            if (disuse <= 1) return connectsum / residue;
            return 0;
    }
}

function assess_risk(who, spent) {
    var remain = new Array;
    for (var i = 0; i < p[who].hand.length; i++) {
        if ((1 << i) & spent) continue;
        remain.push(p[who].hand[i]);
    }
    var prob = 1;
    for (var i = 0; i < p.length; i++) {
        if (i == who) continue;
        switch (p[i].hand.length) {
            case 1:
                prob *= 0.5;
                break;
            case 2:
                prob *= 0.9;
                break;
            case 3:
                prob *= 0.6;
                break;
            case 4:
                prob *= 0.7;
            default:
                if (p[i].change >= 5) prob *= 0.6;
                else if (p[i].change >= 4) prob *= 0.7;
                else if (p[i].change >= 3) prob *= 0.8;
                else if (p[i].change >= 2) prob *= 0.9;
        }
    }
    return (1 - prob) * remain.penalty();
}
