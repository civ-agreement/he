function createSecondarySpinner({ title, sectors }) {
  document.title = title;

  const titleEl = document.querySelector("#page-title");
  const spinEl = document.querySelector("#spin");
  const resultEl = document.querySelector("#result");
  const canvas = document.querySelector("#wheel");
  const ctx = canvas.getContext("2d");

  if (titleEl) {
    titleEl.textContent = title;
  }

  const events = {
    listeners: {},
    addListener(eventName, fn) {
      this.listeners[eventName] = this.listeners[eventName] || [];
      this.listeners[eventName].push(fn);
    },
    fire(eventName, ...args) {
      if (this.listeners[eventName]) {
        for (const fn of this.listeners[eventName]) {
          fn(...args);
        }
      }
    }
  };

  const rand = (min, max) => Math.random() * (max - min) + min;
  const tot = sectors.length;
  const dia = ctx.canvas.width;
  const rad = dia / 2;
  const PI = Math.PI;
  const TAU = 2 * PI;
  const arc = TAU / tot;
  const friction = 0.991;

  let angVel = 0;
  let ang = 0;
  let spinButtonClicked = false;

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
    const textX = rad * 0.55;

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
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  spinEl.textContent = angVel ? "SPINNING..." : "SPIN";

  /* fixed inner button color */
  spinEl.style.background = "#8f88d8";

  /* only the ring changes, because box-shadow uses currentColor */
  spinEl.style.color = sector.color;
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
        resultEl.textContent = "";
        spinButtonClicked = true;
      }
    });
  }

  init();

  events.addListener("spinEnd", (sector) => {
    resultEl.textContent = `Result: ${sector.label}`;
    spinEl.style.background = sector.color;
    spinEl.style.color = "#111827";
  });
}
