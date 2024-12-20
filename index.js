"use strict";
class vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static zero() {
        return new vec2(0, 0);
    }
    array() {
        return [this.x, this.y];
    }
    add(second) {
        this.x += second.x;
        this.y += second.y;
        return this;
    }
    div(second) {
        return new vec2(this.x / second.x, this.y / second.y);
    }
    mul(second) {
        return new vec2(this.x * second.x, this.y * second.y);
    }
    sub(second) {
        return new vec2(this.x - second.x, this.y - second.y);
    }
    dx(second) {
        return second.x - this.x;
    }
    dy(second) {
        return second.y - this.y;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    norm() {
        const length = this.length();
        if (length === 0) {
            return new vec2(0, 0);
        }
        return new vec2(this.x / length, this.y / length);
    }
    scale(value) {
        return new vec2(this.x * value, this.y * value);
    }
    distanceTo(second) {
        return this.sub(second).length();
    }
    static fromAngle(angle) {
        return new vec2(Math.cos(angle), Math.sin(angle));
    }
}
const EPS = 0.0001;
// const GRID_ROW = 10;
// const GRID_COL = 10;
// const GRID_SIZE = new vec2(GRID_COL, GRID_ROW);
// let SCENE = Array(GRID_ROW)
//   .(0)
//   .map(() => Array(GRID_COL).fill(0));
function canvasSize(ctx) {
    return new vec2(ctx.canvas.width, ctx.canvas.height);
}
function createdot(ctx, p) {
    ctx.beginPath();
    ctx.arc(...p.array(), 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = "blue";
    ctx.fill();
}
function strokeline(ctx, p1, p2) {
    ctx.beginPath();
    ctx.moveTo(...p1.array());
    ctx.lineTo(...p2.array());
    ctx.stroke();
}
function snap(x, dx) {
    if (dx > 0) {
        return Math.ceil(x + Math.sign(dx) * EPS);
    }
    if (dx < 0) {
        return Math.floor(x + Math.sign(dx) * EPS);
    }
    return x;
}
function hitcell(p1, p2) {
    const d = p2.sub(p1);
    return new vec2(Math.floor(p2.x + Math.sign(d.x) * EPS), Math.floor(p2.y + Math.sign(d.y) * EPS));
}
function raypath(p1, p2) {
    const d = p2.sub(p1);
    let p3 = p2;
    if (d.x !== 0) {
        const k = d.y / d.x;
        const c = p1.y - k * p1.x;
        {
            const x3 = snap(p2.x, d.x);
            const y3 = k * x3 + c;
            p3 = new vec2(x3, y3);
        }
        if (k !== 0) {
            const y3 = snap(p2.y, d.y);
            const x3 = (y3 - c) / k;
            const p3t = new vec2(x3, y3);
            if (p2.distanceTo(p3t) < p2.distanceTo(p3)) {
                p3 = p3t;
            }
        }
    }
    else {
        const x3 = p2.x;
        const y3 = snap(p2.y, d.y);
        p3 = new vec2(x3, y3);
    }
    return p3;
}
function sceneSize(scene) {
    const y = scene.length;
    let x = Number.MIN_VALUE;
    for (let row of scene) {
        x = Math.max(x, row.length);
    }
    return new vec2(x, y);
}
function minimap(ctx, player, position, size, scene) {
    ctx.save();
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const gridSize = sceneSize(scene);
    ctx.translate(...position.array());
    ctx.scale(...size.div(gridSize).array());
    ctx.lineWidth = 0.02;
    for (let i = 0; i < gridSize.y; ++i) {
        for (let j = 0; j < gridSize.x; ++j) {
            if (scene[i][j] !== 0) {
                ctx.fillStyle = "#300";
                ctx.fillRect(j, i, 1, 1);
            }
        }
    }
    ctx.strokeStyle = "black";
    for (let i = 0; i <= gridSize.x; ++i) {
        strokeline(ctx, new vec2(0, i), new vec2(gridSize.y, i));
    }
    for (let i = 0; i <= gridSize.y; ++i) {
        strokeline(ctx, new vec2(i, 0), new vec2(i, gridSize.x));
    }
    ctx.strokeStyle = "magenta";
    createdot(ctx, player.postion);
    player.postion.add(vec2.fromAngle(player.direction));
    ctx.restore();
}
class Player {
    constructor(position, direction) {
        this.postion = position;
        this.direction = direction;
    }
}
(() => {
    let scene = [
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    const game = document.getElementById("game");
    if (game === null) {
        console.error("Game not found");
        return;
    }
    if (game.getContext === undefined) {
        console.error("Canvas not supported");
        return;
    }
    const factor = 70;
    game.width = 16 * factor;
    game.height = 9 * factor;
    const ctx = game.getContext("2d");
    if (ctx === null) {
        throw new Error("2d context not supported");
    }
    let player = new Player(sceneSize(scene).mul(new vec2(0.15, 0.9)), 0);
    let mapPos = vec2.zero().add(canvasSize(ctx).scale(0.05));
    let cellsize = ctx.canvas.width * 0.03;
    let msize = sceneSize(scene).scale(cellsize);
    // game.addEventListener("mousemove", (e) => {
    //   //msize = canvasSize(ctx).scale(0.5);
    //   console.log(msize);
    //   p2 = new vec2(e.offsetX, e.offsetY)
    //     .sub(mapPos)
    //     .div(msize)
    //     .mul(sceneSize(scene));
    //   //minimap(ctx, p1, p2, vec2.zero(), canvasSize(ctx).scale(0.5), scene);
    //   minimap(ctx, p1, p2, mapPos, msize, scene);
    // });
    //minimap(ctx, p1, p2, vec2.zero(), canvasSize(ctx).scale(0.5), scene);
    minimap(ctx, player, mapPos, msize, scene);
})();
