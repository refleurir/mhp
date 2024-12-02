// script.js
// DOM 요소 선택
const textButton = document.querySelector('.bg-blue-500.text-white.rounded-l-lg'); // Text 버튼
const soundButton = document.querySelector('.bg-gray-200.text-gray-800.rounded-r-lg'); // Sound 버튼
const searchButton = document.querySelector('.px-4.py-2.bg-blue-500.text-white.rounded-r-lg'); // Search 버튼
const micButton = document.querySelector('.bg-blue-500.text-white.p-4.rounded-full'); // Mic 버튼
const inputField = document.querySelector('input[type="text"]'); // 텍스트 입력 필드
const emotionSection = document.querySelector('.bg-white.p-4.rounded-lg.shadow-md'); // 결과 표시 영역

let isTextMode = true;
let mediaRecorder; // MediaRecorder 객체
let audioChunks = []; // 녹음 데이터 저장
let isRecording = false; // 녹음 상태 추적

// 감정 설명 데이터
const emotionDescriptions = {
  Hope: 'Hope is the feeling of expectation and desire for a certain thing to happen.',
  Love: 'Love is a profound and caring affection toward someone or something.',
  Happiness: 'Happiness is a state of well-being and contentment.',
  Rage: 'Rage is an intense and uncontrolled anger.',
  Sadness: 'Sadness is an emotional pain associated with loss, despair, or helplessness.',
  Fear: 'Fear is an unpleasant emotion caused by the threat of danger or harm.',
};

// 팝업 생성 함수
function createPopup(emotion, description) {
  // 컨테이너
  const popup = document.createElement('div');
  popup.className =
    'fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50';
  popup.id = 'emotion-popup';

  // 팝업 내용
  const popupContent = document.createElement('div');
  popupContent.className =
    'bg-white p-6 rounded-lg shadow-lg w-1/3 relative text-center';

  // 제목
  const title = document.createElement('h2');
  title.className = 'text-xl font-bold mb-4';
  title.textContent = emotion;

  // 설명
  const descriptionText = document.createElement('p');
  descriptionText.className = 'text-gray-700 mb-4';
  descriptionText.textContent = description;

  // 닫기 버튼
  const closeButton = document.createElement('button');
  closeButton.className =
    'absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center';
  closeButton.innerHTML = '×';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(popup);
  });

  // 팝업 구성
  popupContent.appendChild(title);
  popupContent.appendChild(descriptionText);
  popupContent.appendChild(closeButton);
  popup.appendChild(popupContent);

  document.body.appendChild(popup);
}

// 감정 버튼 클릭 이벤트
emotionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const emotion = button.textContent; 
    const description = emotionDescriptions[emotion]; 
    createPopup(emotion, description); 
  });
});

// 버튼 및 필드 상태 업데이트 함수
function updateModeVisibility() {
  if (isTextMode) {
    inputField.style.display = 'block';
    searchButton.style.display = 'block';
    micButton.style.display = 'none';
  } else {
    inputField.style.display = 'none';
    searchButton.style.display = 'none';
    micButton.style.display = 'block';
  }
}

// 버튼 색상 업데이트 함수
function updateButtonStyles() {
  if (isTextMode) {
    textButton.classList.add('bg-blue-500', 'text-white');
    textButton.classList.remove('bg-gray-200', 'text-gray-800');

    soundButton.classList.add('bg-gray-200', 'text-gray-800');
    soundButton.classList.remove('bg-blue-500', 'text-white');
  } else {
    soundButton.classList.add('bg-blue-500', 'text-white');
    soundButton.classList.remove('bg-gray-200', 'text-gray-800');

    textButton.classList.add('bg-gray-200', 'text-gray-800');
    textButton.classList.remove('bg-blue-500', 'text-white');
  }
}

// Text 버튼 이벤트
textButton.addEventListener('click', () => {
  isTextMode = true;
  updateButtonStyles();
  updateModeVisibility();
  alert('텍스트 입력');
  inputField.focus();
});

// Sound 버튼 이벤트
soundButton.addEventListener('click', () => {
  isTextMode = false;
  updateButtonStyles();
  updateModeVisibility();
  alert('음성 입력');
});

// Search 버튼 클릭 이벤트
searchButton.addEventListener('click', async () => {
  const userInput = inputField.value.trim();
  if (!userInput) {
    alert('텍스트를 입력하세요!');
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
  //emotionSection.innerHTML = ''; //이전 결과 삭제
  const resultDiv = document.createElement('div');
  resultDiv.textContent = responseText;
  resultDiv.className = 'p-4 bg-gray-200 rounded-lg text-center mt-4';
  emotionSection.appendChild(resultDiv);
}
