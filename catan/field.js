const tsize = 7, vsize = tsize * 2;
const lumber = 0, brick = 1, wool = 2, grain = 3, ore = 4, barren = 5;

const valid_face = [10, 11, 12, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30, 31, 32, 36, 37, 38];
const valid_edge = [31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 62,
    67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 83, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97,
    98, 99, 100, 101, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 129, 130, 132, 133, 135, 136];
const valid_vertex = [21, 22, 23, 24, 25, 26, 27, 33, 34, 35, 36, 37, 38, 39, 40, 41,
    45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 58, 59, 60, 61, 62, 63, 64, 65, 66,
    67, 68, 72, 73, 74, 75, 76, 77, 78, 79, 80, 86, 87, 88, 89, 90, 91, 92];

function Field() {
    this.coast = [lumber, brick, wool, grain, ore, barren];
    random_shuffle(this.coast);
    this.face = initialize_face();
    this.edge = initialize_edge();
    this.vertex = initialize_vertex(this.coast);
}

Field.prototype.measure = function (p, e) {
    return 1 + this.distance(p, ...endpoints(e), (p, v) =>this.distance(p, v, null, () =>0));
};

Field.prototype.distance = function (p, v, w, sequel) {
    let dist = 0;
    if (!("owner" in this.vertex[v]) || this.vertex[v].owner == p) {
        let adj = adjacent(v), inc = incident(v);
        for (let i = 0; i < 3; i++) {
            if (this.edge[inc[i]] != p) continue;
            this.edge[inc[i]] = null;
            let d = 1 + this.distance(p, adj[i], w, sequel);
            if (d > dist) dist = d;
            this.edge[inc[i]] = p;
        }
    }
    if (dist == 0) return sequel(p, w);
    return dist;
};

function initialize_face() {
    let face = new Array(tsize * tsize), connect = new Array(tsize * tsize), waiting = [4, 3, 4, 4, 3, 1];
    const neighbor = [-1, -tsize, -tsize + 1, 1, tsize, tsize - 1], corner = [38, 36, 22, 10, 12, 26];
    function prevent_connection(f, org) {
        let allow = [true, true, true, true, true, true];
        let adjoin = [f + neighbor[org % 6], f + neighbor[(org + 1) % 6], f + neighbor[(org + 2) % 6]];
        for(let i of adjoin) {
            if (!face[i]) continue;
            if (face[i].resource == brick || face[i].resource == ore) {
                if (connect[i] >= 2) allow[face[i].resource] = false;
            }
            else {
                if (connect[i] >= 3) allow[face[i].resource] = false;
            }
        }
        if (face[adjoin[0]] && face[adjoin[2]] && face[adjoin[0]].resource == face[adjoin[2]].resource) {
            let r = face[adjoin[0]].resource;
            if (r == brick || r == ore || connect[adjoin[0]] + connect[adjoin[2]] >= 3) allow[r] = false;
        }
        if (face[adjoin[1]]) {
            let r = face[adjoin[1]].resource;
            if (face[adjoin[0]] && face[adjoin[0]].resource == r || face[adjoin[2]] && face[adjoin[2]].resource == r) allow[r] = false;
        }
        return allow;
    }
    function update_connection(f, org) {
        let adjoin = [f + neighbor[org % 6], f + neighbor[(org + 1) % 6], f + neighbor[(org + 2) % 6]];
        let r = face[f].resource;
        if (face[adjoin[0]] && face[adjoin[0]].resource == r && face[adjoin[2]] && face[adjoin[2]].resource == r) {
            connect[f] = 1 + connect[adjoin[0]] + connect[adjoin[2]];
            connect[adjoin[0]] = connect[adjoin[2]] = connect[f];
        }
        else {
            connect[f] = 1;
            for(let i of adjoin) {
                if (!face[i] || face[i].resource != r) continue;
                ++connect[i];
                for(let j of neighbor) if (face[i + j] && face[i + j].resource == r) connect[i + j] = connect[i];
            }
        }
    }
    for(let i of valid_face) {
        if (corner.includes(i)) continue;
        let r = random_pick(waiting, prevent_connection(i, 0));
        --waiting[r];
        face[i] = { resource: r };
        update_connection(i, 0);
    }
    function random_spot(r) {
        let accept = [];
        for (let i = 0; i < corner.length; i++) {
            if (face[corner[i]]) continue;
            if (prevent_connection(corner[i], i)[r]) accept.push(i);
        }
        return accept[rand(accept.length)];
    }
    for (let r = 0; r < waiting.length; r++) {
        if (waiting[r] == 2) {
            let a = random_spot(r);
            --waiting[r];
            face[corner[a]] = { resource: r };
            update_connection(corner[a], a);
        }
    }
    while (true) {
        let v = Infinity, p = {};
        for (let i = 0; i < corner.length; i++) {
            if (face[corner[i]]) continue;
            let allow = prevent_connection(corner[i], i), s = 0;
            for (let r = 0; r < waiting.length; r++) if (waiting[r] && allow[r])++s;
            if (s < v) {
                v = s;
                p.type = "place", p.index = i;
            }
        }
        if (v == Infinity) break;
        for (let r = 0; r < waiting.length; r++) {
            if (!waiting[r]) continue;
            let s = 0;
            for (let i = 0; i < corner.length; i++) {
                if (face[corner[i]]) continue;
                if (prevent_connection(corner[i], i)[r])++s;
            }
            if (s < v) {
                v = s;
                p.type = "resource", p.index = r;
            }
        }
        if (p.type == "place") {
            let r = random_pick(waiting, prevent_connection(corner[p.index], p.index));
            --waiting[r];
            face[corner[p.index]] = { resource: r };
        }
        else {
            let a = random_spot(p.index);
            --waiting[p.index];
            face[corner[a]] = { resource: p.index };
        }
    }

    let gentle = [4, 10, 3, 11, 2];
    face[valid_face.find(f => face[f].resource == barren)].dice = 1;
    function random_place(n) {
        let c = [];
        for(let i of valid_face) {
            if ("dice" in face[i]) continue;
            let fine = true;
            for (let k = 0; k < neighbor.length; k++) {
                let j = i + neighbor[k];
                if (!face[j] || !("dice" in face[j])) continue;
                if (face[j].dice == n) fine = false;
                if ((n == 6 || n == 8) && (face[j].dice == 6 || face[j].dice == 8)) fine = false;
                if ((n == 5 || n == 9) && (face[j].dice == 5 || face[j].dice == 9)) {
                    let t = face[i + neighbor[(k + 1) % neighbor.length]];
                    if (t && (t.dice == 6 || t.dice == 8)) fine = false;
                    t = face[i + neighbor[(k + neighbor.length - 1) % neighbor.length]];
                    if (t && (t.dice == 6 || t.dice == 8)) fine = false;
                }
            }
            if (fine) c.push(i);
        }
        return c[rand(c.length)];
    }
    face[random_place(6)].dice = 6, face[random_place(6)].dice = 6;
    face[random_place(8)].dice = 8, face[random_place(8)].dice = 8;
    face[random_place(5)].dice = 5, face[random_place(5)].dice = 5;
    face[random_place(9)].dice = 9, face[random_place(9)].dice = 9;
    while (gentle.length > 0) {
        let v = -1, p;
        for(let i of valid_face) {
            if ("dice" in face[i]) continue;
            let s = 0;
            for(let j of neighbor) if (face[i + j] && !("dice" in face[i + j]))++s;
            if (s > v) {
                v = s;
                p = i;
            }
        }
        let a = rand(gentle.length);
        face[p].dice = gentle[a];
        face[random_place(gentle[a])].dice = gentle[a] != 2 ? gentle[a] : 12;
        gentle.splice(a, 1);
    }
    return face;
}

