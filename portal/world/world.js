const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================
// SIZE
// =====================
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// =====================
// STATE
// =====================
let world = {
  grid: { w: 50, h: 50 },
  objects: []
};

let zoom = 1;
let cameraX = 0;
let cameraY = 0;

let hoveredObject = null;

let searchResults = [];
let searchIndex = 0;
let searchHighlight = null;
let highlightTimer = 0;

let mapImage;

let scale = 1;


let spotlight = {
  x: 0,
  y: 0,
  radius: 180,
  active: false
};

const CAMERA_MARGIN = 200;

// =====================
// IMAGE CACHE
// =====================
const imageCache = {};

function loadImage(src) {
  if (imageCache[src]) return imageCache[src];

  const img = new Image();
  img.src = src;
  imageCache[src] = img;

  return img;
}

// =====================
// ISO CORE
// =====================
function centerX() {
  return canvas.width / 2;
}

function centerY() {
  return canvas.height / 2;
}

function isoX(x, y) {
  return worldToScreenX(x, y) - cameraX + centerX();
}

function isoY(x, y) {
  return worldToScreenY(x, y) - cameraY + centerY();
}

// =====================
// LOAD WORLD
// =====================
async function loadWorld() {
  const res = await fetch("database/world.json");
  world = await res.json();

}

// =====================
// DRAW GROUND
// =====================
function drawGround() {
  ctx.fillStyle = "#44c953";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// =====================
// SORT (IMPORTANT FOR ISO)
// =====================
function getSortedObjects() {
  return [...world.objects].sort((a, b) => {

    const depthA = (a.x + a.w - 1) + (a.y + a.h - 1);
    const depthB = (b.x + b.w - 1) + (b.y + b.h - 1);

    if (depthA !== depthB) {
      return depthA - depthB;
    }

    // stabilność sortowania (ważne przy remisie)
    return a.x - b.x;
  });
}



// =====================
// DRAW OBJECT
// =====================


const GROUP_OFFSETS = {
  "1x1": { x: +1, y: +1 },
  "2x2": { x: +2, y: +2 },
  "3x3": { x: +3, y: +3 },
  "4x4": { x: +4, y: +4 },
};

const GROUP_FOOTPRINT = {
  "1x1": { w: 1, h: 1 },
  "2x2": { w: 2, h: 2 },
  "3x3": { w: 3, h: 3 },
  "4x4": { w: 4, h: 4 },
};

const SPRITE_SCALE = {
  "1x1": 1 / 8,
  "2x2": 1 / 4,
  "3x3": 1 / 2.67,
  "4x4": 1 / 2,
};


function drawObject(obj, img, alpha = 1) {

  const groupKey = `${obj.w}x${obj.h}`;
  const groupOffset = GROUP_OFFSETS[groupKey] ?? { x: 0, y: 0 };
  const scaleFactor = SPRITE_SCALE[groupKey] ?? 1;

  const baseX = isoX(obj.x + groupOffset.x, obj.y + groupOffset.y);
  const baseY = isoY(obj.x + groupOffset.x, obj.y + groupOffset.y);

  const w = img.width * scaleFactor * zoom;
  const h = img.height * scaleFactor * zoom;

  const offsetX = w / 2;
  const offsetY = h;

  const isHighlighted =
    searchHighlight && searchHighlight.id === obj.id;
  
  const hasNickname =
    obj.nickname && obj.nickname.trim() !== "";

  const isHovered =
    hasNickname &&
    hoveredObject &&
    hoveredObject.id === obj.id;

    // =========================
    // HOVER EFFECT
    // =========================
    if (isHovered) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.filter = "drop-shadow(0 0 15px white) brightness(1.3)";
    }

  ctx.globalAlpha = alpha;

  // =========================
  // 🔥 HIGHLIGHT GLOW (SEARCH)
  // =========================
  if (isHighlighted) {
    const flash = Math.floor(searchHighlight.time / 5) % 2 === 0;

    if (flash) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.filter = "drop-shadow(0 0 20px yellow) brightness(1.6)";
    }
  }

  ctx.drawImage(
    img,
    baseX - offsetX,
    baseY - offsetY,
    w,
    h
  );

  if (isHighlighted) {
    ctx.restore();
  }

  if (isHovered) {
    ctx.restore();
  }

  ctx.globalAlpha = 1;
}

