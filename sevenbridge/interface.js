const human = 0; //人間を表すプレイヤー番号
const num_name = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]; //数字の表示
var remark = new Array(p.length); //副露の宣言
var paintspeed; //描画速度
var flag = [false, false, false, false, false, false, false, false]; //手札の選択状況
var selectedset = new Array; //手札で選択されているカード
var sorttype = "numsort"; //ソートの基準
var player_name = ["プレイヤー", "左", "中", "右"]; //プレイヤーの名前

function initialize() {
    state = "eve";
    start_screen();
    startdiv.style.visibility = "visible";
    configdiv.style.visibility = "hidden";
    furodiv.style.visibility = "hidden";
    opinionboard.style.visibility = "hidden";
    inquirebtn.style.visibility = "hidden";
}

function radiovalueof(name) {
    var r = document.getElementsByName(name);
    for (var i = 0; i < r.length; i++)if (r[i].checked) return r[i].value;
    r[0].checked = true;
    return r[0].value;
}

function game_start() {
    for (var i = 0; i < p.length; i++) p[i].point = 0;
    clear_selection();
    jkrnum = parseInt(radiovalueof("jkrnumradio"));
    jkrpen = parseInt(radiovalueof("jkrpenradio"));
    sevenpen = parseInt(radiovalueof("sevenpenradio"));
    onekill_bonus = onekillcheck.checked;
    uniform_penalty = !nonroyalpointcheck.checked;
    startdiv.style.visibility = "hidden";
    prepare();
    turn = Math.floor(Math.random() * p.length);
    arrange[0].length = 0, arrange[1].length = 0;
    paint();
    set_speed();
    setTimeout(control, paintspeed);
}

function control() {
    switch (state) {
        case "draw":
            p[turn].draw();
            if (turn != human) {
                p[turn].hand.numsort();
                setTimeout(control, paintspeed);
            }
            else inquirebtn.style.visibility = "visible";
            break;
        case "main":
            if (turn != human) {
                var schedule = decision_making(turn);
                process_task(schedule, 0);
            }
            break;
        case "request":
            if (furo_allowed()) {
                var requesting = nil, next = (turn + 1) % p.length, earlier = true;
                for (var i = 1; i < p.length; i++) {
                    var k = (turn + i) % p.length;
                    if (k == human) {
                        remark[k] = { action: "through" };
                        earlier = false;
                    }
                    else {
                        remark[k] = declare_furo(k);
                        if (remark[k].action == "pung") {
                            requesting = k;
                            break;
                        }
                    }
                }
                var cho = next == human ? p[human].chowcomponents(trash[trash.length - 1]) : new Array;
                var pun = p[human].pungcomponents(trash[trash.length - 1]);
                if (earlier && requesting != nil) setTimeout(process_furo, paintspeed, requesting, remark[requesting]);
                else if (turn != human && (pun.length >= 3 || cho.length != 0 && requesting == nil)) {
                    furodiv.style.visibility = "visible";
                    chowbtn.disabled = cho.length == 0;
                    pungbtn.disabled = pun.length < 3;
                }
                else {
                    if (requesting != nil) setTimeout(process_furo, paintspeed, requesting, remark[requesting]);
                    else if (next != human && remark[next].action == "chow") setTimeout(process_furo, paintspeed, next, remark[next]);
                    else {
                        move_on();
                        setTimeout(control, paintspeed);
                    }
                }
            }
            else {
                move_on();
                setTimeout(control, paintspeed);
            }
            break;
        case "finish":
            setTimeout(function () {
                if (!standoff) impose_fine();
                state = "over";
                paint();
            }, paintspeed);
            break;
        default:
            return;
    }
    paint();
}

function canvas_clicked(e) {
    switch (state) {
        case "main":
        case "chowselect":
        case "pungselect":
            if (state == "main" && turn != human) break;
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            var a = hand_clickedindex(x, y);
            if (a != nil) {
                flag[a] = !flag[a];
                selectedset.length = 0;
                for (var i = 0; i < p[human].hand.length; i++)if (flag[i]) selectedset.push(p[human].hand[i]);
            }
            if (state == "main" && trasharea_clicked(x, y)) {
                if (selectedset.length == 1) {
                    p[human].discard(selectedset[0]);
                    clear_selection();
                    p[human].hand[sorttype]();
                    opinionboard.style.visibility = "hidden";
                    inquirebtn.style.visibility = "hidden";
                    control();
                }
            }
            var base = meldarea_clickedindex(x, y);
            if (base) {
                if (base.col == nil) {
                    if (state == "main") {
                        var mel = p[human].meld(selectedset);
                        if (mel) clear_selection();
                    }
                    else if (state == "chowselect") {
                        var cho = p[human].chowable(selectedset, trash[trash.length - 1]);
                        if (cho) process_furo(human, { action: "chow", obj: cho });
                    }
                    else if (state == "pungselect") {
                        var pun = p[human].pungable(selectedset, trash[trash.length - 1]);
                        if (pun) process_furo(human, { action: "pung", obj: pun });
                    }
                }
                else {
                    if (state == "main") {
                        var merge = p[human].tag(selectedset, field[arrange[base.col][base.row]]);
                        if (merge) clear_selection();
                    }
                }
            }
            paint();
            break;
        case "over":
            prepare();
            arrange[0].length = 0, arrange[1].length = 0;
            paint();
            setTimeout(control, paintspeed);
            break;
    }
}

