const knight = 0, roadbuilding = 1, discovery = 2, monopoly = 3, point = 4;

function Catan() {
    Field.call(this);
    this.player = [new Player, new Player, new Player, new Player];
    this.turn = rand(this.player.length);
    this.robber = null;
    this.developmentheap = [knight, knight, knight, knight, knight, knight, knight, knight, knight, knight, knight, knight, knight, knight
        , roadbuilding, roadbuilding, discovery, discovery, monopoly, monopoly, point, point, point, point, point];
    this.exert = false;
    this.longest = null;
    this.largest = null;
    this.history = [];
}

Object.setPrototypeOf(Catan.prototype, Field.prototype);

class Player{
    constructor(){
        this.hand = [0, 0, 0, 0, 0];
        this.road = [];
        this.settlement = [];
        this.city = [];
        this.development = { used: [0, 0, 0, 0, 0], unused: [0, 0, 0, 0, 0] };
        this.trail_length = 0;
    }

    handnum(){
        return this.hand.reduce((x, y) =>x + y);
    }

    remaining(what) {
        if (what == "road") return 15 - this.road.length;
        if (what == "settlement") return 5 - this.settlement.length;
        if (what == "city") return 4 - this.city.length;
    }

    afford(what) {
        if (what == "road") return this.hand[lumber] >= 1 && this.hand[brick] >= 1;
        if (what == "settlement") return this.hand[lumber] >= 1 && this.hand[brick] >= 1 && this.hand[wool] >= 1 && this.hand[grain] >= 1;
        if (what == "city") return this.hand[grain] >= 2 && this.hand[ore] >= 3;
        if (what == "development") return this.hand[wool] >= 1 && this.hand[grain] >= 1 && this.hand[ore] >= 1;
    }

    pay(what) {
        if (what == "road") this.hand[lumber] -= 1, this.hand[brick] -= 1;
        if (what == "settlement") this.hand[lumber] -= 1, this.hand[brick] -= 1, this.hand[wool] -= 1, this.hand[grain] -= 1;
        if (what == "city") this.hand[grain] -= 2, this.hand[ore] -= 3;
        if (what == "development") this.hand[wool] -= 1, this.hand[grain] -= 1, this.hand[ore] -= 1;
    }
}

Catan.prototype.action_dice = function () {
    let eyes = [rand(6) + 1, rand(6) + 1];
    for(let f of valid_face) {
        if (this.face[f].dice == eyes[0] + eyes[1] && f != this.robber) {
            for(let v of periphery(f)) {
                if (!("owner" in this.vertex[v])) continue;
                ++this.player[this.vertex[v].owner].hand[this.face[f].resource];
                if (this.vertex[v].type == "city")++this.player[this.vertex[v].owner].hand[this.face[f].resource];
            }
        }
    }
    return eyes;
};

Catan.prototype.action_end = function () {
    if (this.history.length < 4 || this.history.length >= 8) this.turn = (this.turn + 1) % this.player.length;
    this.exert = false;
    this.history.push(undefined);
    if (this.history.length >= 4 && this.history.length < 8) this.turn = (this.turn + this.player.length - 1) % this.player.length;
};

Catan.prototype.score = function (p) {
    let s = this.player[p].settlement.length + this.player[p].city.length * 2 + this.player[p].development.unused[point];
    if (p == this.longest) s += 2;
    if (p == this.largest) s += 2;
    return s;
};

Catan.prototype.admissible = function (p, e) {
    return this.edge[e] === null && endpoints(e).some(v => (this.vertex[v].owner == p || !("owner" in this.vertex[v]) && incident(v).some(e => this.edge[e] == p)));
};

Catan.prototype.stable = function (v) {
    return this.vertex[v] && !("owner" in this.vertex[v]) && adjacent(v).every(w => !this.vertex[w] || !("owner" in this.vertex[w]));
};

Catan.prototype.connected = function (p, v) {
    return incident(v).some(e => this.edge[e] == p);
};

Catan.prototype.urbanizable = function (p, v) {
    return this.vertex[v] && this.vertex[v].owner == p && this.vertex[v].type == "settlement";
};

Catan.prototype.longest_trail = function (p) {
    let len = 0;
    for (let i = this.player[p].road.length; i > len; i--) {
        let e = this.player[p].road[i - 1];
        this.edge[e] = null;
        let l = this.measure(p, e);
        if (l > len) len = l;
    }
    for(let e of this.player[p].road) this.edge[e] = p;
    return len;
};

Catan.prototype.build_road = function (p, e) {
    let l = this.measure(p, e);
    if (l > this.player[p].trail_length) {
        if (l >= 5 && this.player.every(x => x.trail_length < l)) this.longest = p;
        this.player[p].trail_length = l;
    }
    this.edge[e] = p;
    this.player[p].road.push(e);
};

Catan.prototype.build_settlement = function (p, v) {
    let q = -1;
    for(let e of incident(v)) {
        if (q == this.edge[e]) {
            this.player[q].trail_length = this.longest_trail(q);
            let l = this.player.reduce((x, y) => y.trail_length > x ? y.trail_length : x, 0);
            if (this.longest == q && this.player[q].trail_length < l) {
                let champ = this.player.filter(x => x.trail_length == l);
                if (champ.length == 1) this.longest = this.player.indexOf(champ[0]);
                else this.longest = null;
            }
        }
        if (this.player[this.edge[e]] && this.edge[e] != p) q = this.edge[e];
    }
    this.vertex[v].owner = p, this.vertex[v].type = "settlement";
    this.player[p].settlement.push(v);
};

