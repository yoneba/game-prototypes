const spade = 0, heart = 1, diamond = 2, club = 3; //スート
const mark = ["\u2660", "\u2665", "\u2666", "\u2663"]; //スペード、ハート、ダイヤ、クラブのマーク(Unicode16進数)
const card_design = ["\ud83c\udca1", "\ud83c\udcb1", "\ud83c\udcc1", "\ud83c\udcd1", "\ud83c\udca2",
    "\ud83c\udcb2", "\ud83c\udcc2", "\ud83c\udcd2", "\ud83c\udca3", "\ud83c\udcb3", "\ud83c\udcc3",
    "\ud83c\udcd3", "\ud83c\udca4", "\ud83c\udcb4", "\ud83c\udcc4", "\ud83c\udcd4", "\ud83c\udca5",
    "\ud83c\udcb5", "\ud83c\udcc5", "\ud83c\udcd5", "\ud83c\udca6", "\ud83c\udcb6", "\ud83c\udcc6",
    "\ud83c\udcd6", "\ud83c\udca7", "\ud83c\udcb7", "\ud83c\udcc7", "\ud83c\udcd7", "\ud83c\udca8",
    "\ud83c\udcb8", "\ud83c\udcc8", "\ud83c\udcd8", "\ud83c\udca9", "\ud83c\udcb9", "\ud83c\udcc9",
    "\ud83c\udcd9", "\ud83c\udcaa", "\ud83c\udcba", "\ud83c\udcca", "\ud83c\udcda", "\ud83c\udcab",
    "\ud83c\udcbb", "\ud83c\udccb", "\ud83c\udcdb", "\ud83c\udcad", "\ud83c\udcbd", "\ud83c\udccd",
    "\ud83c\udcdd", "\ud83c\udcae", "\ud83c\udcbe", "\ud83c\udcce", "\ud83c\udcde", "\ud83c\udcbf",
    "\ud83c\udcbf", "\ud83c\udcbf", "\ud83c\udca0"]; //トランプのデザイン
const face_down = whole; //裏向きのカード
const ratio = 1.5; //カードの縦横比
const card_width = 70; //カードの幅
const field_margin = 20; //場のカードの標準間隔
const human_margin = 25, com_margin = 20; //人、COMの手札の間隔
const lift = 14; //選択された手札を浮上させる
const hand_pos = [{ x: 290, y: 430 }, { x: 10, y: 5 }, { x: 290, y: 5 }, { x: 570, y: 5 }]; //手札の描画座標
const utter_pos = [{ x: 340, y: 455 }, { x: 60, y: 30 }, { x: 340, y: 30 }, { x: 620, y: 30 }]; //副露宣言の描画座標
const utter_size = { w: 85, h: 50 }; //副露宣言のサイズ
const namebox_pos = [{ x: 30, y: 500 }, { x: 10, y: 117 }, { x: 290, y: 117 }, { x: 570, y: 117 }]; //ネームボックスの描画位置
const namebox_size = { w: 200, h: 25 }; //ネームボックスのサイズ
const deck_pos = { x: 730, y: 180 }; //山札の描画座標
const trash_pos = { x: 730, y: 300 }; //捨て札の描画座標
const field_pos = { x: 10, y: 150, w: 710, h: 260 }; //フィールドの描画座標
const arrange_pos = [{ x: 720, y: 160 }, { x: 720, y: 290 }]; //場に出たカードの配置座標
var arrange = [new Array, new Array]; //場に出たカードの配置
var dispmode = "set"; //COMのカードを見せるかどうか

function start_screen() {
    var ctx = canvas.getContext('2d'), clg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    clg.addColorStop(0, "silver");
    clg.addColorStop(1, "dimgray");
    ctx.fillStyle = clg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "bold 96px 'メイリオ'";
    ctx.fillStyle = "red";
    decorate_text(ctx, "セ", 60, 160);
    ctx.fillStyle = "orange";
    decorate_text(ctx, "ブ", 160, 160);
    ctx.fillStyle = "yellow";
    decorate_text(ctx, "ン", 260, 160);
    ctx.fillStyle = "green";
    decorate_text(ctx, "ブ", 360, 160);
    ctx.fillStyle = "aqua";
    decorate_text(ctx, "リ", 455, 160);
    ctx.fillStyle = "blue";
    decorate_text(ctx, "ッ", 550, 160);
    ctx.fillStyle = "purple";
    decorate_text(ctx, "ジ", 645, 160);
}

