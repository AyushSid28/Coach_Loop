import os
import re
import json

# Base directory (current script location)
base_dir = os.path.dirname(os.path.abspath(__file__))

# Paths
extracted_video_folder = os.path.join(base_dir, "extracted_video", "transcriptions")
cleaned_video_folder = os.path.join(base_dir, "cleaned_video")

# ✅ Ensure cleaned_video_folder exists
os.makedirs(cleaned_video_folder, exist_ok=True)

# Common filler words to remove
FILLER_WORDS = ["uh", "um", "you know", "like", "so", "actually", "basically", "right", "okay"]

# Function to clean video transcript text
def clean_text(text):
    # Remove timestamps (e.g., "00:00" or "[00:00]")
    text = re.sub(r"\d{1,2}:\d{2}(:\d{2})?", "", text)
    text = re.sub(r"\[\d{1,2}:\d{2}\]", "", text)
    text = re.sub(r"-->\s*\d{1,2}:\d{2}", "", text)

    # Remove excessive spaces and new lines
    text = re.sub(r"\n+", "\n", text).strip()
    
    # Remove filler words
    for word in FILLER_WORDS:
        text = re.sub(rf"\b{word}\b", "", text, flags=re.IGNORECASE)

    # Fix broken lines (continuous sentences)
    text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)

    return text

# Function to format text into JSONL for fine-tuning
def format_text(text):
    chunks = []
    sentences = text.split(". ")
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) < 1500:  # Keep within token limits
            current_chunk += sentence + ". "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + ". "

    if current_chunk:
        chunks.append(current_chunk.strip())

    # Convert into JSONL format
    formatted_data = []
    for chunk in chunks:
        formatted_data.append({
            "messages": [
                {"role": "user", "content": "Explain this concept in detail."},
                {"role": "assistant", "content": chunk}
            ]
        })

    return formatted_data

# ✅ Process all extracted video transcript files
if not os.path.exists(extracted_video_folder):
    print(f"❌ Error: Folder '{extracted_video_folder}' does not exist!")
    exit(1)

for filename in os.listdir(extracted_video_folder):
    file_path = os.path.join(extracted_video_folder, filename)

    if os.path.isfile(file_path) and filename.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            raw_text = f.read().strip()
        
        if not raw_text:
            print(f"⚠️ Skipping empty file: {filename}")
            continue

        # Clean and format text
        cleaned_text = clean_text(raw_text)
        formatted_data = format_text(cleaned_text)

        # Save cleaned text
        cleaned_filepath = os.path.join(cleaned_video_folder, filename)
        with open(cleaned_filepath, "w", encoding="utf-8") as f:
            f.write(cleaned_text)

        # Save structured JSONL format
        # jsonl_filepath = os.path.join(cleaned_video_folder, f"{os.path.splitext(filename)[0]}.jsonl")
        # with open(jsonl_filepath, "w", encoding="utf-8") as f:
        #     for entry in formatted_data:
        #         f.write(json.dumps(entry) + "\n")

        print(f"✅ Processed & saved: {filename}")

print("🎉 Video transcripts cleaned & formatted successfully!")
