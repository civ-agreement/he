const sectors = [
  { color: "#FFBC03", text: "#333333", label: "️Disaster event" },
  { color: "#FF5A10", text: "#333333", label: "Liability lawsuit" },
  { color: "#FFBC03", text: "#333333", label: "Property damage" },
  { color: "#FF5A10", text: "#333333", label: "Medical emergency" },
  { color: "#FFBC03", text: "#333333", label: "Auto accident" },
];

const pageMap = {
  "️ Disaster event": "disaster.html",
  "⚖️ Liability lawsuit": "liability.html",
  " Property damage": "property.html",
  " Medical emergency": "medical.html",
  " Auto accident": "auto.html",
};

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");

const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;
const friction = 0.991;

let angVel = 0;
let ang = 0;
let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = sector.text;
  ctx.font = "bold 30px 'Lato', sans-serif";
  ctx.fillText(sector.label, rad - 10, 10);

  ctx.restore();
}

function rotate() {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  spinEl.textContent = !angVel ? "SPIN" : sector.label;
  spinEl.style.background = sector.color;
  spinEl.style.color = sector.text;
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
    if (!angVel) {
      angVel = rand(0.25, 0.45);
      spinButtonClicked = true;
    }
  });
}

init();

events.addListener("spinEnd", (sector) => {
  const nextPage = pageMap[sector.label];

  if (nextPage) {
    spinEl.textContent = "Loading...";
    setTimeout(() => {
      window.location.href = nextPage;
    }, 1000);
  } else {
    console.error(`No page mapped for ${sector.label}`);
  }
});