// =====================
// STAR
// =====================

const starImg = new Image();
starImg.src = "assets/star.png";


function drawStar(obj) {

  if (!obj.nickname || obj.nickname.trim() === "") return;

  const groupKey = `${obj.w}x${obj.h}`;
  const groupOffset = GROUP_OFFSETS[groupKey] ?? { x: 0, y: 0 };

  const baseX = isoX(obj.x + groupOffset.x, obj.y + groupOffset.y);
  const baseY = isoY(obj.x + groupOffset.x, obj.y + groupOffset.y);

  // Pulsowanie (co ok. 1,5 sekundy)
  const pulse = 1 + 0.15 * Math.sin(Date.now() / 250);

  // Podstawowa szerokość
  const baseStarWidth = 30 * zoom;

  // Powiększona/pomniejszona szerokość
  const starWidth = baseStarWidth * pulse;

  // Zachowanie proporcji
  const starHeight = starWidth * (961 / 1014);

  ctx.drawImage(
    starImg,
    baseX - starWidth / 2,
    baseY - 160 * zoom - (starHeight - baseStarWidth * (961 / 1014)) / 2,
    starWidth,
    starHeight
  );
}


// =====================
// DRAW ALL OBJECTS
// =====================

function drawObjects() {
  const sorted = getSortedObjects();

  for (const obj of sorted) {
    const img = loadImage(obj.image);
    if (!img.complete) continue;

    drawObject(obj, img);

    drawStar(obj);
  }
}


// =====================
// CAMERA (drag)
// =====================

let dragging = false;
let lastX = 0;
let lastY = 0;

// =====================
// POINTER DOWN (mouse + touch)
// =====================
canvas.addEventListener("pointerdown", (e) => {
  dragging = true;

  lastX = e.clientX;
  lastY = e.clientY;

  canvas.setPointerCapture(e.pointerId);
});

// =====================
// POINTER UP
// =====================
canvas.addEventListener("pointerup", (e) => {
  dragging = false;
});

// =====================
// POINTER MOVE
// =====================
canvas.addEventListener("pointermove", (e) => {

  // =====================
  // CAMERA DRAG (WORKS ON MOBILE TOO)
  // =====================
  if (dragging) {
    cameraX -= (e.clientX - lastX);
    cameraY -= (e.clientY - lastY);

    lastX = e.clientX;
    lastY = e.clientY;

    clampCamera();
  }

  // =====================
  // HOVER (desktop only sensowne)
  // =====================
  hoveredObject = getObjectUnderMouse(e.clientX, e.clientY);

  canvas.style.cursor = hoveredObject ? "pointer" : "grab";
});



// =====================
// CAMERA - SETTINGS
// =====================

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

const TILE_W = 32;
const TILE_H = 16;

function worldToScreenX(x, y) {
  return (x - y) * TILE_W * scale * zoom;
}

function worldToScreenY(x, y) {
  return (x + y) * TILE_H * scale * zoom;
}

/*
function worldToScreenX(x, y) {
  return (x - y) * 32 * zoom;
}

function worldToScreenY(x, y) {
  return (x + y) * 16 * zoom;
}
*/


function centerCameraOnMap() {
  const cx = world.grid.w / 2;
  const cy = world.grid.h / 2;

  const sx = worldToScreenX(cx, cy);
  const sy = worldToScreenY(cx, cy);

  cameraX = sx;
  cameraY = sy;

  clampCamera();
}

// =====================
// ZOOM
// =====================
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // 1. punkt pod myszą w WORLD SPACE (przed zoomem)
  const worldX = (mouseX - centerX() + cameraX) / zoom;
  const worldY = (mouseY - centerY() + cameraY) / zoom;

  // 2. zmiana zoomu
  const oldZoom = zoom;

  zoom *= e.deltaY > 0 ? 0.9 : 1.1;
  zoom = Math.max(0.5, Math.min(2, zoom));

  const zoomRatio = zoom / oldZoom;

  // 3. korekta kamery (KLUCZ)
  cameraX = worldX * zoom - (mouseX - centerX());
  cameraY = worldY * zoom - (mouseY - centerY());

  clampCamera();
});


