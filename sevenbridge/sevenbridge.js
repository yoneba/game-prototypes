//カード識別番号は0~54。0がスペA、1がハートA、4がスペ2に対応。
const nil = -1; //無効な値であることを表す
const law = 13; //トランプの数字の種類
const kind = 4; //トランプのスートの種類
const ace = 1; //エース
const whole = 55; //トランプの総枚数の最大値
const outset = 8; //初期の手札枚数
var jkrnum; //使用するジョーカーの枚数
var jkrpen; //ジョーカーの減点倍率
var sevenpen; //7の減点倍率
var onekill_bonus; //一気アガリの時減点を倍にするかどうか
var uniform_penalty; //2～9(7を除く)の減点を一律にするかどうか
var state; //状態変数
var turn; //誰の番か
var deck = new Array; //山札
var trash = new Array; //捨て札
var field = new Array; //場に出たカード
var p = [new Player, new Player, new Player, new Player]; //プレイヤー
var damage = new Array(p.length); //食らった減点
var scratch; //何枚の手札からターンが始まったか
var standoff; //引き分けかどうか

Array.prototype.numsort = function () {
    sorting(this, numpred);
};

Array.prototype.marksort = function () {
    sorting(this, markpred);
};

Array.prototype.ismeldable = function () {
    if (this.length == 0) return null;
    else if (this.length == 1) {
        if (isjoker(this[0]) || numof(this[0]) == 7) return this.slice();
    }
    else if (this.length == 2) {
        var s = this.slice();
        s.numsort();
        if (isjoker(s[0])) return s;
        var a = numof(s[0]);
        if (a == 6) {
            if (isjoker(s[1])) return s;
            else if (numof(s[1]) == 7 && suitof(s[1]) == suitof(s[0])) return s;
        }
        else if (a == 7) {
            if (isjoker(s[1])) return s;
            else if (numof(s[1]) == 8 && suitof(s[1]) == suitof(s[0])) return s;
        }
        else if (a == 8) {
            if (isjoker(s[1])) return new Array(s[1], s[0]);
        }
    }
    else {
        var s = this.slice(), a = nil;
        s.numsort();
        for (var i = s.length - 1; i >= 0; i--) {
            if (!isjoker(s[i])) {
                a = i;
                break;
            }
        }
        if (a == nil || a == 0) return s;
        else {
            var same_num = true, same_suit = true;
            for (var i = 1; i <= a; i++) {
                if (numof(s[i]) != numof(s[0])) same_num = false;
                if (suitof(s[i]) != suitof(s[0])) same_suit = false;
            }
            if (same_num) return s;
            else if (same_suit) {
                var min = numof(s[0]), max = numof(s[a]), t = new Array;
                if (max - min < s.length) {
                    var k = 0, l = a + 1;
                    for (var i = min; i <= max; i++) {
                        if (numof(s[k]) == i) t.push(s[k++]);
                        else t.push(s[l++]);
                    }
                    for (var i = l; i < s.length; i++) t.push(s[i]);
                    return t;
                }
            }
        }
    }
    return null;
};

Array.prototype.ischow = function () {
    if (this.length < 3) return null;
    var s = nil;
    for (var i = 0; i < this.length; i++) {
        if (!isjoker(this[i])) {
            if (s == nil) s = suitof(this[i]);
            else if (suitof(this[i]) != s) return null;
        }
    }
    return this.ismeldable();
};

Array.prototype.ispung = function () {
    if (this.length < 3) return null;
    var n = nil;
    for (var i = 0; i < this.length; i++) {
        if (!isjoker(this[i])) {
            if (n == nil) n = numof(this[i]);
            else if (numof(this[i]) != n) return null;
        }
    }
    return this.ismeldable();
};

Array.prototype.addable = function (cs) {
    if (cs.length == 0) return null;
    return this.concat(cs).ismeldable();
};

Array.prototype.add = function (cs) {
    var fresh = this.addable(cs);
    if (fresh) {
        this.length = 0;
        for (var i = 0; i < fresh.length; i++) this.push(fresh[i]);
    }
    return fresh;
};

Array.prototype.penalty = function () {
    var fine = 0, magnify = 1;
    for (var i = 0; i < this.length; i++) {
        if (isjoker(this[i])) {
            fine += 10;
            magnify *= jkrpen;
        }
        else if (numof(this[i]) == 7) {
            fine += 10;
            magnify *= sevenpen;
        }
        else if (numof(this[i]) >= 10 || numof(this[i]) == ace) fine += 10;
        else fine += uniform_penalty ? 5 : numof(this[i]);
    }
    return fine * magnify;
};

function Player() {
    this.point = 0;
    this.hand = new Array;
    this.change;
}

Player.prototype.draw = function () {
    var a = Math.floor(Math.random() * deck.length);
    this.hand.push(deck[a]);
    if (a < deck.length - 1) deck[a] = deck.pop();
    else --deck.length;
    scratch = this.hand.length;
    state = "main";
};

