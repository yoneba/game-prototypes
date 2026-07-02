function Werewolf(participants, roles) {
    this.player = [];
    this.turn = 0;
    this.lapse = 0;
    for (let i = participants.length; i > 0; i--) {
        let a = rand(i), b = rand(i);
        this.player.push(new Player(participants[a], roles[b]));
        participants[a] = participants[i - 1];
        roles[b] = roles[i - 1];
    }
    this.sunset();
}

Werewolf.prototype.sunset = function () {
    this.phase = "夜";
    for (let p of this.player) {
        p.vote = [];
        p.assult = [];
        p.protect = [];
    }
};

Werewolf.prototype.sunrise = function () {
    this.phase = "昼";
    ++this.lapse;
    for (let p of this.player) {
        p.vote = [];
        if (p.bomb == "exploding") p.bomb = "exploded";
        let q = p.impersonate;
        if (q) {
            delete p.impersonate;
            if (p.alive) {
                p.role = q.role;
                q.role = "市民";
            }
        }
    }
};

Werewolf.prototype.massacre = function () {
    if (this.lapse == 0) return [];
    let victim = [], a = maximizer(this.player, "assult"), g = maximizer(this.player, "protect");
    if (a.role != "妖狐" && !a.indiscriminate_murder() && a != g) victim.push(a);
    for (let p of this.player) {
        if (!p.alive) continue;
        if (p.indiscriminate_murder()) {
            for (let q of p.assult) if (!victim.includes(q)) victim.push(q);
            for (let q of p.protect) if (!victim.includes(q)) victim.push(q);
        }
        if (p.role == "占い師" || p.role == "パパラッチ") {
            let q = p.divine;
            if (q.indiscriminate_murder() && !victim.includes(p)) victim.push(p);
            if (p.role == "占い師" && q.role == "妖狐" && !victim.includes(q)) victim.push(q);
        }
    }
    for (let v of victim) v.alive = false;
    return victim;
};

Werewolf.prototype.execution = function () {
    let sacrifice = maximizer(this.player, "vote");
    sacrifice.alive = false;
    return sacrifice;
};

Werewolf.prototype.judge = function () {
    let villagers = this.player.reduce((prev, current) => prev + (current.alive && current.team() == "市民"), 0),
        wolves = this.player.reduce((prev, current) => prev + (current.alive && current.team() == "人狼"), 0);
    if (wolves == 0 || villagers <= wolves) {
        let third_party = this.player.find(p => (p.team() == "吸血鬼" || p.team() == "妖狐") && p.alive);
        if (third_party) return third_party.team();
        if (villagers <= wolves) return "人狼";
        return "市民";
    }
   return "";
};

function Player(name, role) {
    this.name = name;
    this.role = role;
    this.alive = true;
}

Player.prototype.team = function () {
    if (this.role == "吸血鬼" || this.role == "妖狐") return this.role;
    if (this.role == "人狼") return "人狼";
    return "市民";
};

Player.prototype.appearance = function () {
    if (this.role == "吸血鬼" || this.role == "妖狐") return this.role;
    if (this.role == "人狼" || this.role == "コスプレイヤー") return "人狼";
    return "市民";
};

Player.prototype.aim = function () {
    if (this.role == "吸血鬼" || this.role == "妖狐") return this.role;
    if (this.role == "人狼" || this.role == "狂人" || this.role == "サイコキラー" || this.role == "パパラッチ" || this.role == "メンタリスト") return "人狼";
    return "市民";
};

Player.prototype.indiscriminate_murder = function () {
    return this.role == "サイコキラー" || this.bomb == "exploding";
};

function selectroles(n) {
    let sane = ["市民", "騎士", "ボマー", "コスプレイヤー", "マジシャン"], insane = ["狂人", "サイコキラー", "パパラッチ", "メンタリスト"], alien = ["吸血鬼", "妖狐"];
    switch (n) {
        case 4:
            return ["人狼", "占い師", "市民"].concat(random_pick(sane));
        case 5:
            return ["人狼", "占い師"].concat(random_pick(sane, 2), random_pick(insane));
        case 6:
            return ["人狼", "占い師", "霊媒師"].concat(random_pick(sane), random_pick(insane), random_pick(alien));
        case 7:
            return ["人狼", "占い師", "霊媒師"].concat(random_pick(sane, 2), random_pick(insane), random_pick(alien.concat("人狼")));
        case 8:
            let honest = Math.random() < 0.5 ? ["共有者", "共有者"].concat(random_pick(sane)) : random_pick(sane, 3);
            if (Math.random() < 0.5) return ["人狼", "占い師", "人狼"].concat(random_pick(["霊媒師", "偉大な霊媒師"]), honest, random_pick(insane.concat(alien)));
            return ["人狼", "占い師"].concat(random_pick(["霊媒師", "偉大な霊媒師"]), honest, random_pick(insane, 2));
    }
}

function maximizer(arr, key) {
    let val = 0, tie = [];
    for (let a of arr) {
        if (a[key].length > val) {
            val = a[key].length;
            tie.length = 0;
        }
        if (a[key].length >= val) tie.push(a);
    }
    return val > 0 ? random_pick(tie)[0] : null;
}

function rand(n) {
    return Math.floor(Math.random() * n);
}

function random_pick(arr, k = 1) {
    let picked = [];
    while (k--) picked.push(arr.splice(rand(arr.length), 1)[0]);
    return picked;
}

let werewolf;
