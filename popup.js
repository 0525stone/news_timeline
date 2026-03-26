const STORAGE_KEY = 'news_articles';

const timelineEl = document.getElementById('timeline');
const emptyEl = document.getElementById('empty-state');
const tooltipEl = document.getElementById('tooltip');

// 날짜 포맷
function formatDate(isoStr) {
  const d = new Date(isoStr);
  if (isNaN(d)) return isoStr;
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

// 연표 렌더링
function render(articles) {
  timelineEl.innerHTML = '';

  if (!articles || articles.length === 0) {
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');

  articles.forEach(article => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.dataset.id = article.id;

    const source = article.source || 'CNN';
    item.innerHTML = `
      <div class="dot ${source === 'NAVER' ? 'dot--naver' : ''}"></div>
      <div class="card" data-summary="${escapeAttr(article.summary)}">
        <div class="card-meta">
          <span class="card-date">${formatDate(article.date)}</span>
          <span class="card-source card-source--${source.toLowerCase()}">${source === 'NAVER' ? '네이버' : 'CNN'}</span>
        </div>
        <div class="card-title">
          <a href="${escapeAttr(article.url)}" target="_blank">${escapeHtml(article.title)}</a>
        </div>
        <button class="card-delete" data-id="${article.id}" title="삭제">✕</button>
      </div>
    `;

    timelineEl.appendChild(item);
  });
}

// 툴팁 표시
function showTooltip(text, e) {
  tooltipEl.textContent = text;
  tooltipEl.classList.remove('hidden');
  positionTooltip(e);
}

function positionTooltip(e) {
  const margin = 10;
  const tw = tooltipEl.offsetWidth;
  const th = tooltipEl.offsetHeight;
  let x = e.clientX + margin;
  let y = e.clientY + margin;
  if (x + tw > window.innerWidth) x = e.clientX - tw - margin;
  if (y + th > window.innerHeight) y = e.clientY - th - margin;
  tooltipEl.style.left = x + 'px';
  tooltipEl.style.top = y + 'px';
}

function hideTooltip() {
  tooltipEl.classList.add('hidden');
}

// 이벤트 위임: 툴팁, 삭제, 링크
timelineEl.addEventListener('mouseover', e => {
  const card = e.target.closest('.card');
  if (card && !e.target.classList.contains('card-delete')) {
    const summary = card.dataset.summary;
    if (summary) showTooltip(summary, e);
  }
});

timelineEl.addEventListener('mousemove', e => {
  if (!tooltipEl.classList.contains('hidden')) positionTooltip(e);
});

timelineEl.addEventListener('mouseout', e => {
  const card = e.target.closest('.card');
  if (card) hideTooltip();
});

timelineEl.addEventListener('click', async e => {
  const deleteBtn = e.target.closest('.card-delete');
  if (!deleteBtn) return;
  e.stopPropagation();
  const id = deleteBtn.dataset.id;
  await deleteArticle(id);
});

// 기사 삭제
async function deleteArticle(id) {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const articles = (result[STORAGE_KEY] || []).filter(a => a.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: articles });
  render(articles);
}

// 전체 삭제
document.getElementById('btn-clear').addEventListener('click', async () => {
  if (!confirm('저장된 기사를 모두 삭제할까요?')) return;
  await chrome.storage.local.set({ [STORAGE_KEY]: [] });
  render([]);
});

// 설정 페이지 열기
document.getElementById('btn-options').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// storage 변경 감지 (백그라운드에서 새 기사 추가 시 실시간 반영)
chrome.storage.onChanged.addListener((changes) => {
  if (changes[STORAGE_KEY]) {
    render(changes[STORAGE_KEY].newValue || []);
  }
});

// 초기 로드
chrome.storage.local.get(STORAGE_KEY, result => {
  render(result[STORAGE_KEY] || []);
});

// 유틸
function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function escapeAttr(str) {
  return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
