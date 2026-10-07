(() => {
"use strict";

/* ───────── 공통 ───────── */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const H = 3600e3;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isMobile = () => matchMedia("(max-width:760px)").matches;
const kst = (t, withDate) => new Date(t).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false, ...(withDate ? { month: "2-digit", day: "2-digit" } : {}), hour: "2-digit", minute: "2-digit" });
const ago = t => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? "방금" : m < 60 ? `${m}분 전` : m < 1440 ? `${Math.round(m / 60)}시간 전` : `${Math.round(m / 1440)}일 전`; };
const lastPart = s => String(s || "").split(",").pop().trim();

async function getJSON(url, ms = 12000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 3500); }

/* ───────── 분류·레이어 정의 ───────── */
const CATS = {
  conflict: { ko: "분쟁·안보", c: "#ff4f4f" },
  diplo: { ko: "외교", c: "#4ea1ff" },
  econ: { ko: "경제", c: "#f2c94c" },
  disaster: { ko: "재난", c: "#b07cff" },
};
const LAYERS = [
  { grp: "뉴스" },
  { id: "conflict", name: "분쟁·안보", src: "GDELT", c: CATS.conflict.c, on: true },
  { id: "diplo", name: "외교", src: "GDELT", c: CATS.diplo.c, on: true },
  { id: "econ", name: "경제", src: "GDELT", c: CATS.econ.c, on: true },
  { id: "disaster", name: "재난", src: "GDELT", c: CATS.disaster.c, on: true },
  { id: "desk", name: "기자단 발행", src: "자체", c: "#f5a524", on: true },
  { grp: "실시간 관측" },
  { id: "quake", name: "지진 M2.5+", src: "USGS", c: "#ff7a45", on: true },
  { id: "nature", name: "자연재해", src: "NASA EONET", c: "#35d07f", on: true },
  { id: "air", name: "항공기", src: "OpenSky · 확대 시", c: "#9db4cc", on: false },
];
const on = Object.fromEntries(LAYERS.filter(l => l.id).map(l => [l.id, store.get("hz.layer." + l.id, l.on)]));
const status = {}; // id -> "load" | "ok" | "err" | "ex"
let winH = store.get("hz.win", 24);

/* ───────── 데이터 ───────── */
const data = { news: [], quake: [], nature: [], air: [], desk: store.get("hz.desk", []) };
let newsIsSample = false;

// 실데이터가 막혔을 때 쓰는 예시 기사. 화면에 '예시'로 표시된다.
const now0 = Date.now();
const SAMPLE = [
  ["conflict", "키이우", 50.45, 30.52, 0.3, 1, "[예시] 수도권 야간 드론 공습 경보, 방공망 가동"],
  ["conflict", "하르키우", 49.99, 36.23, 1.2, 0, "[예시] 북동부 전선 포격 이어져, 주거지 일부 피해"],
  ["conflict", "가자", 31.5, 34.47, 0.8, 1, "[예시] 남부 지역 공습 재개 보도"],
  ["conflict", "텔아비브", 32.08, 34.78, 2.5, 0, "[예시] 미사일 경보 발령 후 해제"],
  ["conflict", "홍해 남부", 14.5, 42.5, 3.4, 0, "[예시] 상선 인근 무인기 접근, 해군 대응"],
  ["conflict", "타이베이", 25.03, 121.56, 5.0, 0, "[예시] 해협 인근 군용기 활동 증가"],
  ["conflict", "하르툼", 15.5, 32.56, 9, 0, "[예시] 수도 외곽 교전 지속"],
  ["diplo", "브뤼셀", 50.85, 4.35, 1.5, 0, "[예시] 동맹국 국방장관 회의, 방공 지원 논의"],
  ["diplo", "베이징", 39.9, 116.4, 4, 0, "[예시] 외교부 정례 브리핑, 해상 훈련 관련 입장"],
  ["diplo", "워싱턴", 38.9, -77.04, 6, 0, "[예시] 국무장관, 중동 순방 일정 발표"],
  ["diplo", "서울", 37.57, 126.98, 7.5, 0, "[예시] 한미 외교차관 통화, 공조 확인"],
  ["diplo", "제네바", 46.2, 6.14, 20, 0, "[예시] 휴전 협상 실무 회의 재개"],
  ["econ", "싱가포르", 1.35, 103.82, 2, 0, "[예시] 해상 운임 지수 이틀째 상승"],
  ["econ", "프랑크푸르트", 50.11, 8.68, 5.5, 0, "[예시] ECB 위원, 추가 금리 조정 가능성 언급"],
  ["econ", "도쿄", 35.68, 139.69, 8, 0, "[예시] 엔화 약세에 수출주 강세"],
  ["econ", "리야드", 24.71, 46.68, 30, 0, "[예시] 산유국 감산 연장 검토"],
  ["disaster", "마닐라", 14.6, 120.98, 3, 1, "[예시] 태풍 접근, 북부 지역 대피령"],
  ["disaster", "카라치", 24.86, 67.0, 26, 0, "[예시] 폭우로 도심 침수"],
].map(([cat, place, lat, lon, hAgo, urgent, title], i) => ({
  id: "ex" + i, kind: "news", cat, place, lat, lon, t: now0 - hAgo * H, urgent: !!urgent, title,
  body: "데모용 예시 기사입니다. 실제 뉴스 연결(GDELT)이 막힌 환경에서만 표시됩니다.", sample: true,
}));

