const statusEl = document.getElementById("status");
if (statusEl) statusEl.textContent = "확장 프로그램이 동작 중입니다.";

// 리퀴드 글라스 굴절 맵 (https://kube.io/blog/liquid-glass-css-svg/ 원리)
// 가장자리(bezel)의 볼록한 표면에 스넬의 법칙을 적용해 픽셀별 변위를 구하고,
// R=x, G=y 채널(128 = 변위 없음)로 인코딩해 feDisplacementMap에 넘긴다.
const W = 332;
const H = 452;
const RADIUS = 60;
const BEZEL = 64;
const BEZEL_HEIGHT = 80;
const THICKNESS = 40;
const ETA = 1 / 1.5;

const surface = (t: number) => Math.pow(1 - Math.pow(1 - t, 4), 0.25);

// 표면 경사에서 굴절된 광선이 배경에서 안쪽으로 이동하는 거리(px)
const refract = (s: number): number => {
  const t = Math.min(Math.max(s / BEZEL, 0.002), 1);
  const d = 0.001;
  const slope =
    ((surface(Math.min(t + d, 1)) - surface(Math.max(t - d, 0))) /
      (Math.min(t + d, 1) - Math.max(t - d, 0))) *
    (BEZEL_HEIGHT / BEZEL);
  const len = Math.hypot(slope, 1);
  const nS = -slope / len;
  const nZ = 1 / len;
  const cosI = nZ;
  const k = ETA * cosI - Math.sqrt(1 - ETA * ETA * (1 - cosI * cosI));
  const tS = k * nS;
  const tZ = -ETA + k * nZ;
  return (tS / -tZ) * (BEZEL_HEIGHT * surface(t) + THICKNESS);
};

const buildMap = () => {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { url: "", max: 1 };
  const image = ctx.createImageData(W, H);

  const table = Array.from({ length: BEZEL + 1 }, (_, s) => refract(s));
  const max = Math.max(...table.map(Math.abs));

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const px = x + 0.5 - W / 2;
      const py = y + 0.5 - H / 2;
      const qx = Math.abs(px) - (W / 2 - RADIUS);
      const qy = Math.abs(py) - (H / 2 - RADIUS);
      const dist =
        Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
        Math.min(Math.max(qx, qy), 0) -
        RADIUS;
      const s = -dist;

      let nx = 0;
      let ny = 0;
      if (s >= 0 && s < BEZEL) {
        if (qx > 0 && qy > 0) {
          const l = Math.hypot(qx, qy);
          nx = (qx / l) * Math.sign(px);
          ny = (qy / l) * Math.sign(py);
        } else if (qx > qy) {
          nx = Math.sign(px);
        } else {
          ny = Math.sign(py);
        }
        const m = (table[Math.floor(s)] ?? 0) / max;
        nx *= -m;
        ny *= -m;
      }

      const i = (y * W + x) * 4;
      image.data[i] = 127.5 + 127.5 * nx;
      image.data[i + 1] = 127.5 + 127.5 * ny;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return { url: canvas.toDataURL(), max };
};

const { url, max } = buildMap();
document.getElementById("map")?.setAttribute("href", url);
document.querySelectorAll("[data-scale]").forEach((el) => {
  el.setAttribute("scale", String(2 * max * Number(el.getAttribute("data-scale"))));
});
