const svgns = "http://www.w3.org/2000/svg";
const default_radius = 45;
const human = 3;
const resource_name = ["木", "泥", "羊", "麦", "鉄", "荒"];
const resource_color = ["forestgreen", "sienna", "yellowgreen", "orange", "mediumpurple", "tan"];
const port_name = ["木", "泥", "羊", "麦", "鉄", "３"];
const port_color = ["darkgreen", "sienna", "lawngreen", "orange", "darkviolet", "pink"];
let player_color = ["red", "blue", "orangered", "white"];
let face_component = new Array(tsize * tsize);
let vertex_component = new Array(2 * tsize * tsize);
let edge_component = new Array(3 * tsize * tsize);
let robber_component;

function initialize_player_component() {
    let pd = document.getElementsByClassName("playerdiv"), sd = document.querySelectorAll(".playerdiv .symbol");
    let sd1 = negotiationconfirmdiv.getElementsByClassName("symbol"), sd2 = deprivationdiv.getElementsByClassName("symbol");
    for (let p = 0; p < catan.player.length; p++) {
        pd[p].style.margin = "5px";
        pd[p].style.border = "black solid 1px";
        sd[p].style.backgroundColor = player_color[p];
        if (p != human) {
            sd1[p].style.backgroundColor = player_color[p];
            sd2[p].style.backgroundColor = player_color[p];
        }
    }
    let hd = pd[human].getElementsByClassName("resourcecard");
    for (let i = 0; i < hd.length; i++) hd[i].style.backgroundColor = resource_color[i];
}

function initialize_field_component() {
    const r = default_radius, w = r * Math.sqrt(3);
    while (field.hasChildNodes()) field.removeChild(field.firstChild);
    let sea = create_hex(w * 3.2, r * 4.8, w * 3.2, 0);
    sea.setAttribute("fill", "dodgerblue");
    field.appendChild(sea);
    for (let i = 0; i < catan.coast.length; i++) field.appendChild(create_port(w * 3.2, r * 4.8, r, w, 60 * i, catan.coast[i]));
    for (let i = 0; i < tsize; i++) {
        for (let j = 0; j < tsize; j++) {
            let k = i * tsize + j, x = w * (j + (i - 3.6) / 2), y = r * (1.5 * i - 0.2);
            if (catan.face[k]) {
                face_component[k] = create_face_component(x, y, r, w, catan.face[k].resource, catan.face[k].dice);
                field.appendChild(face_component[k]);
            }
            if (catan.edge[3 * k] !== undefined) {
                edge_component[3 * k] = create_edge_component(x, y, x - w / 2, y - r / 2);
                field.appendChild(edge_component[3 * k]);
            }
            if (catan.edge[3 * k + 1] !== undefined) {
                edge_component[3 * k + 1] = create_edge_component(x, y, x + w / 2, y - r / 2);
                field.appendChild(edge_component[3 * k + 1]);
            }
            if (catan.edge[3 * k + 2] !== undefined) {
                edge_component[3 * k + 2] = create_edge_component(x, y, x, y + r);
                field.appendChild(edge_component[3 * k + 2]);
            }
            if (catan.vertex[2 * k]) {
                vertex_component[2 * k] = create_vertex_component(x - w / 2, y - r / 2, r * 0.34);
                field.appendChild(vertex_component[2 * k]);
            }
            if (catan.vertex[2 * k + 1]) {
                vertex_component[2 * k + 1] = create_vertex_component(x, y, r * 0.34);
                field.appendChild(vertex_component[2 * k + 1]);
            }
        }
    }
    robber_component = create_robber_component(w);
}

