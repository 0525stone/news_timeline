// Service Worker: 기사 저장 및 Claude API를 이용한 요약 생성

const STORAGE_KEY = 'cnn_articles';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ARTICLE_FOUND') {
    handleArticle(message.payload);
  }
  return false;
});

async function handleArticle(article) {
  const { url, title, date, body } = article;

  // 이미 저장된 기사인지 확인
  const stored = await getArticles();
  if (stored.find(a => a.url === url)) return;

  // 요약 생성 (API 키가 없으면 extractive 요약 사용)
  const summary = await generateSummary(title, body);

  const newArticle = {
    id: Date.now().toString(),
    title,
    date,
    url,
    summary,
    savedAt: new Date().toISOString()
  };

  stored.push(newArticle);
  // 날짜 기준 정렬
  stored.sort((a, b) => new Date(a.date) - new Date(b.date));

  await chrome.storage.local.set({ [STORAGE_KEY]: stored });
}

async function generateSummary(title, body) {
  const { claude_api_key } = await chrome.storage.local.get('claude_api_key');

  if (claude_api_key) {
    return await claudeSummary(title, body, claude_api_key);
  }
  return extractiveSummary(body);
}

async function claudeSummary(title, body, apiKey) {
  const truncated = body.slice(0, 3000); // 토큰 절약
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `다음 뉴스 기사를 핵심 내용 위주로 5줄 이내로 한국어로 요약해줘.\n\n제목: ${title}\n\n본문:\n${truncated}\n\n요약:`
          }
        ]
      })
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.content[0].text.trim();
  } catch (e) {
    console.error('Claude API error:', e);
    return extractiveSummary(body);
  }
}

function extractiveSummary(body) {
  // API 키 없을 때: 앞 5문장 추출
  const sentences = body
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
  return sentences.slice(0, 5).join(' ');
}

async function getArticles() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] || [];
}