function process_task(plan, n) {
    switch (plan[n].action) {
        case "meld":
            p[turn].meld(plan[n].obj);
            break;
        case "tag":
            p[turn].tag(plan[n].obj, plan[n].base);
            break;
        case "discard":
            p[turn].discard(plan[n].obj);
            control();
            return;
    }
    paint();
    setTimeout(process_task, paintspeed, plan, n + 1);
}

function process_furo(who, plan) {
    if (plan.action == "chow") state = "declarechow";
    else if (plan.action == "pung") state = "declarepung";
    turn = who;
    var t = trash.pop();
    p[turn].hand.push(t);
    paint();
    setTimeout(function () {
        p[turn].meld(plan.obj);
        state = "main";
        if (turn == human) clear_selection();
        paint();
        if (turn != human) setTimeout(control, paintspeed);
		else inquirebtn.style.visibility = "visible";
    }, paintspeed);
}

function clear_selection() {
    for (var i = 0; i < flag.length; i++) flag[i] = false;
    selectedset.length = 0;
}

function hand_clickedindex(x, y) {
    for (var i = p[human].hand.length - 1; i >= 0; i--) {
        var left = hand_pos[human].x + human_margin * i, top = hand_pos[human].y;
        if (flag[i]) top -= lift;
        if (left <= x && x <= left + card_width && top <= y && y <= top + ratio * card_width) return i;
    }
    return nil;
}

function trasharea_clicked(x, y) {
    return trash_pos.x <= x && x <= trash_pos.x + card_width && trash_pos.y <= y && y <= trash_pos.y + card_width * ratio;
}

function meldarea_clickedindex(x, y) {
    if (x < field_pos.x || field_pos.x + field_pos.w < x || y < field_pos.y || field_pos.y + field_pos.h < y) return null;
    for (var i = 0; i < 2; i++) {
        var st_x = arrange_pos[i].x, st_y = arrange_pos[i].y, st_h = card_width * ratio;
        for (var j = 0; j < arrange[i].length; j++) {
            st_x -= card_width + (field[arrange[i][j]].length - 1 / 2) * arrange[i].slide;
            var st_w = (field[arrange[i][j]].length - 1) * arrange[i].slide + card_width;
            if (st_x <= x && x <= st_x + st_w && st_y <= y && y <= st_y + st_h) return { col: i, row: j };
        }
    }
    return { col: nil, row: nil };
}

function show_configdiv() {
    configdiv.style.left = canvas.offsetLeft + "px";
    configdiv.style.top = canvas.offsetTop + "px";
    startdiv.style.visibility = "hidden";
    configdiv.style.visibility = "visible";
}

function chowbtn_clicked() {
    furodiv.style.visibility = "hidden";
    var i = turn;
    while ((i = (i + 1) % p.length) != turn) {
        if (i == human) continue;
        if (remark[i].action == "pung") break;
    }
    if (i != turn) process_furo(i, remark[i]);
    else {
        var t = p[human].chowcomponents(trash[trash.length - 1]);
        if (t.length == 1 && t[0].length == 3) process_furo(human, { action: "chow", obj: t[0] });
        else {
            state = "chowselect";
            paint();
        }
    }
}

function pungbtn_clicked() {
    furodiv.style.visibility = "hidden";
    var t = p[human].pungcomponents(trash[trash.length - 1]);
    if (t.length == 3) process_furo(human, { action: "pung", obj: t });
    else {
        state = "pungselect";
        paint();
    }
}

function throughbtn_clicked() {
    furodiv.style.visibility = "hidden";
    var i = turn;
    while ((i = (i + 1) % p.length) != turn) {
        if (i == human) continue;
        if (remark[i].action == "pung") break;
    }
    if (i != turn) process_furo(i, remark[i]);
    else if (remark[(turn + 1) % p.length].action == "chow") process_furo((turn + 1) % p.length, remark[(turn + 1) % p.length]);
    else {
        move_on();
        paint();
        setTimeout(control, paintspeed);
    }
}

function set_speed() {
    paintspeed = parseInt(speedrange.value);
}

function create_cardname(n) {
    var spn = document.createElement("span");
    if (isjoker(n)) spn.appendChild(document.createTextNode("JOKER "));
    else {
        if (suitof(n) == heart || suitof(n) == diamond) spn.style.color = "red";
        spn.style.fontSize = "32px";
        spn.appendChild(document.createTextNode(mark[suitof(n)] + num_name[numof(n)] + " "));
    }
	return spn;
}

function inquirebtn_clicked() {
    opinionboard.style.visibility = "visible";
    while (opinion.hasChildNodes()) opinion.removeChild(opinion.firstChild);
    var result = decision_making(human);
    for (var i = 0; i < result.length; i++) {
        switch (result[i].action) {
            case "meld":
                opinion.appendChild(document.createTextNode("メルド："));
                for (var j = 0; j < result[i].obj.length; j++) opinion.appendChild(create_cardname(result[i].obj[j]));
                break;
            case "tag":
                opinion.appendChild(document.createTextNode("付け札："));
                for (var j = 0; j < result[i].obj.length; j++) opinion.appendChild(create_cardname(result[i].obj[j]));
				opinion.appendChild(document.createTextNode(" on "));
                for (var j = 0; j < result[i].base.length; j++) opinion.appendChild(create_cardname(result[i].base[j]));
                break;
            case "discard":
                opinion.appendChild(document.createTextNode("捨て札："));
                opinion.appendChild(create_cardname(result[i].obj));
                break;
        }
        opinion.appendChild(document.createElement("br"));
    }
}
