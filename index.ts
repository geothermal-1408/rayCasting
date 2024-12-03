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
  div(second: vec2): vec2 {
    this.x /= second.x;
    this.y /= second.y;
    return this;
  }
  mul(second: vec2): vec2 {
    return new vec2(this.x * second.x, this.y * second.y);
  }
}
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
  const ctx = game.getContext("2d") as CanvasRenderingContext2D | null;
  if (ctx === null) {
    console.error("2d context not supported");
    return;
  }
  game.width = 800;
  game.height = 800;
  ctx.fillStyle = "gray";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  let p2: vec2 | undefined = undefined;

  game.addEventListener("mousemove", (e) => {
    p2 = new vec2(e.offsetX, e.offsetY)
      .div(canvasSize(ctx))
      .mul(new vec2(GRID_COL, GRID_ROW));
  });

  ctx.scale(ctx.canvas.width / GRID_COL, ctx.canvas.height / GRID_ROW);
  ctx.lineWidth = 0.02;

  ctx.strokeStyle = "black";
  for (let i = 0; i <= GRID_ROW; ++i) {
    strokeline(ctx, new vec2(0, i), new vec2(GRID_COL, i));
  }
  for (let i = 0; i <= GRID_COL; ++i) {
    strokeline(ctx, new vec2(i, 0), new vec2(i, GRID_ROW));
  }

  const p1 = new vec2(GRID_ROW * 0.45, GRID_COL * 0.54);
  createdot(ctx, p1);
  if (p2 !== undefined) {
    createdot(ctx, p2);
    ctx.strokeStyle = "magenta";
    strokeline(ctx, p1, p2);
  }
})();
