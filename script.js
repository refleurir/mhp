// script.js
// DOM 요소 선택
const textButton = document.querySelector('.bg-blue-500.text-white.rounded-l-lg'); // Text 버튼
const soundButton = document.querySelector('.bg-gray-200.text-gray-800.rounded-r-lg'); // Sound 버튼
const searchButton = document.querySelector('.px-4.py-2.bg-blue-500.text-white.rounded-r-lg'); // Search 버튼
const micButton = document.querySelector('.bg-blue-500.text-white.p-4.rounded-full'); // Mic 버튼
const inputField = document.querySelector('input[type="text"]'); // 텍스트 입력 필드
const emotionSection = document.querySelector('.bg-white.p-4.rounded-lg.shadow-md'); // 결과 표시 영역

let mediaRecorder; // MediaRecorder 객체
let audioChunks = []; // 녹음 데이터 저장
let isRecording = false; // 녹음 상태 추적

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

// Mic 버튼으로 녹음 시작/중단
micButton.addEventListener('click', async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('음성 녹음을 지원하지 않습니다.');
    return;
  }

  if (isRecording) {
    // 녹음 중단
    mediaRecorder.stop();
    isRecording = false;
    micButton.textContent = 'Start Recording'; // 버튼 텍스트 변경
    alert('녹음이 종료되었습니다. 잠시만 기다려주세요.');
  } else {
    // 녹음 시작
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = []; // 이전 데이터 초기화

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data); // 데이터를 배열에 저장
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' }); // WAV 데이터 생성
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav'); // FormData에 파일 추가

        try {
          const response = await fetch('http://localhost:3000/sound-input', {
            method: 'POST',
            body: formData,
          });
          const data = await response.json();
          displayResponse(data.response);
        } catch (error) {
          console.error('Error uploading audio:', error);
        }
      };

      mediaRecorder.start(); // 녹음 시작
      isRecording = true;
      micButton.textContent = 'Stop Recording';
      alert('녹음이 시작되었습니다. 중단하려면 mic 버튼을 다시 누르세요.');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('마이크를 사용할 수 없습니다.');
    }
  }
});


// 결과 표시 함수
function displayResponse(responseText) {
  emotionSection.innerHTML = ''; //이전 결과 삭제
  const resultDiv = document.createElement('div');
  resultDiv.textContent = responseText;
  resultDiv.className = 'p-4 bg-gray-200 rounded-lg text-center mt-4';
  emotionSection.appendChild(resultDiv);
}
