const express = require('express');
const router = express.Router();
const { speechToText, textToSpeech, getTTSVoices, upload } = require('../controllers/voiceController');

// Speech-to-Text endpoint
router.post('/voice-input', upload.single('file'), speechToText);

// Text-to-Speech endpoint
router.post('/stream-tts', textToSpeech);

// Get available TTS voices
router.get('/tts-voices', getTTSVoices);

module.exports = router;