// GDELT GEO API: 분류별 키워드로 최근 기사 위치를 가져온다.
const GDELT_Q = {
  conflict: '(airstrike OR missile OR shelling OR "drone strike" OR troops OR clashes)',
  diplo: '(summit OR sanctions OR "foreign minister" OR ceasefire OR embassy)',
  econ: '("central bank" OR tariff OR "interest rate" OR "oil price" OR inflation)',
  disaster: '(flood OR wildfire OR hurricane OR typhoon OR cyclone OR landslide)',
};
function gdeltSpan(h) { return h <= 1 ? "1h" : h <= 6 ? "6h" : h <= 24 ? "24h" : "7d"; }
function parseGdelt(cat, j, fetchedAt) {
  const out = [];
  for (const f of (j && j.features) || []) {
    const g = f.geometry; if (!g || g.type !== "Point") continue;
    const [lon, lat] = g.coordinates; const p = f.properties || {};
    const tmp = document.createElement("div"); tmp.innerHTML = p.html || "";
    const links = $$("a", tmp).map(a => ({ url: a.getAttribute("href"), title: a.getAttribute("title") || a.textContent })).filter(a => a.url && a.title);
    const first = links[0];
    out.push({
      id: "g-" + cat + "-" + lat.toFixed(2) + "," + lon.toFixed(2), kind: "news", cat, lat, lon,
      place: p.name || "", t: fetchedAt, approx: true, count: p.count || links.length || 1,
      title: first ? first.title : (p.name || "보도"), url: first && first.url,
      links: links.slice(0, 6), body: "",
    });
  }
  return out;
}
let gdeltBusy = false;
async function loadNews() {
  if (gdeltBusy) return; gdeltBusy = true;
  const cats = Object.keys(GDELT_Q); cats.forEach(c => setStatus(c, "load"));
  const got = []; let anyOk = false;
  for (let i = 0; i < cats.length; i++) {
    const c = cats[i];
    try {
      const url = "https://api.gdeltproject.org/api/v2/geo/geo?query=" + encodeURIComponent(GDELT_Q[c]) + "&format=GeoJSON&timespan=" + gdeltSpan(winH) + "&maxpoints=120";
      got.push(...parseGdelt(c, await getJSON(url, 15000), Date.now()));
      anyOk = true; setStatus(c, "ok");
    } catch { setStatus(c, "err"); }
    if (i < cats.length - 1) await new Promise(r => setTimeout(r, 5200)); // GDELT 호출 간격 제한
  }
  gdeltBusy = false;
  if (anyOk && got.length) { data.news = got; newsIsSample = false; }
  else { data.news = SAMPLE; newsIsSample = true; cats.forEach(c => setStatus(c, "ex")); }
  refresh();
}

async function loadQuakes() {
  setStatus("quake", "load");
  try {
    const j = await getJSON("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson");
    data.quake = j.features.map(f => ({
      id: "q-" + f.id, kind: "quake", cat: "quake", lon: f.geometry.coordinates[0], lat: f.geometry.coordinates[1],
      depth: f.geometry.coordinates[2], mag: f.properties.mag || 0, t: f.properties.time, place: f.properties.place || "",
      title: `규모 ${(f.properties.mag || 0).toFixed(1)} 지진 — ${f.properties.place || "위치 미상"}`, url: f.properties.url,
      body: `진원 깊이 ${f.geometry.coordinates[2].toFixed(1)}km. ${f.properties.tsunami ? "쓰나미 정보 발표됨." : ""}`,
      urgent: (f.properties.mag || 0) >= 6,
    }));
    setStatus("quake", "ok");
  } catch { setStatus("quake", "err"); }
  refresh();
}

const EONET_KO = { wildfires: "산불", severeStorms: "폭풍", volcanoes: "화산", seaLakeIce: "해빙", floods: "홍수", earthquakes: "지진", drought: "가뭄", dustHaze: "황사·연무", landslides: "산사태", snow: "폭설", tempExtremes: "이상기온", waterColor: "수질" };
async function loadNature() {
  setStatus("nature", "load");
  try {
    const j = await getJSON("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&days=30&limit=400");
    data.nature = [];
    for (const e of j.events || []) {
      const g = (e.geometry || []).filter(x => x.type === "Point").pop(); if (!g) continue;
      const cat = (e.categories && e.categories[0]) || {};
      data.nature.push({
        id: "n-" + e.id, kind: "nature", cat: "nature", lon: g.coordinates[0], lat: g.coordinates[1], t: Date.parse(g.date),
        place: lastPart(e.title), title: `[${EONET_KO[cat.id] || cat.title || "재해"}] ${e.title}`,
        url: e.sources && e.sources[0] && e.sources[0].url, body: `NASA EONET 진행 중 이벤트. 분류: ${cat.title || "-"}.`,
      });
    }
    setStatus("nature", "ok");
  } catch { setStatus("nature", "err"); }
  refresh();
}

let airT = 0;
async function loadAir() {
  if (!on.air || !map) return;
  if (map.getZoom() < 3.2) { data.air = []; setStatus("air", "idle"); setCount("air", "확대"); refresh(); return; }
  const b = map.getBounds();
  const q = `lamin=${Math.max(-85, b.getSouth()).toFixed(2)}&lomin=${Math.max(-180, b.getWest()).toFixed(2)}&lamax=${Math.min(85, b.getNorth()).toFixed(2)}&lomax=${Math.min(180, b.getEast()).toFixed(2)}`;
  setStatus("air", "load");
  try {
    const j = await getJSON("https://opensky-network.org/api/states/all?" + q, 15000);
    data.air = (j.states || []).filter(s => s[5] != null && s[6] != null && !s[8]).slice(0, 4000).map(s => ({
      id: "a-" + s[0], kind: "air", lon: s[5], lat: s[6], track: s[10] || 0, call: (s[1] || "").trim(), country: s[2], alt: s[7], vel: s[9],
    }));
    setStatus("air", "ok");
  } catch { setStatus("air", "err"); }
  refresh();
}

