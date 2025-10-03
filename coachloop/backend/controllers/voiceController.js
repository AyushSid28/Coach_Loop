const OpenAI = require('openai');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv');

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Configure multer for audio file uploads
const upload = multer({
    dest: 'uploads/audio/',
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid audio format. Supported: webm, mp4, mpeg, wav, ogg'), false);
        }
    }
});

/**
 * @desc Convert speech to text using OpenAI Whisper
 * @route POST /voice-input
 */
const speechToText = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No audio file provided'
            });
        }

        console.log('🎤 Processing audio file:', req.file.originalname);
        console.log('📁 File path:', req.file.path);
        console.log('📊 File size:', req.file.size, 'bytes');

        // Check if file exists and has content
        const stats = await fs.stat(req.file.path);
        if (stats.size === 0) {
            await fs.unlink(req.file.path); // Clean up empty file
            return res.status(400).json({
                success: false,
                error: 'Audio file is empty'
            });
        }

        // Create a readable stream for OpenAI
        const audioStream = await fs.readFile(req.file.path);
        
        // Transcribe audio using OpenAI Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: new File([audioStream], req.file.originalname, { type: req.file.mimetype }),
            model: 'whisper-1',
            language: 'en', // You can make this dynamic or auto-detect
            response_format: 'json'
        });

        // Clean up uploaded file
        await fs.unlink(req.file.path);

        console.log('✅ Transcription successful:', transcription.text);

        res.status(200).json({
            success: true,
            transcript: transcription.text,
            message: 'Speech transcribed successfully'
        });

    } catch (error) {
        console.error('❌ Speech-to-text error:', error);
        
        // Clean up file if it exists
        if (req.file && req.file.path) {
            try {
                await fs.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error cleaning up file:', unlinkError);
            }
        }

        res.status(500).json({
            success: false,
            error: 'Failed to process audio',
            message: error.message
        });
    }
};

/**
 * @desc Convert text to speech using OpenAI TTS
 * @route POST /stream-tts
 */
const textToSpeech = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No text provided for TTS'
            });
        }

        if (text.length > 4096) {
            return res.status(400).json({
                success: false,
                error: 'Text too long. Maximum 4096 characters allowed.'
            });
        }

        console.log('🔊 Generating TTS for text:', text.substring(0, 100) + '...');

        // Generate speech using OpenAI TTS
        const mp3 = await openai.audio.speech.create({
            model: 'tts-1',
            voice: 'alloy', // You can make this configurable: alloy, echo, fable, onyx, nova, shimmer
            input: text,
            response_format: 'mp3',
            speed: 1.0
        });

        // Convert to buffer
        const buffer = Buffer.from(await mp3.arrayBuffer());

        console.log('✅ TTS generation successful, audio size:', buffer.length, 'bytes');

        // Set appropriate headers for audio streaming
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': buffer.length,
            'Cache-Control': 'no-cache',
            'Accept-Ranges': 'bytes'
        });

        res.status(200).send(buffer);

    } catch (error) {
        console.error('❌ Text-to-speech error:', error);

        res.status(500).json({
            success: false,
            error: 'Failed to generate speech',
            message: error.message
        });
    }
};

/**
 * @desc Get available TTS voices
 * @route GET /tts-voices
 */
const getTTSVoices = async (req, res) => {
    try {
        const voices = [
            { id: 'alloy', name: 'Alloy', gender: 'neutral', description: 'Balanced and versatile' },
            { id: 'echo', name: 'Echo', gender: 'male', description: 'Warm and friendly' },
            { id: 'fable', name: 'Fable', gender: 'neutral', description: 'Expressive and dynamic' },
            { id: 'onyx', name: 'Onyx', gender: 'male', description: 'Deep and authoritative' },
            { id: 'nova', name: 'Nova', gender: 'female', description: 'Bright and energetic' },
            { id: 'shimmer', name: 'Shimmer', gender: 'female', description: 'Soft and gentle' }
        ];

        res.status(200).json({
            success: true,
            voices: voices,
            message: 'Available TTS voices retrieved successfully'
        });

    } catch (error) {
        console.error('❌ Error getting TTS voices:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get TTS voices',
            message: error.message
        });
    }
};

module.exports = {
    speechToText,
    textToSpeech,
    getTTSVoices,
    upload
};