function initialize_edge() {
    let edge = new Array(3 * tsize * tsize);
    for(let e of valid_edge) edge[e] = null;
    return edge;
}

function initialize_vertex(coast) {
    const shore = [[21, 22, 23, 24, 25], [26, 27, 40, 41, 54], [55, 68, 67, 80, 79], [92, 91, 90, 89, 88], [87, 86, 73, 72, 59], [58, 45, 46, 33, 34]];
    let vertex = new Array(2 * tsize * tsize);
    for(let v of valid_vertex) vertex[v] = {};
    for (let i = 0; i < coast.length; i++) {
        if (coast[i] == lumber || coast[i] == ore || coast[i] == barren) {
            vertex[shore[i][2]].port = vertex[shore[i][3]].port = coast[i];
        }
        else {
            vertex[shore[i][0]].port = vertex[shore[i][1]].port = barren;
            vertex[shore[i][3]].port = vertex[shore[i][4]].port = coast[i];
        }
    }
    return vertex;
}

function periphery(f) {
    return [f * 2 + 1, f * 2 + 2, f * 2 + 3, f * 2 + vsize, f * 2 + vsize + 1, f * 2 + vsize + 2];
}

function vicnity(v) {
    if (v & 1) return [(v - 1) / 2 - 1, (v - 1) / 2, (v - 1) / 2 - tsize];
    return [v / 2 - tsize - 1, v / 2 - tsize, v / 2 - 1];
}

function adjacent(v) {
    return [v - 1, v + 1, v & 1 ? v + vsize - 1 : v - vsize + 1];
}

function incident(v) {
    if (v & 1) return [(v - 1) * 3 / 2, (v - 1) * 3 / 2 + 1, (v - 1) * 3 / 2 + 2];
    return [(v - 2) * 3 / 2 + 1, v * 3 / 2, (v - vsize) * 3 / 2 + 2];
}

function endpoints(e) {
    let r = e % 3, q = (e - r) / 3;
    if (r == 0) return [q * 2 + 1, q * 2];
    if (r == 1) return [q * 2 + 1, q * 2 + 2];
    if (r == 2) return [q * 2 + 1, q * 2 + vsize];
}

function rand(n) {
    return Math.floor(Math.random() * n);
}

function random_pick(arr, allow) {
    let s = rand(arr.reduce((x, y, i) =>!allow || allow[i] ? x + y : x, 0));
    return arr.findIndex((x, i) =>(!allow || allow[i]) && (s -= x) < 0);
}

function random_shuffle(arr) {
    for (let i = arr.length; i > 1; i--) {
        let a = rand(i), tmp = arr[a];
        arr[a] = arr[i - 1];
        arr[i - 1] = tmp;
    }
}
