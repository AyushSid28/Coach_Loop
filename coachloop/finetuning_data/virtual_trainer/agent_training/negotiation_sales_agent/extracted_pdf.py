import os
import fitz  # PyMuPDF

# Get the directory where PDFs are stored
script_dir = os.path.dirname(os.path.abspath(__file__))
pdf_folder = script_dir  # PDFs are directly in negotiation_and_sales

# Create an output folder inside negotiation_and_sales
output_folder = os.path.join(script_dir, "extracted_text")
os.makedirs(output_folder, exist_ok=True)

# Get all PDFs (both .pdf and .PDF)
pdf_files = [f for f in os.listdir(pdf_folder) if f.lower().endswith(".pdf")]

if not pdf_files:
    print("❌ No PDF files found in:", pdf_folder)
else:
    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_folder, pdf_file)
        output_file = os.path.join(output_folder, f"{os.path.splitext(pdf_file)[0]}.txt")

        # Extract text
        with fitz.open(pdf_path) as doc:
            text = "\n".join([page.get_text() for page in doc])

        # Save extracted text
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(text)

        print(f"✅ Extracted text saved to: {output_file}")
