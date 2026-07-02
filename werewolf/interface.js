window.onload = function () {
    let tgt = document.getElementsByName("target");
    for (let i = 0; i < tgt.length; i++) {
        tgt[i].onclick = function () {
            let role = werewolf.player[werewolf.turn].role;
            if (werewolf.phase == "夜" && (role == "占い師" || role == "パパラッチ")) {
                if (window.confirm(werewolf.player[i].name + "さんを占いますか？")) {
                    write_role(action.querySelectorAll(".playerlist .roletext")[i], werewolf.player[i].appearance());
                    Array.from(document.getElementsByName("target")).forEach(x => x.disabled = true);
                }
                else this.checked = false;
            }
        };
    }
    Array.from(configuration.querySelectorAll("input[type='checkbox']")).forEach(x => x.onchange = configuration_wizard);
    configuration_wizard();
};

configuration.querySelector(".mainbtn").onclick = function () {
    let chk = Array.from(configuration.querySelectorAll("input[type='checkbox']")), participants = [];
    for (let n of chk) if (n.checked) participants.push(n.nextSibling.data);
    if (participants.length < 4) {
        alert("4人以上選択してください");
        return;
    }
    werewolf = new Werewolf(participants, Array.from(configuration.getElementsByClassName("roletext"), x => x.firstChild.data));
    let anam = action.querySelectorAll(".playerlist .nametext"), rnam = result.querySelectorAll(".playerlist .nametext"), rrl = result.querySelectorAll(".playerlist .roletext");
    for (let i = 0; i < werewolf.player.length; i++) {
        overwrite(anam[i], werewolf.player[i].name);
        overwrite(rnam[i], werewolf.player[i].name);
        write_role(rrl[i], werewolf.player[i].role);
    }
    for (let i = werewolf.player.length; i < anam.length; i++) {
        anam[i].parentNode.style.display = "none";
        rnam[i].parentNode.style.display = "none";
    }
    entry_wizard();
};

entry.querySelector(".mainbtn").onclick = function () {
    let p = werewolf.player[werewolf.turn];
    if (window.confirm(p.name + "さんで間違いありませんか？")) {
        if (werewolf.phase == "昼") daytime_wizard(p);
        if (werewolf.phase == "夜") night_wizard(p);
    }
};

action.querySelector(".mainbtn").onclick = function () {
    let sbj = werewolf.player[werewolf.turn], obj = werewolf.player[radioindex("target")];
    if (!obj) return;
    if (werewolf.phase == "昼") obj.vote.push(sbj);
    else if (sbj.role == "占い師" || sbj.role == "パパラッチ") sbj.divine = obj;
    else if (sbj.role == "マジシャン") sbj.impersonate = obj;
    else if (werewolf.lapse == 0) obj.vote.push(sbj);
    else if (sbj.role == "人狼") {
        if (radioindex("confidence") == -1) return;
        for (let i = 0; i <= radioindex("confidence"); i++)obj.assult.push(sbj);
    }
    else if (sbj.role == "騎士" || sbj.role == "コスプレイヤー") obj.protect.push(sbj);
    else if (sbj.role == "偉大な霊媒師") {
        if (radioindex("moveoption") == 0) obj.vote.push(sbj);
        else sbj.impersonate = obj;
    }
    else {
        obj.vote.push(sbj);
        if (sbj.role == "ボマー" && bomber.querySelector("input[type='checkbox']").checked) sbj.bomb = "exploding";
    }
    move_on();
};

dawn.querySelector(".mainbtn").onclick = function () {
    werewolf.sunrise();
    if (werewolf.judge() != "") result_wizard(werewolf.judge());
    else move_on();
};

banish.querySelector(".mainbtn").onclick = function () {
    werewolf.sunset();
    if (werewolf.judge() != "") result_wizard(werewolf.judge());
    else move_on();
};

result.querySelector(".mainbtn").onclick = function () {
    configuration_wizard();
};

function move_on() {
    do ++werewolf.turn; while (werewolf.turn < werewolf.player.length && !werewolf.player[werewolf.turn].alive);
    if (werewolf.turn == werewolf.player.length) {
        werewolf.turn = -1;
        if (werewolf.phase == "昼") banish_wizard(werewolf.execution());
        if (werewolf.phase == "夜") dawn_wizard(werewolf.massacre(), maximizer(werewolf.player, "vote"));
    }
    else entry_wizard();
}

document.getElementsByName("moveoption")[0].onchange = function () {
    let r = document.getElementsByName("target");
    for (let i = 0; i < werewolf.player.length; i++)r[i].checked = false, r[i].disabled = !werewolf.player[i].alive;
};

document.getElementsByName("moveoption")[1].onchange = function () {
    let r = document.getElementsByName("target");
    for (let i = 0; i < werewolf.player.length; i++)r[i].checked = false, r[i].disabled = werewolf.player[i].alive;
};

function radioindex(name) {
    return Array.from(document.getElementsByName(name)).findIndex(x => x.checked);
}
