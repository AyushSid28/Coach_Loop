import os
import openai
import shutil
from moviepy.editor import VideoFileClip
from dotenv import load_dotenv

# Load API key from environment variables or .env file
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

if not openai.api_key:
    raise ValueError("⚠️ OpenAI API key not found! Set OPENAI_API_KEY as an environment variable.")

# Define directories
video_folder = "../supporting_videos"  # Adjust path if necessary
output_folder = "./transcriptions"  # Store extracted transcripts here

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

# Get all video files
video_files = [f for f in os.listdir(video_folder) if f.lower().endswith((".mp4", ".mkv", ".avi", ".mov"))]

for video_file in video_files:
    video_path = os.path.join(video_folder, video_file)
    audio_path = os.path.join(output_folder, f"{os.path.splitext(video_file)[0]}.mp3")
    transcript_path = os.path.join(output_folder, f"{os.path.splitext(video_file)[0]}.txt")

    print(f"🎥 Processing: {video_file}")

    # Extract audio from video
    try:
        video = VideoFileClip(video_path)
        if not video.audio:
            print(f"⚠️ No audio found in {video_file}, skipping...")
            continue

        print(f"🔊 Extracting audio from {video_file}...")
        video.audio.write_audiofile(audio_path, codec="mp3")
    except Exception as e:
        print(f"❌ Error extracting audio from {video_file}: {e}")
        continue

    # Transcribe using Whisper API
    try:
        print(f"📝 Transcribing {video_file} with Whisper API...")
        with open(audio_path, "rb") as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)

        # Save transcript
        with open(transcript_path, "w", encoding="utf-8") as f:
            f.write(transcript["text"])

        print(f"✅ Transcription saved: {transcript_path}")

    except Exception as e:
        print(f"❌ Error transcribing {video_file}: {e}")

    # Cleanup: Remove temporary audio file
    try:
        os.remove(audio_path)
    except Exception as e:
        print(f"⚠️ Could not delete temporary audio file {audio_path}: {e}")

print("🎉 All videos processed successfully!")