function create_face_component(x, y, r, w, resource, dice) {
    let fc = document.createElementNS(svgns, "g");
    let tile = create_hex(0, 0, r, Math.PI / 6);
    fc.setAttribute("transform", `translate(${x + w / 2} ${y + r / 2})`);
    tile.setAttribute("fill", resource_color[resource]);
    tile.setAttribute("stroke", "black");
    fc.appendChild(tile);
    if (resource != barren) {
        let cr = document.createElementNS(svgns, "circle");
        let size = r * (4 / (6 + Math.abs(dice - 7)));
        let dc = create_text(0, size * 0.32, dice, size, "middle");
        cr.setAttribute("cx", 0), cr.setAttribute("cy", 0), cr.setAttribute("r", r * 0.32);
        cr.setAttribute("fill", "peachpuff");
        cr.setAttribute("stroke", "black");
        if (dice == 6 || dice == 8) dc.setAttribute("fill", "red");
        //dc.setAttribute("dominant-baseline", "middle");
        fc.appendChild(cr), fc.appendChild(dc);
    }
    fc.onclick = face_clicked;
    return fc;
}

function create_edge_component(x1, y1, x2, y2) {
    let ec = document.createElementNS(svgns, "line");
    ec.setAttribute("x1", x1), ec.setAttribute("y1", y1), ec.setAttribute("x2", x2), ec.setAttribute("y2", y2);
    ec.setAttribute("stroke", "transparent");
    ec.setAttribute("stroke-width", 15);
    ec.onclick = edge_clicked;
    return ec;
}

function create_vertex_component(x, y, h) {
    let vc = document.createElementNS(svgns, "polygon");
    vc.setAttribute("points", `${x - h / 2},${y - h / 2} ${x - h / 2},${y + h / 2} ${x + h / 2},${y + h / 2} ${x + h / 2},${y - h / 2}`);
    vc.setAttribute("fill", "transparent");
    vc.onclick = vertex_clicked;
    return vc;
}

function create_hex(x, y, r, tilt) {
    let hex = document.createElementNS(svgns, "polygon");
    let hull = "";
    for (let i = 0; i < 6; i++) hull += `${x + r * Math.cos(i * Math.PI / 3 + tilt)},${y + r * Math.sin(i * Math.PI / 3 + tilt)} `;
    hex.setAttribute("points", hull);
    return hex;
}

function create_port(x, y, r, w, rot, kind) {
    let shore = document.createElementNS(svgns, "g");
    shore.setAttribute("transform", `rotate(${rot} ${x} ${y})`);
    shore.setAttribute("stroke", "black");
    if (kind == lumber || kind == ore || kind == barren) {
        let wharf = create_wharf(x, y - r * 3, r, w, kind);
        wharf.setAttribute("transform", `rotate(-30 ${x} ${y - r * 3})`);
        shore.appendChild(wharf);
    }
    else {
        let wharf1 = create_wharf(x - w, y - r * 3, r, w, barren), wharf2 = create_wharf(x, y - r * 3, r, w, kind);
        wharf1.setAttribute("transform", `rotate(-30 ${x - w} ${y - r * 3})`);
        wharf2.setAttribute("transform", `rotate(30 ${x} ${y - r * 3})`);
        shore.appendChild(wharf1), shore.appendChild(wharf2);
    }
    return shore;
}

function create_wharf(x, y, r, w, kind) {
    let wharf = document.createElementNS(svgns, "g");
    let p1 = document.createElementNS(svgns, "line"), p2 = document.createElementNS(svgns, "line");
    let trade = create_text(x, y - w * 3 / 4, port_name[kind], r * 0.5, "middle");
    p1.setAttribute("x1", x - r / 2), p1.setAttribute("y1", y - w / 2), p1.setAttribute("x2", x - r / 4), p1.setAttribute("y2", y - w * 3 / 4);
    p2.setAttribute("x1", x + r / 2), p2.setAttribute("y1", y - w / 2), p2.setAttribute("x2", x + r / 4), p2.setAttribute("y2", y - w * 3 / 4);
    trade.setAttribute("fill", port_color[kind]);
    trade.setAttribute("stroke", "none");
    wharf.appendChild(p1), wharf.appendChild(p2), wharf.appendChild(trade);
    return wharf;
}

