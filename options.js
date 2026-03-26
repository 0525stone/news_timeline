const input = document.getElementById('api-key');
const status = document.getElementById('status');

// 저장된 키 불러오기
chrome.storage.local.get('claude_api_key', result => {
  if (result.claude_api_key) {
    input.value = result.claude_api_key;
  }
});

document.getElementById('btn-save').addEventListener('click', () => {
  const key = input.value.trim();
  chrome.storage.local.set({ claude_api_key: key }, () => {
    status.textContent = key ? '✓ API 키가 저장되었습니다.' : '✓ API 키가 삭제되었습니다.';
    setTimeout(() => { status.textContent = ''; }, 3000);
  });
});

document.getElementById('btn-toggle').addEventListener('click', () => {
  input.type = input.type === 'password' ? 'text' : 'password';
});
