function paint(){ //描画
	var ctx = canvas.getContext('2d');
	var i, j;
	ctx.clearRect(0, 0, 750, 560);
	ctx.font = "22pt 'ＭＳ Ｐゴシック'";
	if (Math.floor(phase / 4) == 0){
		ctx.fillStyle = "fuchsia";
		ctx.fillText("東" + (phase % 4 + 1) + "局", 40 + 2.5*13*cx, 28);
	}
	else{
		ctx.fillStyle = "orange";
		ctx.fillText("南" + (phase % 4 + 1) + "局", 40 + 2.5*13*cx, 28);
	}
	ctx.font = "18pt 'ＭＳ Ｐゴシック'";
	if(success > 2){
		ctx.fillStyle = "black";
		ctx.fillText((success - 1) + "連荘", -40 + 2.5*13*cx, 27);
	}
	ctx.font = "16pt 'ＭＳ Ｐゴシック'";
	for (i = 0;i < 4;i++){
		for (j = 0;j < p[i].handnum;j++){
			if (i == human || !hide) draw(30 + 2.5*j*cx, 40+2.5*i*cy, p[i].hand[j], ctx, false);
			else{
				ctx.fillStyle = 'rgb(0, 0, 0)';
				ctx.fillRect(30 + 2.5*j*cx, 40+2.5*i*cy, 2*cx, 2*cy);
			}
		}
		for (j = 0;j < 4;j++){
			if (field[i][j] == -1) break;
			if (pieces[field[i][j]].see || !hide) draw(-0 + (2.5*j + 22.5)*cx, 40+2.5*i*cy, field[i][j], ctx, false);
			else{
				ctx.fillStyle = 'rgb(0, 0, 0)';
				ctx.fillRect(-0 + (2.5*j + 22.5)*cx, 40+2.5*i*cy, 2*cx, 2*cy);
			}
		}
		ctx.fillStyle = "black";
		if (i != human) ctx.fillText("COM" + (i + 1), 2.5*13*cx - 5, -5 + (2.5*i + 1.3)*cy);
		else ctx.fillText("あなた", 2.5*13*cx - 5, -5 + (2.5*i + 1.3)*cy);
		ctx.fillText(p[i].point, 70 + 2.5*13*cx, -5 + (2.5*i + 1.3)*cy);
		for (j = 0;j < p[i].take;j++){
			draw(20 + (36 - 1.5*j)*cx, -10 + (2.5*i + 1.6)*cy, p[i].get[j], ctx, true);
		}
	}
	ctx.fillStyle = "black";
	if (state == 4){
		j = 0;
		for (i = 0;i < 4;i++){
			if (p[i].point >= p[j].point) j = i;
		}
		ctx.font = "28pt 'ＭＳ Ｐゴシック'";
		if (j == human) ctx.fillText("あなたの勝ちです", 200, 250);
		else ctx.fillText("COM" + (j+1) + "の勝ちです", 200, 250);
	}
	else if (state == 5){
		if (substate == -1){
			ctx.fillStyle = "black";
			ctx.font = "24pt 'ＭＳ Ｐゴシック'";
			ctx.fillText("画面をクリックしてください", 135, 250);
		}
		else if (substate == -2){
			ctx.fillStyle = "lightgray";
			ctx.fillRect(20, 200, 570, 100);
			ctx.font = "36pt 'ＭＳ Ｐゴシック'";
			ctx.fillStyle = "black";
			if (Math.floor(phase / 4) == 0){
				ctx.fillText("東" + (phase % 4 + 1) + "局", 250, 265);
			}
			else{
				ctx.fillText("南" + (phase % 4 + 1) + "局", 250, 265);
			}
		}
	}
	else{
		ctx.fillStyle = "blue";
		ctx.fillRect(5, (2.5*parent + 1.3)*cy, 20, 40);
	}
	ctx.fillStyle = "green";
	for (i = 0;i < 8;i++){
		if (selected[i] == 1){
			ctx.fillRect(40 + 2.5*i*cx, 20+10*cy, 20, 20);
		}
	}
}