function create_robber_component(w) {
    let deactivate = document.createElementNS(svgns, "g");
    let l1 = document.createElementNS(svgns, "line"), l2 = document.createElementNS(svgns, "line");
    l1.setAttribute("x1", -w * 0.3), l1.setAttribute("y1", -w * 0.3), l1.setAttribute("x2", w * 0.3), l1.setAttribute("y2", w * 0.3);
    l1.setAttribute("stroke", "black");
    l1.setAttribute("stroke-width", 4);
    l2.setAttribute("x1", -w * 0.3), l2.setAttribute("y1", w * 0.3), l2.setAttribute("x2", w * 0.3), l2.setAttribute("y2", -w * 0.3);
    l2.setAttribute("stroke", "black");
    l2.setAttribute("stroke-width", 4);
    deactivate.appendChild(l1), deactivate.appendChild(l2);
    return deactivate;
}

function create_text(x, y, txt, size, anchor) {
    let tn = document.createElementNS(svgns, "text");
    tn.setAttribute("x", x), tn.setAttribute("y", y);
    tn.setAttribute("font-size", size);
    tn.setAttribute("text-anchor", anchor);
    tn.appendChild(document.createTextNode(txt));
    return tn;
}

function create_dice(n, bodycol, eyecol) {
    let dice = document.createElementNS(svgns, "g"), square = document.createElementNS(svgns, "rect");
    square.setAttribute("fill", bodycol);
    square.setAttribute("width", "100%"), square.setAttribute("height", "100%");
    square.setAttribute("rx", "10%"), square.setAttribute("ry", "10%");
    dice.appendChild(square);
    function append_eye(cx, cy, r) {
        let eye = document.createElementNS(svgns, "circle");
        eye.setAttribute("fill", eyecol);
        eye.setAttribute("cx", cx + "%"), eye.setAttribute("cy", cy + "%");
        eye.setAttribute("r", r + "%");
        dice.appendChild(eye);
    }
    if (n == 1) append_eye(50, 50, 16);
    else {
        append_eye(20, 20, 12);
        append_eye(80, 80, 12);
        if (n == 3 || n == 5) append_eye(50, 50, 12);
        if (n >= 4) {
            append_eye(80, 20, 12);
            append_eye(20, 80, 12);
        }
        if (n == 6) {
            append_eye(20, 50, 12);
            append_eye(80, 50, 12);
        }
    }
    return dice;
}

function face_clicked() {
    let f = face_component.indexOf(this);
    if (f != catan.robber && (state == "deprivation" || state == "knight")) {
        if (!deprivationdiv.temporary) {
            let r = create_robber_component(default_radius * Math.sqrt(3));
            for (let i = 0; i < r.childNodes.length; i++) r.childNodes[i].setAttribute("stroke-dasharray", "7 3");
            deprivationdiv.temporary = r;
        }
        face_component[f].appendChild(deprivationdiv.temporary);
        let g = document.getElementsByName("target");
        for (let i = 0; i < g.length; i++) {
            g[i].disabled = true;
            g[i].checked = false;
        }
        for(let v of periphery(f)) if (catan.vertex[v] && "owner" in catan.vertex[v] && catan.vertex[v].owner != human) g[catan.vertex[v].owner].disabled = false;
    }
}

function edge_clicked() {
    let e = edge_component.indexOf(this);
    if (state == "road") {
        if (transact_road(e)) {
            state = "free";
            reset_guide();
            process = setTimeout(transact_end, timeout);
        }
    }
    else if (state == "roadbuilding") {
        let i = roadbuildingdiv.temporary.indexOf(this);
        if (i >= 0) {
            roadbuildingdiv.temporary.splice(i, 1);
            this.setAttribute("stroke", "transparent");
            this.setAttribute("stroke-width", 15);
            this.removeAttribute("stroke-dasharray");
        }
        else if (roadbuildingdiv.temporary.length < 2 && roadbuildingdiv.temporary.length < catan.player[human].remaining("road")) {
            let end = roadbuildingdiv.temporary.length == 1 ? endpoints(edge_component.indexOf(roadbuildingdiv.temporary[0])) : null;
            if (catan.admissible(human, e) || end != null && (end.includes(endpoints(e)[0]) || end.includes(endpoints(e)[1]))) {
                roadbuildingdiv.temporary.push(this);
                this.setAttribute("stroke", player_color[human]);
                this.setAttribute("stroke-width", 6);
                this.setAttribute("stroke-dasharray", "7 3");
            }
        }
        show_guide("roadbuilding");
    }
    else if (endbtn.style.visibility == "visible") {
        transact_road(e);
    }
}