Catan.prototype.build_city = function (p, v) {
    let s = this.player[p].settlement;
    s.splice(s.indexOf(v), 1);
    this.vertex[v].type = "city";
    this.player[p].city.push(v);
};

Catan.prototype.action_road = function (p, e) {
    if (!this.player[p].remaining("road") || !this.admissible(p, e)) return false;
    if (this.history.length >= 8) {
        if (!this.player[p].afford("road")) return false;
        this.player[p].pay("road");
    }
    this.build_road(p, e);
    return true;
};

Catan.prototype.action_settlement = function (p, v) {
    if (!this.player[p].remaining("settlement") || !this.stable(v)) return false;
    if (this.history.length >= 8) {
        if (!this.player[p].afford("settlement") || !this.connected(p, v)) return false;
        this.player[p].pay("settlement");
    }
    else if (this.history.length >= 4) {
        for(let f of vicnity(v)) if (this.face[f] && this.face[f].resource != barren)++this.player[p].hand[this.face[f].resource];
    }
    this.build_settlement(p, v);
    return true;
};

Catan.prototype.action_city = function (p, v) {
    if (!this.player[p].remaining("city") || !this.urbanizable(p, v) || !this.player[p].afford("city")) return false;
    this.player[p].pay("city");
    this.build_city(p, v);
    return true;
};

Catan.prototype.action_development = function (p) {
    if (this.developmentheap.length == 0 || !this.player[p].afford("development")) return false;
    let a = rand(this.developmentheap.length);
    this.player[p].pay("development");
    ++this.player[p].development.unused[this.developmentheap[a]];
    this.developmentheap.splice(a, 1);
    return true;
};

Catan.prototype.exchange_rate = function (p, r) {
    let rate = 4, buildings = this.player[p].settlement.concat(this.player[p].city);
    for(let v of buildings) {
        if (this.vertex[v].port == barren && rate > 3) rate = 3;
        if (this.vertex[v].port == r && rate > 2) rate = 2;
    }
    return rate;
};

Catan.prototype.action_trade = function (p, exp, imp) {
    let rate = this.exchange_rate(p, exp);
    if (this.player[p].hand[exp] < rate) return false;
    this.player[p].hand[exp] -= rate;
    ++this.player[p].hand[imp];
    return true;
};

Catan.prototype.action_barter = function (p, q, give, take) {
    if (give.some((x, i) => x > this.player[p].hand[i]) || take.some((x, i) => x > this.player[q].hand[i])) return false;
    if (give.every(x => !x) || take.every(x => !x)) return false;
    for (let i = 0; i < this.player[p].hand.length; i++)if (give[i] && take[i]) return false;
    for (let i = 0; i < this.player[p].hand.length; i++) {
        let dif = give[i] - take[i];
        this.player[p].hand[i] -= dif;
        this.player[q].hand[i] += dif;
    }
    return true;
};

Catan.prototype.action_burst = function (p, trash) {
    if (trash.some((x, i) => x > this.player[p].hand[i])) return false;
    if (trash.reduce((x, y) => x + y) != Math.floor(this.player[p].handnum() / 2)) return false;
    for (let i = 0; i < this.player[p].hand.length; i++) this.player[p].hand[i] -= trash[i];
    return true;
};

Catan.prototype.exercise = function (p, what) {
    if (this.player[p].development.unused[what] == 0 || this.exert) return false;
    ++this.player[p].development.used[what];
    --this.player[p].development.unused[what];
    this.exert = true;
    return true;
};

Catan.prototype.action_deprivation = function (p, f, q) {
    this.robber = f;
    if (q != -1 && this.player[q].handnum() > 0) {
        let a = random_pick(this.player[q].hand);
        --this.player[q].hand[a];
        ++this.player[p].hand[a];
    }
};

Catan.prototype.action_knight = function (p, f, q) {
    if (!this.exercise(p, knight)) return false;
    this.action_deprivation(p, f, q);
    let k = this.player[p].development.used[knight];
    if (k >= 3 && (this.largest === null || k > this.player[this.largest].development.used[knight])) this.largest = p;
    return true;
};

Catan.prototype.action_roadbuilding = function (p, e1, e2) {
    if (!this.exercise(p, roadbuilding)) return false;
    if (e1 != -1) this.build_road(p, e1);
    if (e2 != -1) this.build_road(p, e2);
    return true;
};

Catan.prototype.action_discovery = function (p, r1, r2) {
    if (!this.exercise(p, discovery)) return false;
    ++this.player[p].hand[r1];
    ++this.player[p].hand[r2];
    return true;
};

Catan.prototype.action_monopoly = function (p, r) {
    if (!this.exercise(p, monopoly)) return false;
    for (let i = 0; i < this.player.length; i++) {
        if (i == p) continue;
        this.player[p].hand[r] += this.player[i].hand[r];
        this.player[i].hand[r] = 0;
    }
    return true;
};