/* ───────── 필터 ───────── */
let query = "";
function visible() {
  const since = Date.now() - winH * H;
  const q = query.trim().toLowerCase();
  const match = x => !q || (x.title + " " + x.place).toLowerCase().includes(q);
  const out = [];
  for (const x of data.news) if (on[x.cat] && (x.approx || x.t >= since) && match(x)) out.push(x);
  if (on.desk) for (const x of data.desk) if (x.t >= since && match(x)) out.push({ ...x, kind: "desk" });
  if (on.quake) for (const x of data.quake) if (x.t >= since && match(x)) out.push(x);
  if (on.nature) for (const x of data.nature) if (x.t >= since && match(x)) out.push(x);
  return out;
}

/* ───────── 지도 ───────── */
let map = null, mapReady = false, glyphs = false;
const fc = features => ({ type: "FeatureCollection", features });
const pt = (x, props) => ({ type: "Feature", geometry: { type: "Point", coordinates: [x.lon, x.lat] }, properties: { id: x.id, ...props } });

async function baseStyle() {
  try {
    const s = await getJSON("https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json", 7000);
    glyphs = !!s.glyphs;
    return s;
  } catch {
    // 지도 타일 서버에 닿지 못하면 내장 국경 데이터로 그린다.
    glyphs = false;
    return {
      version: 8,
      sources: { countries: { type: "geojson", data: "data/countries.geojson" } },
      layers: [
        { id: "bg", type: "background", paint: { "background-color": "#0b1522" } },
        { id: "land", type: "fill", source: "countries", paint: { "fill-color": "#1a2433" } },
        { id: "border", type: "line", source: "countries", paint: { "line-color": "#2c3b52", "line-width": 0.6 } },
      ],
    };
  }
}

function planeIcon() {
  const s = 32, c = document.createElement("canvas"); c.width = c.height = s; const g = c.getContext("2d");
  g.translate(s / 2, s / 2); g.fillStyle = "#9db4cc"; g.strokeStyle = "#0a0f17"; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(0, -12); g.lineTo(3, -3); g.lineTo(12, 2); g.lineTo(12, 4); g.lineTo(3, 2); g.lineTo(2, 9); g.lineTo(5, 11); g.lineTo(5, 12); g.lineTo(0, 11); g.lineTo(-5, 12); g.lineTo(-5, 11); g.lineTo(-2, 9); g.lineTo(-3, 2); g.lineTo(-12, 4); g.lineTo(-12, 2); g.lineTo(-3, -3); g.closePath(); g.stroke(); g.fill();
  return g.getImageData(0, 0, s, s);
}