function vertex_clicked() {
    let v = vertex_component.indexOf(this);
    if (state == "settlement") {
        if (transact_settlement(v)) show_guide("road");
    }
    else if (endbtn.style.visibility == "visible") {
        if (catan.vertex[v].type == "settlement") transact_city(v);
        else transact_settlement(v);
    }
}

function reset_guide() {
    state = "free";
    if (deprivationdiv.temporary) deprivationdiv.temporary.parentNode.removeChild(deprivationdiv.temporary);
    deprivationdiv.temporary = null;
    if (roadbuildingdiv.temporary && roadbuildingdiv.temporary[0]) {
        roadbuildingdiv.temporary[0].setAttribute("stroke", "transparent");
        roadbuildingdiv.temporary[0].setAttribute("stroke-width", 15);
        roadbuildingdiv.temporary[0].removeAttribute("stroke-dasharray");
    }
    if (roadbuildingdiv.temporary && roadbuildingdiv.temporary[1]) {
        roadbuildingdiv.temporary[1].setAttribute("stroke", "transparent");
        roadbuildingdiv.temporary[1].setAttribute("stroke-width", 15);
        roadbuildingdiv.temporary[1].removeAttribute("stroke-dasharray");
    }
    roadbuildingdiv.temporary = [];
    let g = document.querySelectorAll("#guidediv > div");
    for (let i = 0; i < g.length; i++) g[i].style.display = "none";
}

function show_guide(s) {
    let gd = document.getElementById((s != "knight" ? s : "deprivation") + "div"), btn = gd.querySelector("input[type='button']");
    switch (s) {
        case "trade":
            let r = radioindex("export");
            btn.disabled = r == -1 || catan.player[human].hand[r] < catan.exchange_rate(human, r);
            break;
        case "negotiation":
        case "burst":
            let give = Array.from(gd.getElementsByTagName("select")), take = give.splice(catan.player[human].hand.length);
            for (let i = 0; i < catan.player[human].hand.length; i++) {
                give[i].length = 0;
                for (let j = 0; j <= catan.player[human].hand[i]; j++) give[i][give[i].length++] = new Option(j);
            }
            if (s == "burst") break;
            for (let i = catan.player[human].hand.length; i < catan.player[human].hand.length * 2; i++) {
                take[i].length = 0;
                for (let j = 0; j < 5; j++) take[i][take[i].length++] = new Option(j);
            }
            btn.disabled = give.some((x, i) => x && take[i]) || give.every(x => !x) || take.every(x => !x);
            break;
        case "deprivation":
        case "knight":
            let victim = Array.from(document.getElementsByName("target"), x => !x.disabled);
            btn.disabled = victim.some(x => x) && radioindex("target") == -1;
            break;
        case "roadbuilding":
            break;
        case "discovery":
            btn.disabled = radioindex("discovery1") == -1 || radioindex("discovery2") == -1;
            break;
        case "monopoly":
            btn.disabled = radioindex("monopoly") == -1;
            break;
    }
    if (state != s) {
        reset_guide();
        state = s;
        gd.style.display = "block";
    }
}

function development_use() {
    show_guide("trade");
    radioelement("action", "trade").checked = true;
    radioelement("action", "knight").disabled = true, radioelement("action", "knight").checked = false;
    radioelement("action", "roadbuilding").disabled = true, radioelement("action", "roadbuilding").checked = false;
    radioelement("action", "discovery").disabled = true, radioelement("action", "discovery").checked = false;
    radioelement("action", "monopoly").disabled = true, radioelement("action", "monopoly").checked = false;
}

