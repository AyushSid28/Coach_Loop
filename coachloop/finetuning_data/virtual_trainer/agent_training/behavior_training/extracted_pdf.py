import os
import fitz  # PyMuPDF

# Get the current script directory (presentation_agent)
current_dir = os.path.dirname(os.path.abspath(__file__))

# Set the PDF folder and output folder
pdf_folder = os.path.join(current_dir, "pdfs")  # PDFs are in 'pdfs/' subfolder
output_folder = os.path.join(current_dir, "extracted_text")
os.makedirs(output_folder, exist_ok=True)

# Get all PDF files (both .pdf and .PDF) in the 'pdfs' subfolder
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

print("🎉 Done processing all PDFs!")