Player.prototype.discard = function (what) {
    var found = false;
    for (var i = 0; i < this.hand.length; i++) {
        if (this.hand[i] == what) found = true;
        else if (found) this.hand[i - 1] = this.hand[i];
    }
    trash.push(what);
    --this.hand.length;
    ++this.change;
    if (this.hand.length > 0) {
        state = "request";
        scratch = 0;
    }
    else {
        state = "finish";
        standoff = false;
    }
};

Player.prototype.meldable = function (cs) {
    if (cs.length >= this.hand.length) return null;
    return cs.ismeldable();
};

Player.prototype.meld = function (cs) {
    var mel = this.meldable(cs);
    if (mel) {
        field.push(mel);
        for (var i = 0; i < cs.length; i++) {
            var found = false;
            for (var j = 0; j < this.hand.length; j++) {
                if (this.hand[j] == cs[i]) found = true;
                else if (found) this.hand[j - 1] = this.hand[j];
            }
            --this.hand.length;
        }
    }
    return mel;
};

Player.prototype.taggable = function (cs, base) {
    if (this.hand.length == outset || cs.length >= this.hand.length) return null;
    return base.addable(cs);
};

Player.prototype.tag = function (cs, base) {
    if (this.hand.length == outset || cs.length >= this.hand.length) return null;
    var merge = base.add(cs);
    if (merge) {
        var k = 0;
        for (var i = 0; i < this.hand.length; i++) {
            if (k < cs.length && this.hand[i] == cs[k])++k;
            else this.hand[i - k] = this.hand[i];
        }
        this.hand.length -= k;
    }
    return merge;
};

Player.prototype.chowcomponents = function (n) {
    if (isjoker(n) || this.hand.length <= 2) return new Array;
    var s = new Array, t = new Array, jkr = new Array;
    for (var i = 0; i < this.hand.length; i++) {
        if (isjoker(this.hand[i])) jkr.push(this.hand[i]);
        else if (suitof(this.hand[i]) == suitof(n)) s.push(this.hand[i]);
    }
    s.push(n);
    s.numsort();
    for (var i = 0, j = 0; i < s.length; i++) {
        if (s[i] > n) break;
        while (j < s.length && numof(s[j]) - numof(s[i]) <= j - i + jkr.length)++j;
        if (numof(s[j - 1]) - numof(s[i]) >= 2 && numof(s[j - 1]) >= numof(n)) {
            var u = new Array;
            for (var k = i; k < j; k++) u.push(s[k]);
            t.push(u.concat(jkr));
        }
    }
    return t;
};

Player.prototype.pungcomponents = function (n) {
    if (isjoker(n) || this.hand.length <= 2) return new Array;
    var t = new Array;
    for (var i = 0; i < this.hand.length; i++) {
        if (isjoker(this.hand[i]) || numof(this.hand[i]) == numof(n))t.push(this.hand[i]);
    }
    t.push(n);
    return t;
};

Player.prototype.chowable = function (cs, n) {
    if (cs.length >= this.hand.length) return null;
    var t = cs.slice();
    t.push(n);
    return t.ischow();
};

Player.prototype.pungable = function (cs, n) {
    if (cs.length >= this.hand.length) return null;
    var t = cs.slice();
    t.push(n);
    return t.ispung();
};

function card(s, n) {
    return (n - 1) * kind + s;
}

function isjoker(n) {
    return n >= law * kind;
}

function numof(n) {
    return Math.floor(n / kind) + 1;
}

function suitof(n) {
    if (isjoker(n)) return kind;
    return n % kind;
}

function numpred(a, b) {
    return a < b;
}

function markpred(a, b) {
    return suitof(a) < suitof(b) || suitof(a) == suitof(b) && a < b;
}

function sorting(arr, pred) {
    for (var i = 1; i < arr.length; i++) {
        var a = arr[i], j = i;
        while (j > 0 && pred(a, arr[j - 1])) {
            arr[j] = arr[j - 1];
            --j;
        }
        arr[j] = a;
    }
}

function prepare() {
    var w = law * kind + jkrnum, tray = new Array(w), k = 0;
    deck.length = 0, trash.length = 0, field.length = 0;
    for (var i = 0; i < p.length; i++) {
        p[i].hand.length = 0;
        p[i].change = 0;
        for (var j = 0; j < 7; j++) tray[k++] = i;
    }
    while (k < w) tray[k++] = nil;
    while (k > 0) {
        var a = Math.floor(Math.random() * k);
        if (tray[a] == nil) deck.push(w - k);
        else p[tray[a]].hand.push(w - k);
        tray[a] = tray[--k];
    }
    for (var i = 0; i < p.length; i++) damage[i] = 0;
    state = "draw";
}

function move_on() {
    if (deck.length > 0) {
        turn = (turn + 1) % p.length;
        state = "draw";
    }
    else {
        state = "finish";
        standoff = true;
    }
}

function furo_allowed() {
    return trash.length > p.length;
}

function impose_fine() {
    for (var i = 0; i < p.length; i++) {
        damage[i] = p[i].hand.penalty();
        if (onekill_bonus && scratch == outset) damage[i] *= 2;
        p[i].point += damage[i];
    }
}