function draw(x, y, which, ctx, shrink){ //牌の描画
	var i, j;
	if (shrink){
		cx = 11;
		cy = 31;
		lw = 5;
		lh5 = 5;
		lh4 = 6;
		lh3 = 8;
		radius = 4;
	}
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.fillRect(x, y, 2*cx, 2*cy);
	ctx.fillStyle = 'rgb(255, 0, 0)';
	switch(which){
	case 0:
	case 1:
		for (i = -1;i <= 1;i += 2){
			for (j = -5;j <= 5;j += 2){
				if (i == 1 && j < 0 || i == -1 && j > 0) ctx.fillStyle = 'rgb(255, 255, 255)';
				else ctx.fillStyle = 'rgb(255, 0, 0)';
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 2:
	case 3:
		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.beginPath();
		ctx.arc(x + cx, y + cy - 4*lh4, radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.arc(x + cx, y + cy + 4*lh4, radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		break;
	case 4:
	case 5:
		ctx.fillStyle = 'rgb(255, 0, 0)';
		for (i = -1;i <= 1;i += 2){
			for (j = -3;j <= 3;j += 2){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh3*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 6:
	case 7:
		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.beginPath();
		ctx.arc(x + cx, y + cy - 4*lh4, radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i++){
			ctx.beginPath();
			ctx.arc(x + cx - lw*i, y + cy + 2*lh4*(i + 1), radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		break;
	case 8:
	case 9:
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (j = -5;j <= 5;j += 2){
			for (i = -1;i <= 1;i += 2){
				ctx.beginPath();
				if (j == -3 || j == 3) ctx.arc(x + cx, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				else ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 10:
	case 11:
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (j = -4;j <= 4;j += 2){
			if (j == 0){
				ctx.beginPath();
				ctx.arc(x + cx - lw, y + cy, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
				ctx.beginPath();
				ctx.arc(x + cx + lw, y + cy, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
			else{
				for (i = -1;i <= 1;i += 2){
					ctx.beginPath();
					ctx.arc(x + cx, y + cy + lh4*j, radius, 0, Math.PI*2, true);
					ctx.closePath();
					ctx.fill();
				}
			}
		}
		break;
	case 12:
	case 13:
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i += 2){
			for (j = -4;j <= 4;j += 8){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh4*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 14:
	case 15:
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i += 2){
			for (j = -5;j <= 5;j += 2){
				ctx.beginPath();
				if (j == -3) ctx.arc(x + cx, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				else ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 16:
	case 17:
		for (i = -1;i <= 1;i += 2){
			ctx.fillStyle = 'rgb(255, 0, 0)';
			for (j = -4;j <= -2;j += 2){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh4*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
			ctx.fillStyle = 'rgb(255, 255, 255)';
			for (j = 1;j <= 5;j += 2){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 18:
	case 19:
		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.beginPath();
		ctx.arc(x + cx, y + cy - lh4*4, radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i += 2){
			for (j = 1;j <= 5;j += 2){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 20:
	case 21:
		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.beginPath();
		ctx.arc(x + cx, y + cy - lh4*4, radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i += 2){
			for (j = 1;j <= 5;j += 2){
				ctx.beginPath();
				if (j == 3) ctx.arc(x + cx, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				else ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 22:
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i++){
			ctx.beginPath();
			ctx.arc(x + cx - lw*i, y + cy + lh5*(2*i - 3), radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		for (i = -1;i <= 1;i += 2){
			for (j = 1;j <= 5;j += 2){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 23:
		for (i = -1;i <= 1;i += 2){
			ctx.fillStyle = 'rgb(255, 0, 0)';
			for (j = -4;j <= -2;j += 2){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh4*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
			ctx.fillStyle = 'rgb(255, 255, 255)';
			for (j = 1;j <= 5;j += 2){
				ctx.beginPath();
				if (j == 3) ctx.arc(x + cx, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				else ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 24:
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i++){
			ctx.beginPath();
			ctx.arc(x + cx - lw*i, y + cy + lh5*(2*i - 3), radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		for (i = -1;i <= 1;i += 2){
			for (j = 1;j <= 5;j += 2){
				ctx.beginPath();
				if (j == 3) ctx.arc(x + cx, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				else ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 25:
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i += 2){
			ctx.beginPath();
			ctx.arc(x + cx + lw*i, y + cy - lh4*4, radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		for (i = -1;i <= 1;i += 2){
			for (j = 1;j <= 5;j += 2){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 26:
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i += 2){
			ctx.beginPath();
			ctx.arc(x + cx + lw*i, y + cy - lh4*4, radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		for (i = -1;i <= 1;i += 2){
			for (j = 1;j <= 5;j += 2){
				ctx.beginPath();
				if (j == 3) ctx.arc(x + cx, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				else ctx.arc(x + cx + lw*i, y + cy + lh5*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		break;
	case 27:
		ctx.fillStyle = 'rgb(255, 0, 0)';
		for (i = -1;i <= 1;i += 2){
			ctx.fillStyle = 'rgb(255, 0, 0)';
			for (j = -4;j <= -2;j += 2){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh4*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i++){
			ctx.beginPath();
			ctx.arc(x + cx - lw*i, y + cy + lh5*(2*i + 3), radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		break;
	case 28:
		ctx.fillStyle = 'rgb(255, 0, 0)';
		for (i = -1;i <= 1;i += 2){
			ctx.fillStyle = 'rgb(255, 0, 0)';
			for (j = -4;j <= -2;j += 2){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh4*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i += 2){
			ctx.beginPath();
			ctx.arc(x + cx + lw*i, y + cy + lh4*4, radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		break;
	case 29:
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i += 2){
			ctx.beginPath();
			ctx.arc(x + cx + lw*i, y + cy - lh4*4, radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		for (i = -1;i <= 1;i++){
			ctx.beginPath();
			ctx.arc(x + cx - lw*i, y + cy + lh5*(2*i + 3), radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		break;
	case 30:
		ctx.fillStyle = 'rgb(255, 0, 0)';
		for (i = -1;i <= 1;i += 2){
			ctx.fillStyle = 'rgb(255, 0, 0)';
			for (j = -4;j <= -2;j += 2){
				ctx.beginPath();
				ctx.arc(x + cx + lw*i, y + cy + lh4*j, radius, 0, Math.PI*2, true);
				ctx.closePath();
				ctx.fill();
			}
		}
		ctx.beginPath();
		ctx.arc(x + cx, y + cy + 4*lh4, radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		break;
	case 31:
		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.beginPath();
		ctx.arc(x + cx, y + cy - 4*lh4, radius, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = 'rgb(255, 255, 255)';
		for (i = -1;i <= 1;i += 2){
			ctx.beginPath();
			ctx.arc(x + cx + lw*i, y + cy + lh4*4, radius, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
		break;
	}
	if (shrink){
		cx = 19;
		cy = 51;
		lw = 8;
		lh5 = 8;
		lh4 = 10;
		lh3 = 13;
		radius = 7;
	}
}