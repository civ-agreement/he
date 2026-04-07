const sectors = [
  { color: "#a29bfe", text: "#333333", label: "Disaster event" },
  { color: "#81ecec", text: "#333333", label: "Liability lawsuit" },
  { color: "#fab1a0", text: "#333333", label: "Property damage" },
  { color: "#ffeaa7", text: "#333333", label: "Medical emergency" },
  { color: "#55efc4", text: "#333333", label: "Auto accident" }
];

const pageMap = {
  "Disaster event": "/disaster/",
  "Liability lawsuit": "/liability/",
  "Property damage": "/property/",
  "Medical emergency": "/medical/",
  "Auto accident": "/auto/"
};

const events = {
  listeners: {},

  addListener(eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },

  fire(eventName, ...args) {
    if (!this.listeners[eventName]) return;
    for (const fn of this.listeners[eventName]) {
      fn(...args);
    }
  }
};

const rand = (min, max) => Math.random() * (max - min) + min;

const spinEl = document.querySelector("#spin");
const canvas = document.querySelector("#wheel");
const ctx = canvas.getContext("2d");

const tot = sectors.length;
const dia = canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / tot;
const friction = 0.991;

let angVel = 0;
let ang = 0;
let spinButtonClicked = false;
let isRedirecting = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const testLine = `${currentLine} ${words[i]}`;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }

  lines.push(currentLine);
  return lines;
}

function drawSector(sector, i) {
  const sectorAngle = arc * i;
  const maxWidth = rad * 0.6;
  const lineHeight = 22;
  const fontSize = 18;
  const textX = rad * 0.63;

  ctx.save();

  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, sectorAngle, sectorAngle + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  ctx.translate(rad, rad);
  ctx.rotate(sectorAngle + arc / 2);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = sector.text;
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;

  const lines = wrapText(ctx, sector.label, maxWidth);
  const startY = -((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, textX, startY + index * lineHeight);
  });

  ctx.restore();
}

function rotate() {
  const sector = sectors[getIndex()];
  canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  if (isRedirecting) {
    spinEl.textContent = "NEXT...";
    spinEl.style.background = "#ffffff";
    spinEl.style.color = "#111827";
    return;
  }

  spinEl.textContent = angVel ? "SPINNING..." : "SPIN";
  spinEl.style.background = angVel ? "#ffffff" : sector.color;
  spinEl.style.color = "#111827";
}

function frame() {
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector);
    spinButtonClicked = false;
    return;
  }

  angVel *= friction;
  if (angVel < 0.002) angVel = 0;

  ang += angVel;
  ang %= TAU;

  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  sectors.forEach(drawSector);
  rotate();
  engine();

  spinEl.addEventListener("click", () => {
    if (angVel || isRedirecting) return;

    angVel = rand(0.25, 0.45);
    spinButtonClicked = true;
  });
}

events.addListener("spinEnd", (sector) => {
  const nextPage = pageMap[sector.label];

  if (!nextPage) {
    console.error(`No page mapped for "${sector.label}"`);
    return;
  }

  isRedirecting = true;
  rotate();

  setTimeout(() => {
    window.location.href = nextPage;
  }, 800);
});

init();
