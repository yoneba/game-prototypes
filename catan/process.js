let catan;
let state;
let process;
let timeout = 1000;

window.onload = game_start;

function game_start() {
    catan = new Catan;
    random_shuffle(player_color);
    initialize_field_component();
    initialize_player_component();
    let dd = dicediv.getElementsByTagName("svg");
    dd[0].replaceChild(create_dice(rand(6) + 1, "red", "gold"), dd[0].firstChild);
    dd[1].replaceChild(create_dice(rand(6) + 1, "gold", "red"), dd[1].firstChild);
    reset_guide();
    endbtn.style.visibility = "hidden";
    radiodiv.style.visibility = "hidden";
    longesttitle.style.display = "none";
    largesttitle.style.display = "none";
    standbyphase();
}

function standbyphase() {
    let pd = document.getElementsByClassName("playerdiv");
    pd[catan.turn].style.margin = "3px";
    pd[catan.turn].style.border = "crimson solid 3px";
    if (catan.history.length < 8) mainphase();
    else if (catan.turn != human) {
        let plan = think_standby(catan);
        process = setTimeout(process_task, timeout, plan);
    }
    else {
        radiodiv.style.visibility = "visible";
        let r = document.getElementsByName("action");
        for (let i = 0; i < r.length; i++) {
            r[i].disabled = false;
            r[i].checked = false;
        }
        radioelement("action", "trade").disabled = true;
        radioelement("action", "negotiation").disabled = true;
        radioelement("action", "knight").parentNode.style.display = catan.player[catan.turn].development.unused[knight] > 0 ? "inline" : "none";
        radioelement("action", "roadbuilding").parentNode.style.display = catan.player[catan.turn].development.unused[roadbuilding] > 0 ? "inline" : "none";
        radioelement("action", "discovery").parentNode.style.display = catan.player[catan.turn].development.unused[discovery] > 0 ? "inline" : "none";
        radioelement("action", "monopoly").parentNode.style.display = catan.player[catan.turn].development.unused[monopoly] > 0 ? "inline" : "none";
    }
}

function mainphase() {
    if (catan.turn != human) {
        if (catan.history.length < 8) {
            let plan = think_initialposition(catan);
            setTimeout(process_task, timeout, plan);
        }
        else {
            let plan = think_main(catan);
            setTimeout(process_task, timeout, plan);
        }
    }
    else {
        if (catan.history.length < 8) show_guide("settlement");
        else {
            endbtn.style.visibility = "visible";
            radioelement("action", "trade").disabled = false;
            radioelement("action", "negotiation").disabled = false;
            reset_guide();
        }
    }
}

function burstphase() {
    for (let p = 0; p < catan.player.length; p++) {
        if (p != human && catan.player[p].handnum() > 7) {
            let trash = think_burst(catan);
            transact_burst(p, trash);
        }
    }
    if (catan.player[human].handnum() > 7) show_guide("burst");
    else deprivationphase();
}

function deprivationphase() {
    if (catan.turn != human) mainphase();
    else show_guide("deprivation");
}

function refresh() {
    let pd = document.getElementsByClassName("playerdiv");
    let nd = document.querySelectorAll(".playerdiv span");
    for (let i = 0; i < catan.player.length; i++) nd[i].replaceChild(document.createTextNode(catan.player[i].handnum()), nd[i].firstChild);
    let hd = pd[human].getElementsByTagName("span");
    for (let i = 0; i < hd.length; i++) hd[i].replaceChild(document.createTextNode(catan.player[human].hand[i]), hd[i].firstChild);
    if (catan.longest !== null) {
        pd[catan.longest].querySelector(".medal").appendChild(longesttitle);
        longesttitle.style.display = "block";
    }
    else longesttitle.style.display = "none";
    if (catan.largest !== null) {
        pd[catan.largest].querySelector(".medal").appendChild(largesttitle);
        largesttitle.style.display = "block";
    }
    else largesttitle.style.display = "none";
    for (let p = 0; p < catan.player.length; p++) {
        let tdd = pd[p].getElementsByTagName("td"), k = catan.player[p].development.used.length;
        if (p != human) {
            tdd[0] = catan.player[p].development.unused.reduce((x, y) => x + y);
            for (let i = 0; i < k; i++) tdd[i + 1].replaceChild(document.createTextNode(catan.player[p].development.used[i]), tdd[i + 1].firstChild);
        }
        else {
            for (let i = 0; i < k; i++) tdd[i].replaceChild(document.createTextNode(catan.player[p].development.unused[i]), tdd[i].firstChild);
            for (let i = 0; i < k; i++) tdd[i + k].replaceChild(document.createTextNode(catan.player[p].development.used[i]), tdd[i + k].firstChild);
        }
    }
}

