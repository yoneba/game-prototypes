function configuration_wizard() {
    substitute_wizard(configuration);
    let n = Array.from(configuration.querySelectorAll("input[type='checkbox']")).reduce((prev, x) => prev += x.checked, 0);
    let sr = selectroles(n), r = configuration.getElementsByClassName("roletext");
    for (let i = 0; i < n; i++)write_role(r[i], sr[i]);
    for (let i = n; i < r.length; i++)overwrite(r[i], "");
}

function entry_wizard() {
    substitute_wizard(entry);
    overwrite(entry.querySelector("h3"), werewolf.lapse + "日目" + werewolf.phase);
    overwrite(entry.querySelector(".nametext"), werewolf.player[werewolf.turn].name);
}

function night_wizard(p) {
    substitute_wizard(action);
    action_wizard(p);
    if (p.role == "占い師" || p.role == "パパラッチ") overwrite(actionguide, "占うプレイヤーを選択");
    else if (p.role == "マジシャン") overwrite(actionguide, "役職を奪うプレイヤーを選択");
    else if (werewolf.lapse == 0) overwrite(actionguide, "怪しいと思うプレイヤーを選択");
    else if (p.role == "人狼") {
        overwrite(actionguide, "襲撃したいプレイヤーを選択");
        wolf.style.display = "block";
        Array.from(document.getElementsByName("confidence")).forEach(x => x.checked = false);
    }
    else if (p.role == "騎士" || p.role == "コスプレイヤー") overwrite(actionguide, "人狼の襲撃から守るプレイヤーを選択");
    else if (p.role == "偉大な霊媒師") {
        overwrite(actionguide, "アクションとその対象を選択");
        greatnecromancer.style.display = "block";
        document.getElementsByName("moveoption")[0].checked = true;
    }
    else {
        overwrite(actionguide, "怪しいと思うプレイヤーを選択");
        if (p.role == "ボマー") {
            bomber.style.display = "block";
            bomber.querySelector("input[type='checkbox']").checked = false;
            bomber.querySelector("input[type='checkbox']").disabled = "bomb" in werewolf.player[werewolf.turn];
        }
    }
}

function dawn_wizard(victim, suspect) {
    substitute_wizard(dawn);
    if (victim.length == 0) {
        deaddiv.style.display = "none";
        survivediv.style.display = "block";
    }
    else {
        deaddiv.style.display = "block";
        survivediv.style.display = "none";
        let killed = deaddiv.querySelector("span");
        overwrite(killed, victim[0].name + "さん");
        for (let i = 1; i < victim.length; i++)killed.appendChild(document.createTextNode("," + victim[i].name + "さん"));
    }
    if (victim.includes(suspect) || suspect.vote.length <= 1) {
        suspectdiv.style.display = "none";
        nosuspectdiv.style.display = "block";
    }
    else {
        suspectdiv.style.display = "block";
        nosuspectdiv.style.display = "none";
        overwrite(suspectdiv.querySelector(".nametext"), suspect.name);
    }
}

function daytime_wizard(p) {
    substitute_wizard(action);
    action_wizard(p);
    overwrite(actionguide, "処刑したいプレイヤーを選択");
}

function banish_wizard(sacrifice) {
    substitute_wizard(banish);
    overwrite(banish.querySelector(".nametext"), sacrifice.name);
}

function result_wizard(victor) {
    substitute_wizard(result);
    write_role(result.querySelector("h2 .roletext"), victor);
}

function substitute_wizard(node) {
    for (let w of Array.from(document.querySelectorAll("body > div"))) w.style.display = "none";
    node.style.display = "block";
}

function action_wizard(p) {
    write_role(action.querySelector("h2 .roletext"), p.role);
    write_role(personality.getElementsByClassName("roletext")[0], p.team());
    write_role(personality.getElementsByClassName("roletext")[1], p.aim());
    let r = document.getElementsByName("target");
    for (let i = 0; i < werewolf.player.length; i++) {
        r[i].checked = false;
        r[i].disabled = !werewolf.player[i].alive;
        r[i].parentNode.style.display = "block";
    }
    r[werewolf.turn].parentNode.style.display = "none";
    Array.from(action.querySelectorAll(".playerlist .roletext")).forEach(rl => overwrite(rl, ""));
    if (p.role == "人狼" || p.role == "メンタリスト") clairvoyance(q => q.role == "人狼", q => q.role);
    if (p.role == "霊媒師" || p.role == "偉大な霊媒師") clairvoyance(q => !q.alive, q => q.appearance());
    if (p.role == "共有者") clairvoyance(q => q.role == "共有者", q => q.role);
    psychokiller.style.display = p.role == "サイコキラー" ? "block" : "none";
    cosplayer.style.display = p.role == "コスプレイヤー" ? "block" : "none";
    greatnecromancer.style.display = "none";
    wolf.style.display = "none";
    bomber.style.display = "none";
}

function clairvoyance(filter, func) {
    let rl = action.querySelectorAll(".playerlist .roletext");
    for (let i = 0; i < werewolf.player.length; i++)if (filter(werewolf.player[i])) write_role(rl[i], func(werewolf.player[i]));
}

function overwrite(node, text) {
    while (node.hasChildNodes()) node.removeChild(node.firstChild);
    node.appendChild(document.createTextNode(text));
}

function write_role(node, role) {
    const color = {
        "人狼": "red", "市民": "orange", "占い師": "blue", "霊媒師": "purple", "騎士": "green", "狂人": "crimson", "共有者": "gold",
        "吸血鬼": "indigo", "妖狐": "lime", "サイコキラー": "maroon", "偉大な霊媒師": "darkmagenta", "コスプレイヤー": "darkgreen",
        "パパラッチ": "chocolate", "マジシャン": "magenta", "ボマー": "dimgray", "メンタリスト": "salmon",
    };
    overwrite(node, role);
    node.style.color = color[role];
}
