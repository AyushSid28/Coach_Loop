import os
import re
import json

# Get the base directory (should be virtual_coach/)
base_dir = os.path.dirname(os.path.abspath(__file__))

# ✅ Corrected Paths Based on Updated Structure
extracted_text_folder = os.path.join(base_dir, "extracted_text", "extracted_text")  # New Path!
cleaned_text_folder = os.path.join(base_dir, "cleaned_text")      

# 🔍 Debugging: Print detected paths
print(f"🔍 Script Running From: {base_dir}")
print(f"🔍 Looking for extracted_text at: {extracted_text_folder}")

# ✅ Check if extracted_text_folder exists
if not os.path.exists(extracted_text_folder):
    print(f"⚠️ ERROR: No extracted_text folder found at {extracted_text_folder}!")
    exit(1)  # Stop execution
else:
    print("✅ extracted_text folder FOUND! 🚀")

# ✅ Ensure cleaned_text_folder exists
os.makedirs(cleaned_text_folder, exist_ok=True)

# Function to clean extracted text
def clean_text(text):
    text = re.sub(r"\d{1,2}:\d{2}(:\d{2})?", "", text)  # Remove timestamps
    text = re.sub(r"\[\d{1,2}:\d{2}\]", "", text)        # Remove [00:00] format
    text = re.sub(r"Page \d+", "", text)                # Remove page numbers
    text = re.sub(r"\n+", "\n", text).strip()           # Remove extra newlines
    text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)        # Fix broken lines
    return text

# Function to structure text for fine-tuning
def format_text(text):
    chunks = []
    sentences = text.split(". ")
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) < 1500:  # Keep it within token limits
            current_chunk += sentence + ". "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + ". "

    if current_chunk:
        chunks.append(current_chunk.strip())

    formatted_data = []
    for chunk in chunks:
        formatted_data.append({
            "messages": [
                {"role": "user", "content": "Teach me about this topic."},
                {"role": "assistant", "content": chunk}
            ]
        })

    return formatted_data

# Process all extracted text files
for filename in os.listdir(extracted_text_folder):
    file_path = os.path.join(extracted_text_folder, filename)

    if os.path.isfile(file_path) and filename.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            raw_text = f.read()
        
        cleaned_text = clean_text(raw_text)
        formatted_data = format_text(cleaned_text)

        # Save cleaned text
        cleaned_filepath = os.path.join(cleaned_text_folder, filename)
        with open(cleaned_filepath, "w", encoding="utf-8") as f:
            f.write(cleaned_text)
        
        # Save structured JSONL format for fine-tuning
        # jsonl_filepath = os.path.join(cleaned_text_folder, f"{os.path.splitext(filename)[0]}.jsonl")
        # with open(jsonl_filepath, "w", encoding="utf-8") as f:
        #     for entry in formatted_data:
        #         f.write(json.dumps(entry) + "\n")

        print(f"✅ Processed & saved: {filename}")

print("🎉 Virtual Coach transcripts cleaned & formatted successfully! 🚀")
