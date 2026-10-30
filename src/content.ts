// 리퀴드 글라스 굴절 맵 (https://kube.io/blog/liquid-glass-css-svg/ 원리)
// 가장자리(bezel)의 볼록한 표면에 스넬의 법칙을 적용해 픽셀별 변위를 구하고,
// R=x, G=y 채널(128 = 변위 없음)로 인코딩해 feDisplacementMap에 넘긴다.
const W = 332;
const H = 452;
const RADIUS = 40;
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


const STYLE = `
  :host { all: initial; }
  .panel {
    position: fixed; top: 24px; right: 24px; width: ${W}px; height: ${H}px;
    z-index: 2147483647; box-sizing: border-box; padding: 36px 32px;
    border-radius: 40px; color: #fff; font-family: system-ui, sans-serif;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
    background: linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.12));
    backdrop-filter: url(#glass);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
  }
  .panel::after {
    content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px;
    background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.6));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
  }
  h3 { margin: 0 0 12px; font-size: 18px; }
  p { margin: 0; }
`;

let host: HTMLElement | null = null;

const create = () => {
  const { url, max } = buildMap();
  const el = document.createElement("div");
  const root = el.attachShadow({ mode: "open" });
  root.innerHTML = `
    <style>${STYLE}</style>
    <svg width="0" height="0" aria-hidden="true" style="position:absolute">
      <filter id="glass" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="soft"/>
        <feImage href="${url}" x="0" y="0" width="${W}" height="${H}" result="map"/>
        <feColorMatrix in="soft" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r0"/>
        <feColorMatrix in="soft" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g0"/>
        <feColorMatrix in="soft" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b0"/>
        <feDisplacementMap scale="${2 * max * 1.08}" in="r0" in2="map" xChannelSelector="R" yChannelSelector="G" result="r1"/>
        <feDisplacementMap scale="${2 * max}" in="g0" in2="map" xChannelSelector="R" yChannelSelector="G" result="g1"/>
        <feDisplacementMap scale="${2 * max * 0.92}" in="b0" in2="map" xChannelSelector="R" yChannelSelector="G" result="b1"/>
        <feBlend in="r1" in2="g1" mode="screen" result="rg"/>
        <feBlend in="rg" in2="b1" mode="screen"/>
      </filter>
    </svg>
    <div class="panel">
      <h3>Why Do This</h3>
      <p>확장 프로그램이 동작 중입니다.</p>
    </div>`;
  return el;
};

const toggle = () => {
  if (host) {
    host.remove();
    host = null;
  } else {
    host = create();
    document.documentElement.append(host);
  }
};

chrome.runtime.onMessage.addListener(toggle);