function transact_dice() {
    let eyes = catan.action_dice(), dd = dicediv.getElementsByTagName("svg");
    dd[0].replaceChild(create_dice(eyes[0], "red", "gold"), dd[0].firstChild);
    dd[1].replaceChild(create_dice(eyes[1], "gold", "red"), dd[1].firstChild);
    if (eyes[0] + eyes[1] == 7) burstphase();
    else {
        refresh();
        mainphase();
    }
}

function transact_end() {
    let pd = document.getElementsByClassName("playerdiv");
    pd[catan.turn].style.margin = "5px";
    pd[catan.turn].style.border = "black solid 1px";
    catan.action_end();
    standbyphase();
}

function transact_burst(p, trash) {
    if (catan.action_burst(p, trash)) {
        refresh();
        return true;
    }
    return false;
}

function transact_road(e) {
    if (catan.action_road(catan.turn, e)) {
        edge_component[e].setAttribute("stroke", player_color[catan.turn]);
        edge_component[e].setAttribute("stroke-width", 6);
        refresh();
        return true;
    }
    return false;
}

function transact_settlement(v) {
    if (catan.action_settlement(catan.turn, v)) {
        let i = Math.floor(v / vsize), j = Math.floor(v % vsize / 2);
        let r = default_radius, w = r * Math.sqrt(3), x = w * (j + (i - 4.6 + (v % vsize & 1)) / 2), y = r * (3 * i - 1.4 + (v % vsize & 1)) / 2;
        let hull = "";
        hull += `${x - r / 6},${y + r / 4} ${x - r / 6},${y + r / 12}`;
        hull += ` ${x - r / 3.2},${y + r / 12} ${x},${y - r / 4} ${x + r / 3.2},${y + r / 12} `;
        hull += `${x + r / 6},${y + r / 12} ${x + r / 6},${y + r / 4}`;
        vertex_component[v].setAttribute("points", hull);
        vertex_component[v].setAttribute("fill", player_color[catan.turn]);
        refresh();
        return true;
    }
    return false;
}

function transact_city(v) {
    if (catan.action_city(catan.turn, v)) {
        let i = Math.floor(v / vsize), j = Math.floor(v % vsize / 2);
        let r = default_radius, w = r * Math.sqrt(3), x = w * (j + (i - 4.6 + (v % vsize & 1)) / 2), y = r * (3 * i - 1.4 + (v % vsize & 1)) / 2;
        let hull = "";
        hull += `${x - r / 3},${y + r / 4}`;
        hull += ` ${x - r / 3},${y - r / 7} ${x - r / 8},${y - r / 3} ${x + r / 12},${y - r / 7} `;
        hull += `${x + r / 12},${y} ${x + r / 3},${y} ${x + r / 3},${y + r / 4}`;
        vertex_component[v].setAttribute("points", hull);
        refresh();
        return true;
    }
    return false;
}

function transact_development() {
    if (catan.action_development(catan.turn)) {
        let heapremain = heapdiv.querySelector("span");
        heapremain.replaceChild(document.createTextNode(catan.developmentheap.length), heapremain.firstChild);
        refresh();
        return true;
    }
    return false;
}

function transact_trade(exp, imp) {
    if (catan.action_trade(catan.turn, exp, imp)) {
        refresh();
        return true;
    }
    return false;
}

function transact_barter(q, give, take) {
    if (catan.action_barter(catan.turn, q, give, take)) {
        refresh();
        return true;
    }
    return false;
}

function transact_deprivation(f, q) {
    catan.action_deprivation(catan.turn, f, q);
    face_component[f].appendChild(robber_component);
    refresh();
    mainphase();
}

function transact_knight(f, q) {
    if (catan.action_knight(catan.turn, f, q)) {
        face_component[f].appendChild(robber_component);
        refresh();
        return true;
    }
    return false;
}

function transact_roadbuilding(e1, e2) {
    if (catan.action_roadbuilding(catan.turn, e1, e2)) {
        if (e1 != -1) {
            edge_component[e1].setAttribute("stroke", player_color[catan.turn]);
            edge_component[e1].setAttribute("stroke-width", 6);
        }
        if (e2 != -1) {
            edge_component[e2].setAttribute("stroke", player_color[catan.turn]);
            edge_component[e2].setAttribute("stroke-width", 6);
        }
        refresh();
        return true;
    }
    return false;
}

function transact_discovery(r1, r2) {
    if (catan.action_discovery(catan.turn, r1, r2)) {
        refresh();
        return true;
    }
    return false;
}

function transact_monopoly(r) {
    if (catan.action_monopoly(catan.turn, r)) {
        refresh();
        return true;
    }
    return false;
}

function process_task(plan) {
    this[`transact_${plan[0].action}`](...plan[0].args);
    if (plan.length > 1) {
        plan.shift();
        process = setTimeout(process_task, timeout, plan);
    }
    else if (plan[0].action != "dice" && plan[0].action != "end") mainphase();
}
