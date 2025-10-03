import os
import fitz
print("PyMuPDF (fitz) is installed successfully!")

pdf_folder="../supporting_pdfs"
output_folder="extracted_text"

os.makedirs(output_folder, exist_ok=True)

for pdf_file in os.listdir(pdf_folder):
    if pdf_file.endswith(".pdf"):
        pdf_path = os.path.join(pdf_folder, pdf_file)
        output_txt_path = os.path.join(output_folder, pdf_file.replace(".pdf", ".txt"))

        with fitz.open(pdf_path) as doc:
            text = "\n".join([page.get_text("text") for page in doc])

        # Save extracted text
        with open(output_txt_path, "w", encoding="utf-8") as txt_file:
            txt_file.write(text)

        print(f"Extracted text saved to: {output_txt_path}")