import os
from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI
from dotenv import load_dotenv
from io import BytesIO
from virtual_coach_response import virtual_coach_response, bot
import soundfile as sf
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if not client.api_key:
    logger.error("OpenAI API key is missing")
    raise HTTPException(status_code=500, detail="OpenAI API key is missing")

# Pydantic models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_input: str
    conversation_history: List[Message]
    current_step: int
    use_voice_output: bool = False

class ChatResponse(BaseModel):
    response: str
    conversation_history: List[Message]
    current_step: int

# Health check endpoint
@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    return {"status": "healthy", "message": "FastAPI server is running"}

# Stream TTS endpoint
@app.post("/stream-tts")
async def stream_tts(request: Request):
    logger.debug("Received request for /stream-tts")
    try:
        data = await request.json()
        text = data.get("text")
        
        if not text:
            logger.error("No text provided for TTS")
            raise HTTPException(status_code=400, detail="No text provided")
        
        logger.info(f"Generating TTS for text: {text[:50]}...")
        response = client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=text,
            response_format="mp3"
        )
        
        audio_buffer = BytesIO(response.read())
        audio_buffer.seek(0)
        
        logger.info("Streaming TTS response")
        return StreamingResponse(
            audio_buffer,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=tts.mp3",
                "Cache-Control": "no-cache"
            }
        )
    except Exception as e:
        logger.error(f"TTS error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

# Chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    logger.debug("Received request for /chat")
    try:
        bot.conversation_history["messages"] = [{"role": msg.role, "content": msg.content} for msg in request.conversation_history]
        bot.current_step = request.current_step

        if bot.is_summarization_request(request.user_input):
            summary = bot.summarize_conversation()
            logger.info(f"Generated summary: {summary[:100]}...")
            
            updated_history = request.conversation_history + [
                Message(role="user", content=request.user_input),
                Message(role="assistant", content=summary)
            ]

            return ChatResponse(
                response=summary,
                conversation_history=updated_history,
                current_step=request.current_step
            )

        ai_response = virtual_coach_response(
            conversation_history=[{"role": msg.role, "content": msg.content} for msg in request.conversation_history],
            user_input=request.user_input,
            current_step=request.current_step
        )

        updated_history = request.conversation_history + [
            Message(role="user", content=request.user_input),
            Message(role="assistant", content=ai_response)
        ]

        next_step = request.current_step + 1 if request.current_step < 10 else request.current_step

        return ChatResponse(
            response=ai_response,
            conversation_history=updated_history,
            current_step=next_step
        )
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

# Voice input endpoint
@app.post("/voice-input")
async def voice_input(file: UploadFile = File(...)):
    logger.debug(f"Received voice input: {file.filename}, content_type: {file.content_type}")
    try:
        # Verify audio file
        if not file.content_type.startswith('audio/'):
            logger.error("Invalid file type for voice input")
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Read audio data into memory
        audio_data = await file.read()
        if not audio_data:
            logger.error("Empty audio file received")
            raise HTTPException(status_code=400, detail="Empty audio file")
        
        # Convert to WAV format for Whisper compatibility
        audio_buffer = BytesIO(audio_data)
        try:
            with sf.SoundFile(audio_buffer, 'r') as audio_file:
                data, samplerate = audio_file.read(), audio_file.samplerate
                logger.debug(f"Audio read: samplerate={samplerate}, data_shape={data.shape}")
        except Exception as e:
            logger.error(f"Error reading audio file: {str(e)}", exc_info=True)
            raise HTTPException(status_code=400, detail=f"Unsupported audio format: {str(e)}. Please use WAV, MP3, or WebM.")
        
        wav_buffer = BytesIO()
        sf.write(wav_buffer, data, samplerate, format='WAV')
        wav_buffer.seek(0)
        
        logger.info("Transcribing audio with Whisper")
        try:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=wav_buffer,
                response_format="text"
            )
        except Exception as e:
            logger.error(f"Whisper API error: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Whisper API error: {str(e)}")
        
        logger.info(f"Transcription: {transcript[:100]}...")
        return {"transcript": transcript.strip()}
    except Exception as e:
        logger.error(f"Voice input error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Voice input error: {str(e)}")
    finally:
        await file.close()

# Reset conversation endpoint
@app.post("/reset")
async def reset_conversation():
    logger.debug("Received request for /reset")
    try:
        bot.reset_session()
        return {
            "conversation_history": [],
            "current_step": 1,
            "response": "Conversation reset successfully"
        }
    except Exception as e:
        logger.error(f"Reset error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Reset error: {str(e)}")