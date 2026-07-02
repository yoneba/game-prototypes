function think_main(catan) {
    return [{ action: "end", args: [] }];
}

function think_initialposition(catan) {
    for(let v of valid_vertex) {
        if (catan.stable(v)) {
            for(let e of incident(v)) {
                if (catan.edge[e] === null) return [{ action: "settlement", args: [v] }, { action: "road", args: [e] }, { action: "end", args: [] }];
            }
        }
    }
}

function think_burst(catan) {
    return [0, 0, 0, 0, 0];
}

function think_standby(catan) {
    return [{ action: "dice", args: [] }];
}

function think_negotiation(catan, give, take, q) {
    return false;
}
