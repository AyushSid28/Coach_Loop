import faiss
import numpy as np
import os

# Paths to your FAISS index and metadata files
INDEX_FILE = "indexes/vt_behavior/faiss_index_vt_behavior.index"
METADATA_FILE = "indexes/vt_behavior/metadata_vt_behavior.npy"

# Get absolute paths for debugging
abs_index_file = os.path.abspath(INDEX_FILE)
abs_metadata_file = os.path.abspath(METADATA_FILE)

print(f"🔍 Checking FAISS Index Path: {abs_index_file}")
print(f"🔍 Checking Metadata Path: {abs_metadata_file}")

# Check if files exist
if not os.path.exists(abs_index_file):
    print(f"⚠️ ERROR: FAISS index file not found: {abs_index_file}")
    exit()
if not os.path.exists(abs_metadata_file):
    print(f"⚠️ ERROR: Metadata file not found: {abs_metadata_file}")
    exit()

# Load FAISS index
print("\n📥 Loading FAISS Index...")
index = faiss.read_index(abs_index_file)

# Print index details
print("\n✅ FAISS Index Loaded Successfully!")
print(f"📌 Number of Vectors: {index.ntotal}")
print(f"📌 Vector Dimension: {index.d}")

# Load metadata
print("\n📥 Loading Metadata...")
metadata = np.load(abs_metadata_file, allow_pickle=True)

print("\n✅ Metadata Loaded Successfully!")
print(f"📌 Metadata Type: {type(metadata)}")
print(f"📌 Metadata Length: {len(metadata)}")

# Display first 5 metadata entries
print("\n📜 First 5 Metadata Entries:")
for i, entry in enumerate(metadata[:5]):
    print(f"{i+1}. {entry}")