function getMapBounds() {
  const w = world.grid.w;
  const h = world.grid.h;

  const mapWidth = (w + h) * 32 * zoom;
  const mapHeight = (w + h) * 16 * zoom;

  return { mapWidth, mapHeight };
}

function clampCamera() {
  const { mapWidth, mapHeight } = getMapBounds();

  const minX = -mapWidth / 2 - CAMERA_MARGIN;
  const maxX =  mapWidth / 2 + CAMERA_MARGIN;

  const minY = -mapHeight / 2 - CAMERA_MARGIN;

  // 🔥 TYLKO DÓŁ
  const maxY = mapHeight / 2 + CAMERA_MARGIN + 2000; // o ile px w dół może przesunąc się kamera

  cameraX = Math.max(minX, Math.min(maxX, cameraX));
  cameraY = Math.max(minY, Math.min(maxY, cameraY));
}


// =====================
// SIATKA
// =====================

function drawGrid() {
  const w = world.grid.w;
  const h = world.grid.h;

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;

  ctx.beginPath();

  // 🔥 linie X (diagonalne iso)
  for (let x = 0; x <= w; x++) {
    const start = worldToScreenX(x, 0);
    const startY = worldToScreenY(x, 0);

    const end = worldToScreenX(x, h);
    const endY = worldToScreenY(x, h);

    ctx.moveTo(
      start - cameraX + centerX(),
      startY - cameraY + centerY()
    );

    ctx.lineTo(
      end - cameraX + centerX(),
      endY - cameraY + centerY()
    );
  }

  // 🔥 linie Y
  for (let y = 0; y <= h; y++) {
    const start = worldToScreenX(0, y);
    const startY = worldToScreenY(0, y);

    const end = worldToScreenX(w, y);
    const endY = worldToScreenY(w, y);

    ctx.moveTo(
      start - cameraX + centerX(),
      startY - cameraY + centerY()
    );

    ctx.lineTo(
      end - cameraX + centerX(),
      endY - cameraY + centerY()
    );
  }

  ctx.stroke();
}

// =====================
// RENDER LOOP
// =====================

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGround();

  drawMap(); 
  drawGrid();
  if (searchHighlight) {
    searchHighlight.time++;

    if (searchHighlight.time > 20) {
      searchHighlight = null;
    }
  }

  drawObjects();
  drawTooltip();



  requestAnimationFrame(render);
}



// =====================
// POINTER
// =====================
const GROUP_OFFSETS_HOVER = {
  "1x1": { x: 1, y: 1 },
  "2x2": { x: 1, y: 1 },
  "3x3": { x: 2, y: 2 },
  "4x4": { x: 3, y: 3 },
};

function getObjectWorldPos(obj) {
  const key = `${obj.w}x${obj.h}`;
  const offset = GROUP_OFFSETS[key] ?? { x: 0, y: 0 };

  return {
    x: obj.x + offset.x,
    y: obj.y + offset.y
  };
}

function getObjectUnderMouse(mx, my) {
  const sx = (mx - centerX() + cameraX) / zoom;
  const sy = (my - centerY() + cameraY) / zoom;

  const worldX = (sx / 32 + sy / 16) / 2;
  const worldY = (sy / 16 - sx / 32) / 2;

  const sorted = getSortedObjects();

  for (let i = sorted.length - 1; i >= 0; i--) {
    const obj = sorted[i];

    const key = `${obj.w}x${obj.h}`;

    // Osobny offset tylko dla hovera
    const hoverOffset =
      GROUP_OFFSETS_HOVER[key] ?? { x: 0, y: 0 };

    const ox = obj.x + hoverOffset.x;
    const oy = obj.y + hoverOffset.y;

    if (
      worldX >= ox &&
      worldX < ox + obj.w &&
      worldY >= oy &&
      worldY < oy + obj.h
    ) {
      return obj;
    }
  }

  return null;
}



