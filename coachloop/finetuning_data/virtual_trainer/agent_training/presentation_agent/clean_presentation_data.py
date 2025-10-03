import os
import json
import re

# Define paths
base_dir = os.path.dirname(os.path.abspath(__file__))
extracted_text_folder = os.path.join(base_dir, "extracted_text")  # Folder containing raw extracted text
cleaned_text_folder = os.path.join(base_dir, "cleaned_text")  # Folder to save cleaned text & JSONL files

# Ensure cleaned_text folder exists
os.makedirs(cleaned_text_folder, exist_ok=True)

def clean_text(text):
    """ Function to clean extracted text. """
    text = text.strip()
    text = re.sub(r'\s+', ' ', text)  # Remove extra spaces/newlines
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # Remove non-ASCII characters
    return text

def process_files():
    if not os.path.exists(extracted_text_folder):
        print(f"❌ Error: Folder '{extracted_text_folder}' does not exist! Please check your data.")
        return

    files_processed = 0

    for filename in os.listdir(extracted_text_folder):
        if filename.endswith(".txt"):  # Only process text files
            input_file_path = os.path.join(extracted_text_folder, filename)
            cleaned_file_path = os.path.join(cleaned_text_folder, filename)  # Save cleaned .txt
            jsonl_file_path = os.path.join(cleaned_text_folder, filename.replace(".txt", ".jsonl"))  # JSONL file

            # Read extracted text
            with open(input_file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Clean the content
            cleaned_content = clean_text(content)

            if cleaned_content:
                # Save cleaned text as a separate file
                with open(cleaned_file_path, "w", encoding="utf-8") as cleaned_file:
                    cleaned_file.write(cleaned_content)

                # Save as a separate JSONL file
                # jsonl_entry = {"prompt": "Presentation training example:", "completion": cleaned_content}
                # with open(jsonl_file_path, "w", encoding="utf-8") as jsonl_file:
                #     json.dump(jsonl_entry, jsonl_file)
                #     jsonl_file.write("\n")

                # files_processed += 1

    print(f"🎉 Presentation Training: {files_processed} files cleaned & JSONL files generated! 🚀")
    print(f"✅ Cleaned text files in: cleaned_text/")
    print(f"✅ Separate JSONL files in: cleaned_text/")

if __name__ == "__main__":
    process_files()