async function initMap() {
  if (!window.maplibregl) { $("#map").innerHTML = '<p class="empty">지도 엔진을 불러오지 못했습니다. 새로고침해 주세요.</p>'; return; }
  const style = await baseStyle();
  style.projection = { type: "globe" };
  map = new maplibregl.Map({
    container: "map", style, center: [40, 30], zoom: isMobile() ? 0.9 : (innerWidth > 1300 ? 2.3 : 1.9), maxPitch: 60,
    attributionControl: { compact: true, customAttribution: "뉴스 GDELT · 지진 USGS · 재해 NASA EONET · 항공 OpenSky" },
  });
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
  map.on("load", () => {
    try { map.setProjection({ type: "globe" }); } catch {}
    try { map.setSky && map.setSky({ "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.6, 5, 0] }); } catch {}
    map.addImage("plane", planeIcon());
    map.addSource("news", {
      type: "geojson", data: fc([]), cluster: true, clusterRadius: 42, clusterMaxZoom: 7,
      clusterProperties: { urgent: ["+", ["case", ["get", "urgent"], 1, 0]] },
    });
    map.addSource("quake", { type: "geojson", data: fc([]) });
    map.addSource("nature", { type: "geojson", data: fc([]) });
    map.addSource("air", { type: "geojson", data: fc([]) });
    map.addSource("sel", { type: "geojson", data: fc([]) });

    map.addLayer({ id: "nature", type: "circle", source: "nature", paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 3.5, 6, 7], "circle-color": "#35d07f", "circle-opacity": 0.85,
      "circle-stroke-color": "#0a0f17", "circle-stroke-width": 1 } });
    map.addLayer({ id: "quake", type: "circle", source: "quake", paint: {
      "circle-radius": ["interpolate", ["linear"], ["get", "mag"], 2.5, 2.5, 5, 7, 7, 16],
      "circle-color": "#ff7a45", "circle-opacity": ["interpolate", ["linear"], ["get", "age"], 0, 0.95, 72, 0.35],
      "circle-stroke-color": "#ff7a45", "circle-stroke-opacity": 0.6, "circle-stroke-width": ["case", ["<", ["get", "age"], 6], 3, 0] } });
    map.addLayer({ id: "air", type: "symbol", source: "air", layout: {
      "icon-image": "plane", "icon-size": ["interpolate", ["linear"], ["zoom"], 3, 0.35, 8, 0.7], "icon-rotate": ["get", "track"],
      "icon-rotation-alignment": "map", "icon-allow-overlap": true } });
    map.addLayer({ id: "cluster", type: "circle", source: "news", filter: ["has", "point_count"], paint: {
      "circle-color": ["case", [">", ["get", "urgent"], 0], "#ff4f4f", "#f5a524"], "circle-opacity": 0.22,
      "circle-stroke-color": ["case", [">", ["get", "urgent"], 0], "#ff4f4f", "#f5a524"], "circle-stroke-width": 1.5,
      "circle-radius": ["interpolate", ["linear"], ["get", "point_count"], 2, 13, 20, 20, 100, 30] } });
    if (glyphs) map.addLayer({ id: "cluster-n", type: "symbol", source: "news", filter: ["has", "point_count"], layout: {
      "text-field": ["get", "point_count_abbreviated"], "text-size": 12, "text-font": ["Montserrat Medium", "Open Sans Bold", "Noto Sans Regular"] },
      paint: { "text-color": "#fff" } });
    map.addLayer({ id: "news-halo", type: "circle", source: "news", filter: ["all", ["!", ["has", "point_count"]], ["get", "urgent"]], paint: {
      "circle-radius": 14, "circle-color": ["get", "color"], "circle-opacity": 0.18 } });
    map.addLayer({ id: "news", type: "circle", source: "news", filter: ["!", ["has", "point_count"]], paint: {
      "circle-radius": ["case", ["get", "desk"], 8, 6], "circle-color": ["get", "color"],
      "circle-stroke-color": ["case", ["get", "desk"], "#ffffff", "#0a0f17"], "circle-stroke-width": ["case", ["get", "desk"], 2, 1.2] } });
    map.addLayer({ id: "sel", type: "circle", source: "sel", paint: { "circle-radius": 13, "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": "#ffffff", "circle-stroke-width": 2 } });

    for (const id of ["news", "quake", "nature", "cluster", "air"]) {
      map.on("mouseenter", id, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", id, () => (map.getCanvas().style.cursor = ""));
    }
    map.on("click", "cluster", async e => {
      const f = e.features[0];
      try { const z = await map.getSource("news").getClusterExpansionZoom(f.properties.cluster_id); map.easeTo({ center: f.geometry.coordinates, zoom: z + 0.3 }); } catch {}
    });
    map.on("click", e => {
      if (picking) { finishPick(e.lngLat); return; }
      const hits = map.queryRenderedFeatures(e.point, { layers: ["news", "quake", "nature", "air"].filter(l => map.getLayer(l)) });
      if (!hits.length) return;
      const f = hits[0];
      if (f.layer.id === "air") { showAir(f.properties, e.lngLat); return; }
      const x = byId(f.properties.id); if (x) select(x, false);
    });
    let mt; map.on("moveend", () => { clearTimeout(mt); mt = setTimeout(() => { if (on.air) loadAir(); }, 600); });
    mapReady = true; refresh(); spinIntro();
  });
}
function spinIntro() {
  if (reduceMotion) return;
  let stop = false; const end = () => (stop = true);
  map.once("mousedown", end); map.once("touchstart", end); map.once("wheel", end);
  const step = () => { if (stop || current) return; const c = map.getCenter(); c.lng += 0.6; map.easeTo({ center: c, duration: 1000, easing: t => t }); setTimeout(step, 1000); };
  setTimeout(step, 600);
}

function pushMap(list) {
  if (!mapReady) return;
  const nowT = Date.now();
  const news = [], quake = [], nature = [];
  for (const x of list) {
    if (x.kind === "quake") quake.push(pt(x, { mag: x.mag, age: (nowT - x.t) / H }));
    else if (x.kind === "nature") nature.push(pt(x, {}));
    else news.push(pt(x, { color: x.kind === "desk" ? "#f5a524" : CATS[x.cat].c, urgent: !!x.urgent, desk: x.kind === "desk" }));
  }
  map.getSource("news").setData(fc(news));
  map.getSource("quake").setData(fc(quake));
  map.getSource("nature").setData(fc(nature));
  map.getSource("air").setData(fc(on.air ? data.air.map(a => pt(a, { track: a.track, call: a.call, country: a.country, alt: a.alt, vel: a.vel })) : []));
  map.getSource("sel").setData(fc(current ? [pt(current, {})] : []));
}

/* ───────── 레이어 패널 ───────── */
function renderLayers() {
  $("#layers").innerHTML = LAYERS.map(l => l.grp ? `<li class="grp">${l.grp}</li>` :
    `<li><label class="layer" style="--c:${l.c}"><input type="checkbox" data-l="${l.id}" ${on[l.id] ? "checked" : ""}><span class="sw"></span>
      <span class="nm">${l.name}<small><i class="st" id="st-${l.id}"></i>${l.src}</small></span><span class="ct" id="ct-${l.id}">–</span></label></li>`).join("");
  for (const id in status) setStatus(id, status[id]);
}
function setStatus(id, s) {
  status[id] = s; const el = $("#st-" + id); if (!el) return;
  el.className = "st " + (s === "ok" ? "ok" : s === "err" ? "err" : s === "load" ? "load" : "");
  el.title = { ok: "연결됨", err: "연결 실패", load: "불러오는 중", ex: "예시 데이터", idle: "대기" }[s] || "";
}
function setCount(id, v) { const el = $("#ct-" + id); if (el) el.textContent = v; }
$("#layers").addEventListener("change", e => {
  const id = e.target.dataset.l; if (!id) return;
  on[id] = e.target.checked; store.set("hz.layer." + id, on[id]);
  if (id === "air") { if (on.air) loadAir(); else { data.air = []; setCount("air", "–"); } }
  refresh();
});
$$(".timewin button").forEach(b => {
  b.setAttribute("aria-pressed", String(+b.dataset.win === winH));
  b.addEventListener("click", () => {
    winH = +b.dataset.win; store.set("hz.win", winH);
    $$(".timewin button").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    refresh(); if (!newsIsSample) loadNews();
  });
});

/* ───────── 피드·랭킹·속보 ───────── */
let tab = "latest", current = null;
const byId = id => data.news.find(x => x.id === id) || data.quake.find(x => x.id === id) || data.nature.find(x => x.id === id) || (data.desk.find(x => x.id === id) && { ...data.desk.find(x => x.id === id), kind: "desk" });
const colorOf = x => x.kind === "desk" ? "#f5a524" : x.kind === "quake" ? "#ff7a45" : x.kind === "nature" ? "#35d07f" : CATS[x.cat].c;
const catName = x => x.kind === "desk" ? "기자단 · " + CATS[x.cat].ko : x.kind === "quake" ? "지진" : x.kind === "nature" ? "자연재해" : CATS[x.cat].ko;
const tagOf = x => x.kind === "desk" ? '<span class="tag-desk">기자단</span>' : x.sample ? '<span class="tag-ex">예시</span>' : '<span class="tag-live">LIVE</span>';
const timeOf = x => x.approx ? `<time>${gdeltSpan(winH).toUpperCase()} 내</time>` : `<time datetime="${new Date(x.t).toISOString()}">${ago(x.t)}</time>`;

function sortFeed(list) {
  return list.slice().sort((a, b) => {
    const ta = a.approx ? Date.now() - 1 * H - (1 / (a.count || 1)) : a.t, tb = b.approx ? Date.now() - 1 * H - (1 / (b.count || 1)) : b.t;
    return tb - ta;
  });
}
function renderFeed(list) {
  const feed = $("#feed");
  $("#feedCount").textContent = list.length;
  if (tab === "rank") return renderRank(list);
  const items = sortFeed(list).slice(0, 250);
  feed.innerHTML = items.length ? items.map(x => `<button class="fi${x.urgent ? " urgent" : ""}" data-id="${esc(x.id)}" aria-current="${current && current.id === x.id}" style="--c:${colorOf(x)}">
      <i class="bar-c"></i><h3>${esc(x.title)}</h3>
      <div class="m"><span>${esc(catName(x))}</span>${x.place ? `<span>${esc(lastPart(x.place) || x.place)}</span>` : ""}${timeOf(x)}${x.count > 1 ? `<span>기사 ${x.count}건</span>` : ""}${tagOf(x)}</div></button>`).join("")
    : `<p class="empty">조건에 맞는 항목이 없습니다. 시간 범위를 넓히거나 레이어를 켜 보세요.</p>`;
}
function renderRank(list) {
  const g = new Map();
  for (const x of list) {
    const k = lastPart(x.place) || "기타"; if (!g.has(k)) g.set(k, { k, n: 0, by: {}, lat: x.lat, lon: x.lon });
    const r = g.get(k), w = x.count || 1; r.n += w; const c = x.kind === "news" || x.kind === "desk" ? x.cat : x.kind; r.by[c] = (r.by[c] || 0) + w;
  }
  const rows = [...g.values()].sort((a, b) => b.n - a.n).slice(0, 30);
  const cc = { ...Object.fromEntries(Object.entries(CATS).map(([k, v]) => [k, v.c])), quake: "#ff7a45", nature: "#35d07f" };
  $("#feed").innerHTML = rows.length ? rows.map((r, i) => `<button class="rk" data-ll="${r.lon},${r.lat}"><span class="n">${String(i + 1).padStart(2, "0")}</span>
    <span><b>${esc(r.k)}</b><span class="bars">${Object.entries(r.by).map(([c, n]) => `<i style="--c:${cc[c]};width:${(n / r.n) * 100}%"></i>`).join("")}</span></span><span class="v">${r.n}</span></button>`).join("")
    : `<p class="empty">집계할 항목이 없습니다.</p>`;
}
$("#feed").addEventListener("click", e => {
  const b = e.target.closest(".fi"); if (b) { const x = byId(b.dataset.id); if (x) select(x, true); return; }
  const r = e.target.closest(".rk"); if (r && map) { const [lon, lat] = r.dataset.ll.split(",").map(Number); map.flyTo({ center: [lon, lat], zoom: 4, speed: 1.4 }); if (isMobile()) closePanels(); }
});
$$(".tabs button").forEach(b => b.addEventListener("click", () => { tab = b.dataset.tab; $$(".tabs button").forEach(x => x.setAttribute("aria-selected", String(x === b))); refresh(); }));
let qt; $("#search").addEventListener("input", e => { clearTimeout(qt); qt = setTimeout(() => { query = e.target.value; refresh(); }, 180); });

function renderTicker(list) {
  const since = Date.now() - 4 * H;
  let items = list.filter(x => !x.approx && x.t >= since && (x.urgent || x.kind === "desk" || (x.kind === "quake" && x.mag >= 4.5) || x.kind === "news"));
  if (items.length < 6) items = items.concat(list.filter(x => x.approx && x.cat === "conflict").sort((a, b) => b.count - a.count).slice(0, 8));
  items = sortFeed(items).slice(0, 14);
  const html = items.map(x => `<button data-id="${esc(x.id)}"><i class="st" style="background:${colorOf(x)}"></i><span>${esc(x.title)}</span><time>${x.approx ? "" : kst(x.t)}</time></button>`).join("");
  const run = $("#ticker");
  run.innerHTML = html ? html + html : '<span style="color:var(--muted)">최근 4시간 속보가 없습니다.</span>';
  run.style.setProperty("--dur", Math.max(30, items.length * 7) + "s");
}
$("#ticker").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const x = byId(b.dataset.id); if (x) { go("map"); select(x, true); } });

