import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Exports a specific HTML element to a PDF file
 * @param elementId The ID of the element to capture
 * @param fileName The desired name for the PDF file
 */
export const exportElementToPdf = async (elementId: string, fileName: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    
    // PDF calculation
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    
    // Save the PDF
    pdf.save(`${fileName}.pdf`);
  } catch (err) {
    console.error("Error generating PDF:", err);
    alert("Gagal menghasilkan PDF. Silakan coba lagi.");
  }
};
