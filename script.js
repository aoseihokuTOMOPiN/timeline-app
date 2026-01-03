// ====== デモデータ（あとで収集データに差し替えるところ） ======

const YEARS = [1000, 1100, 1200, 1300, 1400, 1500];

// 出来事：国は持たせてるけど「国=レーン固定」には使わない
// 同じ年の出来事は「左から順に詰めて」Lane1, Lane2...に入る
const EVENTS = [
  // Japan
  { title: "日本：出来事A（ダミー）", year: 1100, side: "japan", layer: 1, country: "日本", detail: "詳細ダミー" },
  { title: "日本：出来事B（ダミー）", year: 1100, side: "japan", layer: 2, country: "日本", detail: "同年2件→Lane2へ" },
  { title: "日本：出来事C（ダミー）", year: 1100, side: "japan", layer: 3, country: "日本", detail: "同年3件→Lane3へ" },
  { title: "日本：出来事D（ダミー）", year: 1400, side: "japan", layer: 2, country: "日本", detail: "別年" },

  // World
  { title: "世界：出来事X（ローマ）", year: 1100, side: "world", layer: 1, country: "ローマ帝国", detail: "詳細ダミー" },
  { title: "世界：出来事Y（オスマン）", year: 1100, side: "world", layer: 2, country: "オスマン帝国", detail: "同年2件→Lane2へ" },
  { title: "世界：出来事Z（イギリス）", year: 1100, side: "world", layer: 3, country: "イギリス", detail: "同年3件→Lane3へ" },
  { title: "世界：出来事W（ダミー）", year: 1500, side: "world", layer: 2, country: "オスマン帝国", detail: "別年" },
];

// ====== ユーティリティ ======

const body = document.getElementById("timelineBody");
const japanHeader = document.getElementById("japanHeader");
const worldHeader = document.getElementById("worldHeader");