function renderStats(list) {
  const n = { news: 0, quake: 0, nature: 0 };
  for (const x of list) n[x.kind === "desk" ? "news" : x.kind]++;
  for (const c of Object.keys(CATS)) setCount(c, list.filter(x => x.kind === "news" && x.cat === c).reduce((s, x) => s + (x.count || 1), 0));
  setCount("desk", list.filter(x => x.kind === "desk").length);
  setCount("quake", n.quake); setCount("nature", n.nature);
  if (on.air && status.air !== "idle") setCount("air", data.air.length);
  $("#stats").innerHTML = `<span>뉴스 <b>${n.news}</b></span><span>지진 <b>${n.quake}</b></span><span>재해 <b>${n.nature}</b></span>${on.air ? `<span>항공 <b>${data.air.length}</b></span>` : ""}<span>갱신 <b>${kst(Date.now())}</b></span>`;
}

function refresh() {
  const list = visible();
  renderFeed(list); renderTicker(list); renderStats(list); pushMap(list);
}

/* ───────── 상세 카드 ───────── */
function select(x, fly) {
  current = x;
  const card = $("#card");
  const links = (x.links || []).slice(1);
  card.innerHTML = `<button class="icon-btn x" aria-label="닫기">✕</button>
    <div class="ch" style="--c:${colorOf(x)}"><span class="cat">${esc(catName(x))}</span>${tagOf(x)}<span class="mono">${x.lat.toFixed(2)}°, ${x.lon.toFixed(2)}°</span></div>
    <h3>${esc(x.title)}</h3>
    ${x.body ? `<p>${esc(x.body)}</p>` : ""}
    ${links.length ? `<p>${links.map(l => `· <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.title)}</a>`).join("<br>")}</p>` : ""}
    <div class="cf"><span>${esc(x.place || "")}${x.approx ? "" : " · " + kst(x.t, true) + " KST"}</span>${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">원문 보기 ↗</a>` : ""}</div>`;
  card.hidden = false;
  card.querySelector(".x").onclick = () => { card.hidden = true; current = null; refresh(); };
  if (fly && map) map.flyTo({ center: [x.lon, x.lat], zoom: Math.max(map.getZoom(), 4.2), speed: 1.3, essential: true });
  if (isMobile()) closePanels();
  refresh();
}
let airPop;
function showAir(p, ll) {
  airPop && airPop.remove();
  const html = `<b class="mono">${esc(p.call || "미식별")}</b><br>${esc(p.country || "")}<br><span class="mono">고도 ${p.alt ? Math.round(p.alt) + " m" : "-"} · ${p.vel ? Math.round(p.vel * 3.6) + " km/h" : "-"}</span>`;
  airPop = new maplibregl.Popup({ closeButton: false, offset: 10 }).setLngLat(ll).setHTML(html).addTo(map);
}

/* ───────── 모바일 패널 ───────── */
function closePanels() { $$(".panel").forEach(p => p.classList.remove("open")); }
$$("[data-open]").forEach(b => b.addEventListener("click", () => { closePanels(); $("#" + b.dataset.open).classList.add("open"); }));
$$("[data-close]").forEach(b => b.addEventListener("click", closePanels));

/* ───────── 라우팅 ───────── */
function go(v, push = true) {
  $$(".view").forEach(s => (s.hidden = s.dataset.view !== v));
  $$(".nav a").forEach(a => (a.dataset.view === v ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  $("#tickerBar").hidden = v !== "map";
  $("#views").style.top = v === "map" ? "" : "calc(var(--bar-h) + env(safe-area-inset-top,0px))";
  if (push && location.hash !== "#" + v) history.replaceState(null, "", "#" + v);
  if (v === "map" && map) setTimeout(() => map.resize(), 0);
  if (v === "markets") loadFx();
  if (v === "quiz") renderQuiz();
  if (v === "desk") renderMine();
}
$$(".nav a, .logo").forEach(a => a.addEventListener("click", e => { e.preventDefault(); go((a.dataset.view) || "map"); }));
window.addEventListener("hashchange", () => go(location.hash.slice(1) || "map", false));

/* ───────── 마켓 (Frankfurter 환율) ───────── */
let fxLoaded = false;
async function loadFx() {
  if (fxLoaded) return;
  const box = $("#fx"); box.innerHTML = '<p class="sub">불러오는 중…</p>';
  const d = new Date(Date.now() - 45 * 864e5).toISOString().slice(0, 10);
  const urls = [`https://api.frankfurter.dev/v1/${d}..?base=USD&symbols=KRW,JPY,EUR,CNY,GBP`, `https://api.frankfurter.app/${d}..?from=USD&to=KRW,JPY,EUR,CNY,GBP`];
  let j = null;
  for (const u of urls) { try { j = await getJSON(u); break; } catch {} }
  if (!j || !j.rates) { box.innerHTML = '<p class="sub">환율 서버에 연결하지 못했습니다. 잠시 후 다시 열어 주세요.</p>'; return; }
  fxLoaded = true;
  const days = Object.keys(j.rates).sort();
  const ser = f => days.map(k => f(j.rates[k])).filter(v => isFinite(v));
  const PAIRS = [
    ["USD/KRW", r => r.KRW, 1], ["JPY100/KRW", r => (r.KRW / r.JPY) * 100, 2], ["EUR/KRW", r => r.KRW / r.EUR, 1],
    ["EUR/USD", r => 1 / r.EUR, 4], ["USD/JPY", r => r.JPY, 2], ["USD/CNY", r => r.CNY, 4], ["GBP/USD", r => 1 / r.GBP, 4],
  ];
  box.innerHTML = PAIRS.map(([n, f, dp]) => {
    const s = ser(f).slice(-30); if (s.length < 2) return "";
    const last = s[s.length - 1], prev = s[s.length - 2], ch = ((last - prev) / prev) * 100;
    const mn = Math.min(...s), mx = Math.max(...s), W = 240, Hh = 56, pad = 4;
    const pts = s.map((v, i) => [pad + (i / (s.length - 1)) * (W - pad * 2), Hh - pad - ((v - mn) / (mx - mn || 1)) * (Hh - pad * 2)]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("");
    const col = ch >= 0 ? "var(--nature)" : "var(--conflict)";
    return `<div class="fxc"><span class="pair">${n}</span><span class="px">${last.toLocaleString("ko-KR", { minimumFractionDigits: dp, maximumFractionDigits: dp })}</span>
      <span class="chg ${ch >= 0 ? "up" : "dn"}">${ch >= 0 ? "▲" : "▼"} ${Math.abs(ch).toFixed(2)}% <span style="color:var(--dim)">전일 대비</span></span>
      <svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" aria-label="${n} 30일 추이"><path d="${line} L${W - pad} ${Hh} L${pad} ${Hh}Z" fill="${col}" opacity=".08"/><path d="${line}" fill="none" stroke="${col}" stroke-width="1.6" vector-effect="non-scaling-stroke"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="2.5" fill="${col}"/></svg>
      <span class="sub mono" style="font-size:11px">30일 범위 ${mn.toFixed(dp)} – ${mx.toFixed(dp)}</span></div>`;
  }).join("");
  $("#fxNote").textContent = `기준일 ${days[days.length - 1]} · 출처 Frankfurter(유럽중앙은행 고시환율)`;
}

