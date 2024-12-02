// script.js
// DOM 요소 선택
const textButton = document.querySelector('.bg-blue-500.text-white.rounded-l-lg'); // Text 버튼
const soundButton = document.querySelector('.bg-gray-200.text-gray-800.rounded-r-lg'); // Sound 버튼
const searchButton = document.querySelector('.px-4.py-2.bg-blue-500.text-white.rounded-r-lg'); // Search 버튼
const micButton = document.querySelector('.bg-blue-500.text-white.p-4.rounded-full'); // Mic 버튼
const inputField = document.querySelector('input[type="text"]'); // 텍스트 입력 필드
const emotionSection = document.querySelector('.bg-white.p-4.rounded-lg.shadow-md'); // 결과 표시 영역

// Text 버튼 이벤트
textButton.addEventListener('click', () => {
  alert('텍스트 입력');
  inputField.focus();
});

// Sound 버튼 이벤트
soundButton.addEventListener('click', () => {
  alert('음성 입력');
});

// Search 버튼 이벤트
searchButton.addEventListener('click', async () => {
  const userInput = inputField.value.trim();
  if (!userInput) {
    alert('텍스트를 입력하세요');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/text-input', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userInput }),
    });
    const data = await response.json();
    displayResponse(data.response);
  } catch (error) {
    console.error('Error fetching text input:', error);
  }
});

// Mic 버튼 이벤트
micButton.addEventListener('click', () => {
  alert('음성 입력 기능.');
});

// 결과 표시 함수
function displayResponse(responseText) {
  const resultDiv = document.createElement('div');
  resultDiv.textContent = responseText;
  resultDiv.className = 'p-4 bg-gray-200 rounded-lg text-center mt-4';
  emotionSection.appendChild(resultDiv);
}

}