function el(tag, className, text){
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

// ====== レーン数（詰め結果の最大）を算出 ======

function calcMaxLanes(side){
  // 年ごとの件数の最大 = 必要なレーン数
  const counts = new Map(); // year -> count
  EVENTS.filter(e => e.side === side).forEach(e => {
    const k = e.year;
    counts.set(k, (counts.get(k) || 0) + 1);
  });
  let max = 1;
  counts.forEach(v => { if (v > max) max = v; });
  return Math.min(Math.max(max, 1), 4); // 今はLane4までに制限
}

let maxJapanLanes = calcMaxLanes("japan");
let maxWorldLanes = calcMaxLanes("world");

// ====== ヘッダー生成（Lane1/2/3...） ======

function buildHeader(side, maxLanes){
  const wrap = el("div", "lane-titles");
  wrap.style.setProperty("--lanes", String(maxLanes));

  for (let i = 1; i <= maxLanes; i++){
    wrap.appendChild(el("div", "lane-title", `Lane${i}`));
  }

  if (side === "japan"){
    japanHeader.innerHTML = "";
    japanHeader.appendChild(wrap);
  } else {
    worldHeader.innerHTML = "";
    worldHeader.appendChild(wrap);
  }
}

// ====== 行（年）生成 ======

function buildRows(){
  body.innerHTML = "";

  YEARS.forEach(year => {
    const row = el("div", "row");
    row.dataset.year = String(year);

    // 左（日本史レーン群）
    const left = el("div", "side-cell");
    left.dataset.side = "japan";

    const japanLanes = el("div", "lanes");
    japanLanes.style.setProperty("--lanes", String(maxJapanLanes));

    for (let i = 1; i <= maxJapanLanes; i++){
      const lane = el("div", "lane");
      lane.dataset.lane = String(i);
      lane.dataset.side = "japan";
      japanLanes.appendChild(lane);
    }

    left.appendChild(japanLanes);

    // 中（年）
    const mid = el("div", "year-cell", String(year));

    // 右（世界史レーン群）
    const right = el("div", "side-cell");
    right.dataset.side = "world";

    const worldLanes = el("div", "lanes");
    worldLanes.style.setProperty("--lanes", String(maxWorldLanes));

    for (let i = 1; i <= maxWorldLanes; i++){
      const lane = el("div", "lane");
      lane.dataset.lane = String(i);
      lane.dataset.side = "world";
      worldLanes.appendChild(lane);
    }

    right.appendChild(worldLanes);

    row.appendChild(left);
    row.appendChild(mid);
    row.appendChild(right);

    body.appendChild(row);
  });
}

// ====== 出来事を「詰めて」配置 ======

function placeEvents(){
  // 同じ年・同じsideの出来事をまとめて、並び順にLane1,2,3...へ
  const byKey = new Map(); // key = side|year -> events[]
  EVENTS.forEach(ev => {
    const key = `${ev.side}|${ev.year}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(ev);
  });

  byKey.forEach((list, key) => {
    // ここで「国ごとの固定」にはしない。単純に詰める。
    // （必要なら並び順のルールを後で追加できる）
    list.forEach((ev, idx) => {
      const laneIndex = idx + 1; // Lane1から
      const row = body.querySelector(`.row[data-year="${ev.year}"]`);
      if (!row) return;

      const lane = row.querySelector(`.lane[data-side="${ev.side}"][data-lane="${laneIndex}"]`);
      if (!lane) return;

      const btn = el("button", `event layer-${ev.layer}`, ev.title);
      btn.type = "button";
      btn.dataset.title = ev.title;
      btn.dataset.detail = ev.detail || "";
      btn.dataset.country = ev.country || "";
      lane.appendChild(btn);
    });
  });
}

// ====== レイヤーON/OFF ======

document.querySelectorAll(".layers input").forEach(cb => {
  cb.addEventListener("change", () => {
    const layer = cb.dataset.layer;
    document.querySelectorAll(".layer-" + layer).forEach(node => {
      node.style.display = cb.checked ? "" : "none";
    });
  });
});

// ====== レーンON/OFF（Lane2,3,4を丸ごと消す） ======

function applyLaneToggles(){
  const enabled = new Set();
  document.querySelectorAll('.lane-toggles input').forEach(cb => {
    if (cb.checked) enabled.add(cb.dataset.lane);
  });

  // ヘッダー Lane 表示切替
  [japanHeader, worldHeader].forEach(h => {
    const titles = h.querySelectorAll(".lane-title");
    titles.forEach((t, i) => {
      const laneNum = String(i + 1);
      t.classList.toggle("lane-off", !enabled.has(laneNum));
    });
  });

  // 各行の lane 列を切替
  body.querySelectorAll(".lane").forEach(l => {
    const laneNum = l.dataset.lane;
    l.classList.toggle("lane-off", !enabled.has(laneNum));
  });
}

document.querySelectorAll('.lane-toggles input').forEach(cb => {
  cb.addEventListener("change", applyLaneToggles);
});

// ====== 大タブ（スマホで片側表示） ======

const tabs = document.querySelectorAll(".tab");

function setMajor(active){
  tabs.forEach(t => {
    const on = t.dataset.major === active;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (!isMobile){
    // PC：両方表示
    japanHeader.classList.remove("is-hidden");
    worldHeader.classList.remove("is-hidden");
    body.querySelectorAll('.side-cell[data-side="japan"]').forEach(n => n.classList.remove("is-hidden"));
    body.querySelectorAll('.side-cell[data-side="world"]').forEach(n => n.classList.remove("is-hidden"));
    return;
  }

  // スマホ：片側 + 年
  if (active === "japan"){
    japanHeader.classList.remove("is-hidden");
    worldHeader.classList.add("is-hidden");
    body.querySelectorAll('.side-cell[data-side="japan"]').forEach(n => n.classList.remove("is-hidden"));
    body.querySelectorAll('.side-cell[data-side="world"]').forEach(n => n.classList.add("is-hidden"));
  } else {
    japanHeader.classList.add("is-hidden");
    worldHeader.classList.remove("is-hidden");
    body.querySelectorAll('.side-cell[data-side="japan"]').forEach(n => n.classList.add("is-hidden"));
    body.querySelectorAll('.side-cell[data-side="world"]').forEach(n => n.classList.remove("is-hidden"));
  }
}

tabs.forEach(t => t.addEventListener("click", () => setMajor(t.dataset.major)));
window.addEventListener("resize", () => {
  const active = document.querySelector(".tab.active")?.dataset.major || "japan";
  setMajor(active);
});

// ====== モーダル ======

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalClose = document.getElementById("modalClose");

function openModal(title, detail){
  modalTitle.textContent = title || "出来事";
  modalText.textContent = detail || "（詳細は未入力）";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".event");
  if (!btn) return;
  openModal(btn.dataset.title, btn.dataset.detail);
});

// ====== 起動 ======
buildHeader("japan", maxJapanLanes);
buildHeader("world", maxWorldLanes);
buildRows();
placeEvents();
applyLaneToggles();
setMajor("japan");