/* ───────── 퀴즈 ───────── */
const QUIZ = [
  ["NATO 본부가 있는 도시는?", ["제네바", "브뤼셀", "빈", "헤이그"], 1, "NATO 본부는 벨기에 브뤼셀에 있습니다."],
  ["흑해와 마르마라해를 잇는 해협은?", ["보스포루스", "다르다넬스", "지브롤터", "말라카"], 0, "보스포루스 해협은 이스탄불을 관통해 흑해와 마르마라해를 잇습니다."],
  ["유엔 안전보장이사회 상임이사국 수는?", ["3개국", "5개국", "10개국", "15개국"], 1, "미국·영국·프랑스·러시아·중국 5개국입니다. 비상임이사국은 10개국입니다."],
  ["호르무즈 해협이 잇는 두 바다는?", ["홍해–아덴만", "페르시아만–오만만", "지중해–홍해", "카스피해–흑해"], 1, "세계 해상 원유 수송의 핵심 길목입니다."],
  ["유럽중앙은행(ECB) 본부가 있는 도시는?", ["파리", "브뤼셀", "프랑크푸르트", "룩셈부르크"], 2, "ECB는 독일 프랑크푸르트에 있습니다."],
  ["국제사법재판소(ICJ)가 있는 도시는?", ["헤이그", "제네바", "뉴욕", "스트라스부르"], 0, "ICJ는 네덜란드 헤이그 평화궁에 있습니다."],
  ["바브엘만데브 해협이 잇는 곳은?", ["홍해–아덴만", "지중해–대서양", "남중국해–자바해", "발트해–북해"], 0, "수에즈 운하로 이어지는 항로의 남쪽 관문입니다."],
  ["OPEC 사무국이 있는 도시는?", ["리야드", "빈", "두바이", "제네바"], 1, "OPEC 사무국은 오스트리아 빈에 있습니다."],
  ["대만 해협의 가장 좁은 곳 폭은 대략?", ["약 30km", "약 130km", "약 400km", "약 800km"], 1, "가장 좁은 곳이 약 130km입니다."],
  ["아프리카연합(AU) 본부가 있는 도시는?", ["나이로비", "아디스아바바", "카이로", "라고스"], 1, "AU 본부는 에티오피아 아디스아바바에 있습니다."],
];
const TITLES = [[0, "견습 관측자"], [100, "정세 분석가"], [300, "수석 분석관"], [700, "전략 참모"]];
let qs = store.get("hz.quiz", { xp: 0, streak: 0, best: 0, day: "", idx: 0, done: [] });
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
function todaysSet() { const d = +today().replace(/-/g, ""); return [0, 1, 2, 3, 4].map(i => (d + i * 3) % QUIZ.length).filter((v, i, a) => a.indexOf(v) === i); }
function titleOf(xp) { return TITLES.filter(t => xp >= t[0]).pop()[1]; }
function renderQuiz() {
  if (qs.day !== today()) { qs.day = today(); qs.idx = 0; qs.done = []; store.set("hz.quiz", qs); }
  const set = todaysSet();
  $("#qStat").innerHTML = `<div><small>XP</small><b>${qs.xp}</b></div><div><small>연속 정답</small><b>${qs.streak}</b></div><div><small>칭호</small><b style="font-size:15px;font-family:var(--f-body)">${titleOf(qs.xp)}</b></div>`;
  const box = $("#quiz");
  if (qs.idx >= set.length) {
    box.innerHTML = `<div class="qn"><span>오늘 완료</span><span>${qs.done.filter(Boolean).length}/${set.length} 정답</span></div><h3>오늘의 퀴즈를 모두 풀었습니다. 내일 새 문제가 열립니다.</h3>`;
  } else {
    const [q, opts] = QUIZ[set[qs.idx]];
    box.innerHTML = `<div class="qn"><span>문제 ${qs.idx + 1} / ${set.length}</span><span>정답 +10 XP · 연속 보너스</span></div><h3>${q}</h3>
      <div class="opts">${opts.map((o, i) => `<button data-i="${i}">${String.fromCharCode(65 + i)}. ${o}</button>`).join("")}</div><p class="expl" id="expl" hidden></p>`;
  }
  renderBoard();
}
$("#quiz").addEventListener("click", e => {
  const b = e.target.closest(".opts button"); if (!b) { if (e.target.id === "qNext") { qs.idx++; store.set("hz.quiz", qs); renderQuiz(); } return; }
  const set = todaysSet(); const [, , ans, ex] = QUIZ[set[qs.idx]]; const i = +b.dataset.i, ok = i === ans;
  $$(".opts button").forEach((x, j) => { x.disabled = true; if (j === ans) x.classList.add("right"); else if (j === i) x.classList.add("wrong"); });
  if (ok) { qs.streak++; qs.xp += 10 + Math.min(qs.streak - 1, 5) * 2; } else qs.streak = 0;
  qs.best = Math.max(qs.best, qs.streak); qs.done[qs.idx] = ok; store.set("hz.quiz", qs);
  const ep = $("#expl"); ep.hidden = false; ep.innerHTML = `<b style="color:${ok ? "var(--nature)" : "var(--conflict)"}">${ok ? "정답" : "오답"}</b> · ${ex} <button class="btn ghost" id="qNext" style="margin-left:8px;padding:4px 10px">다음</button>`;
  $("#qStat").innerHTML = `<div><small>XP</small><b>${qs.xp}</b></div><div><small>연속 정답</small><b>${qs.streak}</b></div><div><small>칭호</small><b style="font-size:15px;font-family:var(--f-body)">${titleOf(qs.xp)}</b></div>`;
  renderBoard();
});
function renderBoard() {
  const rows = [["예시·분석가A", 860], ["예시·관측자B", 540], ["예시·참모C", 410], ["예시·기자D", 220], ["나", qs.xp]].sort((a, b) => b[1] - a[1]);
  $("#board").innerHTML = rows.map(([n, x], i) => `<li class="${n === "나" ? "me" : ""}"><span class="r">${i + 1}</span><span>${n}</span><span class="t">${titleOf(x)}</span><span class="x">${x}</span></li>`).join("");
}

