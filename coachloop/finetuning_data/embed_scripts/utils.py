import os
import openai
import numpy as np
import faiss
import csv
from tqdm import tqdm

# Set OpenAI API Key (Ensure it's set in your environment variables)
openai.api_key = os.getenv("OPENAI_API_KEY")

# Constants
MAX_TOKENS = 8192
CHUNK_SIZE = 750
OVERLAP = 150

# Function to split text into overlapping chunks
def split_text_into_chunks(text, chunk_size=CHUNK_SIZE, overlap=OVERLAP):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks

# Function to load and chunk text files
def load_and_chunk_texts(folder_path):
    text_chunks, metadata = [], []

    if not os.path.exists(folder_path):
        print(f"⚠️ Directory not found: {folder_path}")
        return text_chunks, metadata

    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)

        if os.path.isfile(file_path) and filename.endswith(".txt"):
            with open(file_path, "r", encoding="utf-8") as file:
                text = file.read().strip()
                if len(text.split()) > CHUNK_SIZE:
                    chunks = split_text_into_chunks(text)
                    text_chunks.extend(chunks)
                    metadata.extend([{"filename": filename, "text": chunk} for chunk in chunks])
                else:
                    text_chunks.append(text)
                    metadata.append({"filename": filename, "text": text})

    return text_chunks, metadata

# Function to get OpenAI embeddings
def get_openai_embedding(text):
    try:
        response = openai.embeddings.create(
            input=text,
            model="text-embedding-ada-002"
        )
        embedding_data = response.model_dump()
        return embedding_data["data"][0]["embedding"]
    except Exception as e:
        print(f"❌ Error generating embedding: {e}")
        return None

# Function to create FAISS index for different training agents
def create_faiss_index(training_type):
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    AGENT_PATHS = {
        "negotiation_sales": "negotiation_sales_agent",
        "presentation": "presentation_agent",
        "behavior_training": "behavior_training"
    }

    if training_type not in AGENT_PATHS:
        print("❌ Invalid training type! Use 'negotiation_sales', 'presentation', or 'behavior_training'.")
        return

    TEXT_FOLDER = os.path.abspath(os.path.join(BASE_DIR, f"../virtual_trainer/agent_training/{AGENT_PATHS[training_type]}/cleaned_text"))
    INDEX_DIR = os.path.join(BASE_DIR, "indexes", f"vt_{training_type}")

    print(f"\n📂 Checking text folder: {TEXT_FOLDER}")

    if not os.path.exists(TEXT_FOLDER):
        print(f"❌ Error: Folder '{TEXT_FOLDER}' does not exist! Please check the path.")
        return

    texts, metadata = load_and_chunk_texts(TEXT_FOLDER)
    if not texts:
        print("❌ No valid text files found! Exiting...")
        return

    print(f"📂 Found {len(texts)} text chunks in {training_type}. Generating embeddings...")

    embeddings, metadata_list = [], []
    for meta in tqdm(metadata, total=len(metadata), desc=f"Generating Embeddings for {training_type}"):
        embedding = get_openai_embedding(meta["text"])
        if embedding is not None:
            embeddings.append(embedding)
            metadata_list.append(meta)

    if not embeddings:
        print("❌ No embeddings generated! Exiting...")
        return

    embeddings = np.array(embeddings, dtype=np.float32)

    if embeddings.shape[0] > 0:
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)
    else:
        print("❌ No embeddings to add to FAISS index! Exiting...")
        return

    os.makedirs(INDEX_DIR, exist_ok=True)

    INDEX_FILE = os.path.join(INDEX_DIR, f"faiss_index_vt_{training_type}.index")
    METADATA_FILE = os.path.join(INDEX_DIR, f"metadata_vt_{training_type}.npy")
    CSV_FILE = os.path.join(INDEX_DIR, f"embeddings_vt_{training_type}.csv")

    faiss.write_index(index, INDEX_FILE)
    print(f"✅ FAISS index saved at: {INDEX_FILE}")

    np.save(METADATA_FILE, np.array(metadata_list, dtype=object))
    print(f"✅ Metadata saved at: {METADATA_FILE}")

    with open(CSV_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Filename", "Text"] + [f"Dim_{i}" for i in range(len(embeddings[0]))])
        for meta, embed in zip(metadata_list, embeddings):
            writer.writerow([meta["filename"], meta["text"]] + list(embed))

    print(f"✅ Embeddings saved in CSV format at: {CSV_FILE}")

if __name__ == "__main__":
    for agent in ["negotiation_sales", "presentation", "behavior_training"]:
        print(f"\n🚀 Creating FAISS index for Virtual Trainer - {agent.replace('_', ' ').title()} Data...")
        create_faiss_index(agent)
