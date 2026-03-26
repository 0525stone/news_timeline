// CNN 기사 페이지에서 제목, 날짜, 본문을 추출하는 content script

function isArticlePage() {
  // CNN 기사 페이지 판별: h1 태그와 기사 본문이 있는지 확인
  const hasHeadline = document.querySelector(
    'h1.headline__text, h1[data-editable="headlineText"], .article__title h1, h1.pg-headline'
  );
  const hasBody = document.querySelector(
    '.article__content, .body-text, [data-component-name="paragraph"]'
  );
  return !!(hasHeadline && hasBody);
}

function extractTitle() {
  const selectors = [
    'h1.headline__text',
    'h1[data-editable="headlineText"]',
    '.article__title h1',
    'h1.pg-headline',
    'h1'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim()) return el.innerText.trim();
  }
  return document.title;
}

function extractDate() {
  // 다양한 CNN 날짜 표기 방식 처리
  const selectors = [
    'div[data-type="date"]',
    '.timestamp',
    'time[datetime]',
    '.article__date',
    '[data-editable="timestamp"]'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const dt = el.getAttribute('datetime') || el.innerText.trim();
    if (dt) {
      const parsed = new Date(dt);
      if (!isNaN(parsed)) return parsed.toISOString();
    }
  }
  // fallback: 현재 시각
  return new Date().toISOString();
}

function extractBody() {
  const selectors = [
    '.article__content',
    '.body-text',
    '[data-component-name="paragraph"]',
    '.zn-body__paragraph'
  ];
  const paragraphs = [];
  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    if (els.length > 0) {
      els.forEach(el => {
        const text = el.innerText.trim();
        if (text.length > 40) paragraphs.push(text);
      });
      break;
    }
  }
  return paragraphs.join('\n\n');
}

function run() {
  if (!isArticlePage()) return;

  const title = extractTitle();
  const date = extractDate();
  const body = extractBody();
  const url = window.location.href;

  if (!title || !body) return;

  chrome.runtime.sendMessage({
    type: 'ARTICLE_FOUND',
    payload: { title, date, url, body }
  });
}

// DOM 로딩 완료 후 실행 (SPA 대응)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