// =====================
// TOOLTIP (NAPIS NAD OBIEKTEM)
// =====================
function drawTooltip() {
  if (!hoveredObject) return;

  const hasNickname = hoveredObject.nickname && hoveredObject.nickname.trim() !== "";
  const hasDescription = hoveredObject.description && hoveredObject.description.trim() !== "";
  const hasLink = hoveredObject.link && hoveredObject.link.trim() !== "";

  if (!hasNickname && !hasDescription && !hasLink) return;

  const x = isoX(hoveredObject.x, hoveredObject.y);
  const y = isoY(hoveredObject.x, hoveredObject.y) - 60;

  ctx.font = "14px Arial";
  ctx.textAlign = "center";

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(x - 80, y - 40, 160, 50);

  if (hasNickname) {
    ctx.fillStyle = "white";
    ctx.fillText(hoveredObject.nickname, x, y - 15);
  }

  if (hasDescription || hasLink) {
    ctx.fillStyle = "#aaa";
    ctx.fillText("click for more info", x, y + 5);
  }
}


// =====================
// CLICK EVENT
// =====================


canvas.addEventListener("click", () => {
  if (!hoveredObject) return;

  // Sprawdź, czy istnieje opis lub link
  const hasDescription =
    hoveredObject.description &&
    hoveredObject.description.trim() !== "";

  const hasLink =
    hoveredObject.link &&
    hoveredObject.link.trim() !== "";

  // Jeśli nie ma ani opisu, ani linku, nie otwieraj okna
  if (!hasDescription && !hasLink) {
    return;
  }

  document.getElementById("modal").style.display = "block";

  document.getElementById("mTitle").textContent =
    hoveredObject.nickname || hoveredObject.title;

  document.getElementById("mDesc").textContent =
    hoveredObject.description || "";

  const linkEl = document.getElementById("mLink");

  if (hasLink) {
    let url = hoveredObject.link;

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    linkEl.href = url;
    linkEl.textContent = "Open link";
    linkEl.style.display = "inline";
  } else {
    linkEl.href = "";
    linkEl.textContent = "";
    linkEl.style.display = "none";
  }
});


// =====================
// SEARCH NICKNAME
// =====================

function searchByNickname(name) {
  searchResults = world.objects.filter(
    o => o.nickname && o.nickname.toLowerCase() === name.toLowerCase()
  );

  searchIndex = 0;

  if (searchResults.length === 0) return;

  goToSearchResult(0);

  // pokaż NEXT jeśli więcej niż 1
  updateNextButton();
}


function goToSearchResult(index) {
  const obj = searchResults[index];
  if (!obj) return;

  const sx = worldToScreenX(obj.x, obj.y);
  const sy = worldToScreenY(obj.x, obj.y);

  cameraX = sx;
  cameraY = sy;

  clampCamera();

  startHighlight(obj);
}

function startHighlight(obj) {
  searchHighlight = {
    id: obj.id,
    time: 0
  };
}


document.getElementById("nextBtn").addEventListener("click", () => {
  searchIndex++;

  if (searchIndex >= searchResults.length) {
    searchIndex = 0; // albo ukryj
  }

  goToSearchResult(searchIndex);
});


function updateNextButton() {
  const btn = document.getElementById("nextBtn");

  if (searchResults.length > 1) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
}

document.getElementById("searchBtn").addEventListener("click", () => {
  const value = document.getElementById("searchInput").value;
  searchByNickname(value);
});

// =====================
// DRAW MAP
// =====================

function drawMap() {
  const w = world.grid.w;
  const h = world.grid.h;

  const top = {
    x: isoX(0, 0),
    y: isoY(0, 0)
  };

  const right = {
    x: isoX(w, 0),
    y: isoY(w, 0)
  };

  const bottom = {
    x: isoX(w, h),
    y: isoY(w, h)
  };

  const left = {
    x: isoX(0, h),
    y: isoY(0, h)
  };

  ctx.fillStyle = "#449444"; // ciemniejszy zielony

  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.lineTo(right.x, right.y);
  ctx.lineTo(bottom.x, bottom.y);
  ctx.lineTo(left.x, left.y);
  ctx.closePath();
  ctx.fill();
}


document.getElementById("fullscreenBtn").addEventListener("click", () => {
    const el = document.documentElement;

    if (!document.fullscreenElement) {
        el.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

// =====================
// START
// =====================

window.addEventListener("load", async () => {
  await loadWorld();

  centerCameraOnMap();
  render();

  // UI
  const closeBtn = document.getElementById("closeModal");
  const modal = document.getElementById("modal");

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
});

window.addEventListener("click", (e) => {
  const modal = document.getElementById("modal");

  if (e.target === modal) {
    modal.style.display = "none";
  }
});