heapdiv.querySelector(".resourcecard").onclick = function () {
    if (endbtn.style.visibility == "visible") transact_development();
};

dicediv.onclick = function () {
    if (catan.turn == human && endbtn.style.visibility != "visible" && state != "burst" && state != "deprivation") transact_dice();
};

endbtn.onclick = function () {
    transact_end();
    this.style.visibility = "hidden";
    radiodiv.style.visibility = "hidden";
    reset_guide();
};

tradediv.querySelector("input[type='button']").onclick = function () {
    transact_trade(radioindex("export"), radioindex("import"));
};

negotiationdiv.querySelector("input[type='button']").onclick = function () {
    let give = Array.from(negotiationdiv.getElementsByTagName("select"), x => x.selectedIndex), take = give.splice(catan.player[human].hand.length);
    if (give.every((x, i) =>x <= catan.player[human].hand[i])) {
        let candidate = document.getElementsByName("client");
        for (let i = 0; i < candidate.length; i++) {
            candidate[i].disabled = i == human || !think_negotiation(catan, give, take, i);
            candidate[i].checked = false;
        }
        negotiationdiv.style.display = "none";
        negotiationconfirmdiv.style.display = "block";
    }
};

negotiationconfirmdiv.querySelector("input[type='button']").onclick = function () {
    if (radioindex("client") != -1) {
        let give = Array.from(negotiationdiv.getElementsByTagName("select"), x => x.selectedIndex), take = give.splice(catan.player[human].hand.length);
        transact_barter(radioindex("client"), give, take);
        show_guide("negotiation");
    }
};

burstdiv.querySelector("input[type='button']").onclick = function () {
    if (transact_burst(human, Array.from(burstdiv.getElementsByTagName("select"), x => x.selectedIndex))) {
        reset_guide();
        deprivationphase();
    }
};

deprivationdiv.querySelector("input[type='button']").onclick = function () {
    if (deprivationdiv.temporary && (radioindex("target") != -1 || Array.from(document.getElementsByName("target")).every(x => x.disabled))) {
        if (state == "deprivation") {
            transact_deprivation(face_component.indexOf(deprivationdiv.temporary.parentNode), radioindex("target"));
            reset_guide();
        }
        else {
            if (transact_knight(face_component.indexOf(deprivationdiv.temporary.parentNode), radioindex("target"))) development_use();
        }
    }
};

roadbuildingdiv.querySelector("input[type='button']").onclick = function () {
    if (roadbuildingdiv.temporary.length == 2 || roadbuildingdiv.temporary.length == catan.player[human].remaining("road")) {
        let e1 = edge_component.indexOf(roadbuildingdiv.temporary[0]), e2 = edge_component.indexOf(roadbuildingdiv.temporary[1]);
        if (transact_roadbuilding(e1, e2)) {
            if (e1 != -1) edge_component[e1].removeAttribute("stroke-dasharray");
            if (e2 != -1) edge_component[e2].removeAttribute("stroke-dasharray");
            roadbuildingdiv.temporary.length = 0;
            development_use();
        }
    }
};

discoverydiv.querySelector("input[type='button']").onclick = function () {
    if (radioindex("discovery1") != -1 && radioindex("discovery2") != -1) {
        if (transact_discovery(radioindex("discovery1"), radioindex("discovery2"))) development_use();
    }
};

monopolydiv.querySelector("input[type='button']").onclick = function () {
    if (radioindex("monopoly") != -1) {
        if (transact_monopoly(radioindex("monopoly"))) development_use();
    }
};

function radioindex(name) {
    return Array.from(document.getElementsByName(name)).findIndex(x => !x.disabled && x.checked);
}

function radioelement(name, value) {
    return Array.from(document.getElementsByName(name)).find(x => x.value == value);
}
