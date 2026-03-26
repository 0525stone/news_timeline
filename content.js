// 뉴스 기사 페이지에서 제목, 날짜, 본문을 추출하는 content script
// 지원 사이트: CNN, 네이버 뉴스

function detectSite() {
  const host = window.location.hostname;
  if (host.includes('cnn.com')) return 'CNN';
  if (host.includes('naver.com')) return 'NAVER';
  return null;
}

// ─── CNN ────────────────────────────────────────────────────────────────────

function cnn_isArticlePage() {
  const hasHeadline = document.querySelector(
    'h1.headline__text, h1[data-editable="headlineText"], .article__title h1, h1.pg-headline'
  );
  const hasBody = document.querySelector(
    '.article__content, .body-text, [data-component-name="paragraph"]'
  );
  return !!(hasHeadline && hasBody);
}

function cnn_extractTitle() {
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

function cnn_extractDate() {
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
  return new Date().toISOString();
}

function cnn_extractBody() {
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

// ─── 네이버 뉴스 ─────────────────────────────────────────────────────────────

function naver_isArticlePage() {
  const hasTitle = document.querySelector(
    '#title_area h2, h2#articleTitle, .media_end_head_headline'
  );
  const hasBody = document.querySelector(
    '#dic_area, #articleBodyContents, ._article_body_contents'
  );
  return !!(hasTitle && hasBody);
}

function naver_extractTitle() {
  const selectors = [
    '#title_area h2',
    '.media_end_head_headline',
    'h2#articleTitle',
    'h2'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText.trim()) return el.innerText.trim();
  }
  return document.title;
}

function naver_extractDate() {
  // data-date-time 속성에 ISO 형식 날짜가 있음
  const selectors = [
    '._ARTICLE_DATE_TIME[data-date-time]',
    '.media_end_head_info_datestamp_time[data-date-time]',
    'span.t11[data-date-time]'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    const dt = el.getAttribute('data-date-time') || el.innerText.trim();
    if (dt) {
      const parsed = new Date(dt);
      if (!isNaN(parsed)) return parsed.toISOString();
    }
  }
  // fallback: <em class="go_trans _ARTICLE_DATE_TIME"> 등 텍스트 파싱
  const emEl = document.querySelector('.media_end_head_info_datestamp_time');
  if (emEl && emEl.innerText.trim()) {
    const parsed = new Date(emEl.innerText.trim());
    if (!isNaN(parsed)) return parsed.toISOString();
  }
  return new Date().toISOString();
}

function naver_extractBody() {
  const selectors = [
    '#dic_area',
    '#articleBodyContents',
    '._article_body_contents'
  ];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (!el) continue;
    // 광고·스크립트 텍스트 제거
    const clone = el.cloneNode(true);
    clone.querySelectorAll('script, style, .ad_wrap, .artcle_add').forEach(n => n.remove());
    const text = clone.innerText.trim();
    if (text.length > 40) return text;
  }
  return '';
}

// ─── 공통 실행 ────────────────────────────────────────────────────────────────

function run() {
  const site = detectSite();
  if (!site) return;

  let title, date, body;

  if (site === 'CNN') {
    if (!cnn_isArticlePage()) return;
    title = cnn_extractTitle();
    date  = cnn_extractDate();
    body  = cnn_extractBody();
  } else if (site === 'NAVER') {
    if (!naver_isArticlePage()) return;
    title = naver_extractTitle();
    date  = naver_extractDate();
    body  = naver_extractBody();
  }

  if (!title || !body) return;

  chrome.runtime.sendMessage({
    type: 'ARTICLE_FOUND',
    payload: { title, date, url: window.location.href, body, source: site }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