/* ───────── 기자단 ───────── */
$("#dCat").innerHTML = Object.entries(CATS).map(([k, v]) => `<option value="${k}">${v.ko}</option>`).join("");
let picking = false, pickLL = null;
$("#pickLoc").addEventListener("click", () => { picking = true; go("map"); $("#pickbar").hidden = false; closePanels(); });
$("#pickCancel").addEventListener("click", () => { picking = false; $("#pickbar").hidden = true; go("desk"); });
function finishPick(ll) {
  picking = false; $("#pickbar").hidden = true; pickLL = { lat: +ll.lat.toFixed(4), lon: +(((ll.lng + 540) % 360) - 180).toFixed(4) };
  $("#dLoc").value = `${pickLL.lat}, ${pickLL.lon}`; go("desk"); toast("위치를 지정했습니다.");
}
$("#deskForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!pickLL) { $("#dMsg").textContent = "지도에서 위치를 먼저 찍어 주세요."; return; }
  const a = { id: "d" + Date.now(), cat: $("#dCat").value, urgent: $("#dUrg").value === "1", title: $("#dTitle").value.trim(), place: $("#dPlace").value.trim(),
    body: $("#dBody").value.trim(), url: $("#dUrl").value.trim() || undefined, lat: pickLL.lat, lon: pickLL.lon, t: Date.now() };
  data.desk.push(a); store.set("hz.desk", data.desk);
  e.target.reset(); pickLL = null; $("#dMsg").textContent = "발행했습니다.";
  renderMine(); refresh(); go("map"); select({ ...a, kind: "desk" }, true); toast("발행 완료 — 라이브 맵에 표시됩니다.");
});
function renderMine() {
  const l = data.desk.slice().reverse();
  $("#mine").innerHTML = l.length ? l.map(a => `<li><b>${esc(a.title)}</b><span class="m"><span>${CATS[a.cat].ko}</span><span>${esc(a.place)}</span><span class="mono">${kst(a.t, true)}</span>${a.urgent ? '<span class="tag-ex">속보</span>' : ""}<button data-show="${a.id}">지도에서 보기</button><button data-del="${a.id}">삭제</button></span></li>`).join("")
    : '<li class="sub">아직 발행한 기사가 없습니다.</li>';
}
$("#mine").addEventListener("click", e => {
  const s = e.target.dataset.show, d = e.target.dataset.del;
  if (s) { go("map"); select(byId(s), true); }
  if (d) { data.desk = data.desk.filter(a => a.id !== d); store.set("hz.desk", data.desk); renderMine(); refresh(); toast("삭제했습니다."); }
});

/* ───────── 시계·시작 ───────── */
function tick() { const d = new Date(); $("#cUtc").textContent = "UTC " + d.toISOString().slice(11, 16); $("#cKst").textContent = "KST " + kst(d); }
tick(); setInterval(tick, 10000);

renderLayers();
go(location.hash.slice(1) || "map", false);
initMap();
loadQuakes(); loadNature(); loadNews();
setInterval(loadQuakes, 5 * 60e3); setInterval(loadNature, 30 * 60e3); setInterval(loadNews, 15 * 60e3);
setInterval(() => { if (on.air) loadAir(); }, 60e3);
setInterval(() => { if (!$("#v-map").hidden) refresh(); }, 60e3);
})();
