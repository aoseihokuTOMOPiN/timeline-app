// ====== 設定（ここを今後データ化していく想定） ======

// 年の刻み（まずは粗く）
const YEARS = [1000, 1100, 1200, 1300, 1400, 1500];

// 横レーン（= 中タブ相当）
const LANES = {
  japan: [
    { id: "heian", title: "平安時代レーン" },
    { id: "nanboku", title: "南北朝レーン" },
  ],
  world: [
    { id: "rome", title: "ローマ帝国レーン" },
    { id: "ottoman", title: "オスマン帝国レーン" },
  ],
};

// 年の左右ラベル（時代名/年号など）
// 今はダミー。あとで年表データから作る。
const ERA_LABELS = {
  japan: {
    1000: "平安（だいたい）",
    1100: "平安（後期）",
    1200: "鎌倉（入口）",
    1300: "鎌倉〜南北朝",
    1400: "室町（序盤）",
    1500: "戦国（入口）",
  },
  world: {
    1000: "中世",
    1100: "中世盛期",
    1200: "中世〜",
    1300: "中世後期",
    1400: "ルネサンス前後",
    1500: "近世入口",
  },
};

// 出来事（= 小タブ相当）
// year + side + lane で「どの年行のどのレーンに置くか」を決める
const EVENTS = [
  // Japan
  { title: "平安京遷都（ダミー）", year: 1000, side: "japan", lane: "heian", layer: 1, detail: "日本史の出来事詳細（ダミー）" },
  { title: "摂関政治（ダミー）", year: 1100, side: "japan", lane: "heian", layer: 2, detail: "レイヤー2の出来事（ダミー）" },
  { title: "南北朝分裂（ダミー）", year: 1300, side: "japan", lane: "nanboku", layer: 2, detail: "同年でもレーンが違えば横に展開できる" },
  { title: "明徳の和約（ダミー）", year: 1400, side: "japan", lane: "nanboku", layer: 3, detail: "レイヤー3の出来事（ダミー）" },

  // World
  { title: "西ローマ滅亡（ダミー）", year: 1000, side: "world", lane: "rome", layer: 3, detail: "世界史の出来事詳細（ダミー）" },
  { title: "コンスタンティノープル陥落（ダミー）", year: 1400, side: "world", lane: "ottoman", layer: 2, detail: "世界史の出来事（ダミー）" },
  { title: "タンジマート改革（ダミー）", year: 1500, side: "world", lane: "ottoman", layer: 3, detail: "レイヤー3（ダミー）" },
];

// ====== DOM生成 ======

const japanHeader = document.getElementById("japanHeader");
const worldHeader = document.getElementById("worldHeader");
const body = document.getElementById("timelineBody");

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function buildLaneHeader(side) {
  const target = side === "japan" ? japanHeader : worldHeader;
  target.innerHTML = "";
  LANES[side].forEach((ln) => {
    target.appendChild(el("div", "lane-title", ln.title));
  });
}

function buildRows() {
  body.innerHTML = "";
  YEARS.forEach((y) => {
    const row = el("div", "row");
    row.dataset.year = String(y);

    // 左ラベル
    const left = el("div", "cell left-era");
    left.textContent = ERA_LABELS.japan[y] ?? "";
    row.appendChild(left);

    // 年
    const yearCell = el("div", "cell year");
    yearCell.textContent = String(y);
    row.appendChild(yearCell);

    // 右ラベル
    const right = el("div", "cell right-era");
    right.textContent = ERA_LABELS.world[y] ?? "";
    row.appendChild(right);

    // 日本レーン群
    const japanGroup = el("div", "cell lanes japan-group");
    japanGroup.dataset.group = "japan";
    LANES.japan.forEach((ln) => {
      const lane = el("div", "lane");
      lane.dataset.side = "japan";
      lane.dataset.lane = ln.id;
      japanGroup.appendChild(lane);
    });
    row.appendChild(japanGroup);

    // 世界レーン群
    const worldGroup = el("div", "cell lanes world-group");
    worldGroup.dataset.group = "world";
    LANES.world.forEach((ln) => {
      const lane = el("div", "lane");
      lane.dataset.side = "world";
      lane.dataset.lane = ln.id;
      worldGroup.appendChild(lane);
    });
    row.appendChild(worldGroup);

    body.appendChild(row);
  });
}

function placeEvents() {
  EVENTS.forEach((ev) => {
    const row = body.querySelector(`.row[data-year="${ev.year}"]`);
    if (!row) return;
    const lane = row.querySelector(`.lane[data-side="${ev.side}"][data-lane="${ev.lane}"]`);
    if (!lane) return;

    const btn = el("button", `event layer-${ev.layer}`, ev.title);
    btn.type = "button";
    btn.dataset.title = ev.title;
    btn.dataset.detail = ev.detail ?? "";
    lane.appendChild(btn);
  });
}

// ====== レイヤーON/OFF ======

document.querySelectorAll(".layers input").forEach((cb) => {
  cb.addEventListener("change", () => {
    const layer = cb.dataset.layer;
    document.querySelectorAll(".layer-" + layer).forEach((node) => {
      node.style.display = cb.checked ? "" : "none";
    });
  });
});

// ====== 大タブ（スマホでは片側レーンだけ表示） ======

const tabs = document.querySelectorAll(".tab");

function setMajor(active) {
  // タブ表示
  tabs.forEach((t) => {
    const on = t.dataset.major === active;
    t.classList.toggle("active", on);
    t.setAttribute("aria-selected", on ? "true" : "false");
  });

  // スマホ幅だけレーン群を切替（年・左右ラベルは残る）
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const japanGroups = document.querySelectorAll('[data-group="japan"], #japanHeader');
  const worldGroups = document.querySelectorAll('[data-group="world"], #worldHeader');

  if (!isMobile) {
    japanGroups.forEach(n => n.classList.remove("hidden"));
    worldGroups.forEach(n => n.classList.remove("hidden"));
    return;
  }

  if (active === "japan") {
    japanGroups.forEach(n => n.classList.remove("hidden"));
    worldGroups.forEach(n => n.classList.add("hidden"));
  } else {
    japanGroups.forEach(n => n.classList.add("hidden"));
    worldGroups.forEach(n => n.classList.remove("hidden"));
  }
}

tabs.forEach((t) => t.addEventListener("click", () => setMajor(t.dataset.major)));
window.addEventListener("resize", () => {
  const active = document.querySelector(".tab.active")?.dataset.major || "japan";
  setMajor(active);
});

// ====== モーダル（小タブクリック） ======

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalClose = document.getElementById("modalClose");

function openModal(title, detail) {
  modalTitle.textContent = title || "出来事";
  modalText.textContent = detail || "ここに出来事の詳細、外部リンク、関連項目などを入れる想定（今はダミー）。";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal() {
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
buildLaneHeader("japan");
buildLaneHeader("world");
buildRows();
placeEvents();
setMajor("japan");
