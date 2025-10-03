import os
import faiss
import numpy as np
import logging

# 🔹 Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# 🔹 Define paths for FAISS indexes
BASE_PATH = "/Users/ayushsiddhant/Desktop/CoachLoop/coachloop/finetuning_data/embed_scripts/indexes"

INDEXES = {
    "presentation": "vt_presentation_agent",
    "negotiation": "vt_negotiation_sales_agent",
    "behavior": "vt_behavior_training",
    "virtual_coach_text": "virtual_coach_text",
    "virtual_coach_video": "virtual_coach_video",
}

# 🔹 Function to load FAISS index and metadata
def load_faiss_index(index_name):
    """Loads a FAISS index and its metadata, with error handling."""
    
    logging.info(f"🔄 Attempting to load FAISS index for: {index_name}...")

    index_path = os.path.join(BASE_PATH, INDEXES[index_name], f"faiss_index_{INDEXES[index_name]}.index")
    metadata_path = os.path.join(BASE_PATH, INDEXES[index_name], f"metadata_{INDEXES[index_name]}.npy")

    # 🔹 Check if files exist before loading
    if not os.path.exists(index_path):
        logging.warning(f"⚠️ FAISS index file not found: {index_path}")
        return None, None
    
    if not os.path.exists(metadata_path):
        logging.warning(f"⚠️ Metadata file not found: {metadata_path}")
        return None, None

    try:
        # 🔹 Load FAISS index
        logging.info(f"📥 Loading FAISS index from: {index_path}")
        index = faiss.read_index(index_path)
        
        # 🔹 Load metadata (filenames or text chunks)
        logging.info(f"📥 Loading metadata from: {metadata_path}")
        metadata = np.load(metadata_path, allow_pickle=True).tolist()

        logging.info(f"✅ Successfully loaded FAISS index for {index_name}: {index.ntotal} vectors, Dimension: {index.d}")
        return index, metadata

    except Exception as e:
        logging.error(f"❌ Error loading FAISS index for {index_name}: {e}")
        return None, None

# 🔹 Load all FAISS indexes
faiss_indexes = {}
metadata_store = {}

logging.info("\n🚀 **Starting FAISS Index Loading Process...**\n")

for key in INDEXES.keys():
    logging.info(f"\n---------------------------------------")
    logging.info(f"📌 Processing FAISS index: {key.upper()}")
    
    index, metadata = load_faiss_index(key)
    
    if index is not None:
        faiss_indexes[key] = index
        metadata_store[key] = metadata
        logging.info(f"✅ FAISS index for {key} is ready for use!\n")
    else:
        logging.warning(f"⚠️ Skipping {key} due to missing files or errors.\n")

logging.info("\n🎉 **FAISS Index Loading Completed! Ready for Search.**")
