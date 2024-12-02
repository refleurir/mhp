const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware 설정
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Multer 설정 (음성 파일 업로드용)
const upload = multer({ dest: 'uploads/' });

// OpenAI GPT API 호출 함수
async function callGptAPI(prompt) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('GPT API Error:', error.response?.data || error.message);
    return 'GPT 응답을 처리할 수 없습니다.';
  }
}

// 텍스트 입력 처리 엔드포인트
app.post('/text-input', async (req, res) => {
  const userInput = req.body.text;
  if (!userInput) {
    return res.status(400).json({ error: '텍스트 입력이 필요합니다.' });
  }

  const gptResponse = await callGptAPI(userInput);
  res.json({ response: gptResponse });
});

// 음성 입력 처리 엔드포인트
app.post('/sound-input', upload.single('audio'), async (req, res) => {
  const audioFilePath = req.file.path;

  try {
    // Google Speech-to-Text API 호출
    const sttResponse = await axios.post(
      'https://speech.googleapis.com/v1/speech:recognize',
      {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'en-US',
        },
        audio: {
          content: Buffer.from(audioFilePath).toString('base64'),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GOOGLE_API_KEY}`,
        },
      }
    );

    const transcript = sttResponse.data.results[0].alternatives[0].transcript;
    const gptResponse = await callGptAPI(transcript);
    res.json({ response: gptResponse });
  } catch (error) {
    console.error('STT API Error:', error.response?.data || error.message);
    res.status(500).json({ error: '음성을 처리할 수 없습니다.' });
  }
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
