class vec2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  array(): [number, number] {
    return [this.x, this.y];
  }
  add(second: vec2): vec2 {
    this.x += second.x;
    this.y += second.y;
    return this;
  }
  div(second: vec2): vec2 {
    this.x /= second.x;
    this.y /= second.y;
    return this;
  }
  mul(second: vec2): vec2 {
    return new vec2(this.x * second.x, this.y * second.y);
  }
  sub(second: vec2): vec2 {
    return new vec2(this.x - second.x, this.y - second.y);
  }
  dx(second: vec2): number {
    return second.x - this.x;
  }
  dy(second: vec2): number {
    return second.y - this.y;
  }
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  norm(): vec2 {
    const length = this.length();
    if (length === 0) {
      return new vec2(0, 0);
    }
    return new vec2(this.x / length, this.y / length);
  }
  scale(value: number): vec2 {
    return new vec2(this.x * value, this.y * value);
  }
  distanceTo(second: vec2): number {
    return this.sub(second).length();
  }
}
const EPS = 0.0001;
const GRID_ROW = 10;
const GRID_COL = 10;
const GRID_SIZE = new vec2(GRID_COL, GRID_ROW);

function canvasSize(ctx: CanvasRenderingContext2D): vec2 {
  return new vec2(ctx.canvas.width, ctx.canvas.height);
}
function createdot(ctx: CanvasRenderingContext2D, p: vec2) {
  ctx.beginPath();
  ctx.arc(...p.array(), 0.2, 0, 2 * Math.PI);
  ctx.fillStyle = "blue";
  ctx.fill();
}

function strokeline(ctx: CanvasRenderingContext2D, p1: vec2, p2: vec2) {
  ctx.beginPath();
  ctx.moveTo(...p1.array());
  ctx.lineTo(...p2.array());
  ctx.stroke();
}

function snap(x: number, dx: number): number {
  if (dx > 0) {
    return Math.ceil(x + Math.sign(dx) * EPS);
  }
  if (dx < 0) {
    return Math.floor(x + Math.sign(dx) * EPS);
  }
  return x;
}

function hitcell(p1: vec2, p2: vec2): vec2 {
  const d = p2.sub(p1);
  return new vec2(
    Math.floor(p2.x + Math.sign(d.x) * EPS),
    Math.floor(p2.y + Math.sign(d.y) * EPS)
  );
}
function raypath(p1: vec2, p2: vec2): vec2 {
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
  } else {
    const x3 = p2.x;
    const y3 = snap(p2.y, d.y);
    p3 = new vec2(x3, y3);
  }

  return p3;
}
function canvasrender(ctx: CanvasRenderingContext2D, p2: vec2 | undefined) {
  ctx.reset();
  ctx.fillStyle = "gray";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.scale(ctx.canvas.width / GRID_COL, ctx.canvas.height / GRID_ROW);
  ctx.lineWidth = 0.02;

  ctx.strokeStyle = "black";
  for (let i = 0; i <= GRID_ROW; ++i) {
    strokeline(ctx, new vec2(0, i), new vec2(GRID_COL, i));
  }
  for (let i = 0; i <= GRID_COL; ++i) {
    strokeline(ctx, new vec2(i, 0), new vec2(i, GRID_ROW));
  }

  let p1 = new vec2(GRID_ROW * 0.45, GRID_COL * 0.54);
  ctx.strokeStyle = "magenta";
  createdot(ctx, p1);
  if (p2 !== undefined) {
    for (;;) {
      createdot(ctx, p2);
      ctx.strokeStyle = "magenta";
      strokeline(ctx, p1, p2);

      const c = hitcell(p1, p2);
      if (c.x < 0 || c.x >= GRID_COL || c.y < 0 || c.y >= GRID_ROW) {
        break;
      }
      const p3 = raypath(p1, p2);
      p1 = p2;
      p2 = p3;
    }
  }
}

(() => {
  const game = document.getElementById("game") as HTMLCanvasElement | null;
  if (game === null) {
    console.error("Game not found");
    return;
  }
  if (game.getContext === undefined) {
    console.error("Canvas not supported");
    return;
  }
  game.width = 800;
  game.height = 800;

  const ctx = game.getContext("2d") as CanvasRenderingContext2D | null;
  if (ctx === null) {
    console.error("2d context not supported");
    return;
  }

  let p2: vec2 | undefined = undefined;

  game.addEventListener("mousemove", (e) => {
    p2 = new vec2(e.offsetX, e.offsetY)
      .div(canvasSize(ctx))
      .mul(new vec2(GRID_COL, GRID_ROW));
    canvasrender(ctx, p2);
  });
  canvasrender(ctx, p2);
})();
