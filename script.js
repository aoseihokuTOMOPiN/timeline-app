// レイヤーON/OFF
document.querySelectorAll('.layers input').forEach(cb => {
  cb.addEventListener('change', () => {
    const layer = cb.dataset.layer;
    document.querySelectorAll('.layer-' + layer).forEach(el => {
      el.style.display = cb.checked ? '' : 'none';
    });
  });
});

// 大タブ（日本史/世界史）切替：スマホで片側表示
const tabs = document.querySelectorAll('.tab');
const majors = document.querySelectorAll('.major');

function setMajor(active) {
  majors.forEach(sec => {
    const isActive = sec.dataset.major === active;
    // 画面が狭いときだけ片側を隠す（PCでは両方見せる）
    if (window.matchMedia('(max-width: 768px)').matches) {
      sec.style.display = isActive ? '' : 'none';
    } else {
      sec.style.display = '';
    }
  });

  tabs.forEach(t => {
    const isOn = t.dataset.major === active;
    t.classList.toggle('active', isOn);
    t.setAttribute('aria-selected', isOn ? 'true' : 'false');
  });
}

tabs.forEach(t => {
  t.addEventListener('click', () => setMajor(t.dataset.major));
});

// 初期状態：日本史
setMajor('japan');

// 画面回転/幅変更でも崩れないように
window.addEventListener('resize', () => {
  const active = document.querySelector('.tab.active')?.dataset.major || 'japan';
  setMajor(active);
});

// 小タブ（出来事）→ モーダル
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');

function openModal(title) {
  modalTitle.textContent = title || '出来事';
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.event').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.title));
});

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