function paint() {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var j = 0; j < p[human].hand.length; j++) {
        if (flag[j]) {
            draw_card(p[human].hand[j], hand_pos[human].x + human_margin * j, hand_pos[human].y - lift, card_width, ctx);
        }
        else {
            draw_card(p[human].hand[j], hand_pos[human].x + human_margin * j, hand_pos[human].y, card_width, ctx);
        }
    }
    for (var i = 1; i < p.length; i++) {
        for (var j = 0; j < p[i].hand.length; j++) {
            if (dispmode != "set" || state == "finish" || state == "over") {
                draw_card(p[i].hand[j], hand_pos[i].x + human_margin * j, hand_pos[i].y, card_width, ctx);
            }
            else draw_card(face_down, hand_pos[i].x + com_margin * j, hand_pos[i].y, card_width, ctx);
        }
    }
    for (var i = 0; i < p.length; i++) {
        ctx.fillStyle = "DarkGreen";
        ctx.fillRect(namebox_pos[i].x, namebox_pos[i].y, namebox_size.w, namebox_size.h);
        ctx.fillStyle = "snow";
        ctx.font = "16px 'メイリオ'";
        ctx.fillText(player_name[i], namebox_pos[i].x + 5, namebox_pos[i].y + namebox_size.h - 6);
        var len = ctx.measureText(p[i].point).width;
        ctx.fillText(p[i].point, namebox_pos[i].x + namebox_size.w - 5 - len, namebox_pos[i].y + namebox_size.h - 6);
        ctx.lineWidth = 2;
        if (i == turn) ctx.strokeStyle = "orange";
        else ctx.strokeStyle = "silver";
        ctx.strokeRect(namebox_pos[i].x, namebox_pos[i].y, namebox_size.w, namebox_size.h);
    }
    if (deck.length > 0) {
        ctx.fillStyle = "yellow";
        ctx.font = "20px 'メイリオ'";
        ctx.fillText(deck.length + "枚", deck_pos.x + 15, deck_pos.y - 5);
        draw_card(face_down, deck_pos.x, deck_pos.y, card_width, ctx);
    }
    if (trash.length > 0) draw_card(trash[trash.length - 1], trash_pos.x, trash_pos.y, card_width, ctx);
    else {
        ctx.fillStyle = "DarkGreen";
        ctx.fillRect(trash_pos.x, trash_pos.y, card_width, card_width * ratio);
    }
    ctx.fillStyle = "DarkGreen";
    ctx.fillRect(field_pos.x, field_pos.y, field_pos.w, field_pos.h);

    for (var i = 0; i < 2; i++) {
        arrange[i].len = arrange[i].length * (field_margin / 2 + card_width) + field_margin / 2;
        for (var j = 0; j < arrange[i].length; j++) {
            arrange[i].len += (field[arrange[i][j]].length - 1) * field_margin;
        }
    }
    var s = arrange[0].length + arrange[1].length;
    while (s < field.length) {
        var a = arrange[0].len <= arrange[1].len ? 0 : 1;
        arrange[a].len += card_width + (field[s].length - 1 / 2) * field_margin;
        arrange[a].push(s++);
    }
    for (var i = 0; i < 2; i++) {
        if (arrange[i].len <= field_pos.w) arrange[i].slide = field_margin;
        else {
            var amend = (field_pos.w - card_width * arrange[i].length) / (arrange[i].len - card_width * arrange[i].length);
            arrange[i].slide = field_margin * amend;
        }
        var st_x = arrange_pos[i].x, st_y = arrange_pos[i].y;
        for (var j = 0; j < arrange[i].length; j++) {
            st_x -= card_width + (field[arrange[i][j]].length - 1 / 2) * arrange[i].slide;
            for (var k = 0; k < field[arrange[i][j]].length; k++) {
                draw_card(field[arrange[i][j]][k], st_x + arrange[i].slide * k, st_y, card_width, ctx);
            }
            if (state == "main") {
                if (p[human].taggable(selectedset, field[arrange[i][j]])) {
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "red";
                    var st_w = card_width + (field[arrange[i][j]].length - 1) * arrange[i].slide;
                    ctx.strokeRect(st_x, st_y, st_w, card_width * ratio);
                }
            }
        }
    }
    var can;
    if (state == "chowselect") can = p[human].chowable(selectedset, trash[trash.length - 1]);
    else if (state == "pungselect") can = p[human].pungable(selectedset, trash[trash.length - 1]);
    else can = p[human].meldable(selectedset);
    if (can) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "red";
        ctx.strokeRect(field_pos.x, field_pos.y, field_pos.w, field_pos.h);
    }

    if (state == "declarechow" || state == "declarepung") {
        var j = p[turn].hand.length - 1;
        if (turn == human) {
            draw_card(p[turn].hand[j], hand_pos[turn].x + human_margin * j, hand_pos[turn].y - lift, card_width, ctx);
        }
        else {
            if (dispmode == "set") draw_card(p[turn].hand[j], hand_pos[turn].x + com_margin * j, hand_pos[turn].y, card_width, ctx);
            else draw_card(p[turn].hand[j], hand_pos[turn].x + human_margin * j, hand_pos[turn].y, card_width, ctx);
        }
        ctx.fillStyle = "black";
        ctx.globalAlpha = 0.5;
        ctx.fillRect(utter_pos[turn].x, utter_pos[turn].y, utter_size.w, utter_size.h);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "cyan";
        ctx.font = "36px 'メイリオ'";
        var str;
        if (state == "declarechow") str = "チー";
        else if (state == "declarepung") str = "ポン";
        var wid = ctx.measureText(str).width;
        ctx.fillText(str, utter_pos[turn].x + (utter_size.w - wid) / 2, utter_pos[turn].y + utter_size.h / 2 + wid / 6);
    }
    else if (state == "chowselect") {
        ctx.fillStyle = "white";
        ctx.font = "18px 'メイリオ'";
        ctx.fillText("チーに使うカードを選択", 40, 450);
    }
    else if (state == "pungselect") {
        ctx.fillStyle = "white";
        ctx.font = "18px 'メイリオ'";
        ctx.fillText("ポンに使うカードを選択", 40, 450);
    }
    else if (state == "over") {
        for (var i = 0; i < p.length; i++) {
            var d = damage[i];
            if (d == 0) continue;
            ctx.fillStyle = "black";
            ctx.globalAlpha = 0.6;
            ctx.fillRect(utter_pos[i].x, utter_pos[i].y, utter_size.w, utter_size.h);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "yellow";
            ctx.font = "30px 'メイリオ'";
            var wid = ctx.measureText(d).width;
            ctx.fillText(d, utter_pos[i].x + (utter_size.w - wid) / 2, utter_pos[i].y + utter_size.h / 2 + 10);
        }
    }
}

function draw_card(card, x, y, w, ctx) {
    var corner = 0.06, h = w * ratio;
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, w, h);
    if (card == face_down) ctx.fillStyle = "blue";
    else {
        if (suitof(card) == heart || suitof(card) == diamond) ctx.fillStyle = "red";
        else ctx.fillStyle = "black";
    }
    ctx.font = Math.floor(w * 1.62) + "px 'メイリオ'";
    ctx.fillText(card_design[card], x - w * 0.03, y + w * 1.32);
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, w, w * corner);
    ctx.fillRect(x, y, w * corner, h);
    ctx.fillRect(x + w - corner * w, y, w * corner, h);
    corner = 0.05;
    ctx.fillRect(x, y + h - corner * w, w, w * corner);
    corner = 0.015;
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, w, w * corner);
    ctx.fillRect(x, y + h - corner * w, w, w * corner);
    ctx.fillRect(x, y, w * corner, h);
    ctx.fillRect(x + w - corner * w, y, w * corner, h);
}

function decorate_text(ctx, text, x, y) {
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 40;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
}
