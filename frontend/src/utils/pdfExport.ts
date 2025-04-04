import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import axios from "axios";

interface PdfSettings {
  lineSpacing: number;
  pageBreaks: boolean;
  fontSize: number;
  margins: number;
  showPageNumbers: boolean;
}

export const prepareForPdfExport = (element: HTMLElement, pdfSettings: PdfSettings) => {
  // Create a clone of the content
  const contentClone = element.cloneNode(true) as HTMLElement;
  const tempContainer = document.createElement("div");
  tempContainer.appendChild(contentClone);
  
  // Apply PDF-specific styles
  const styleElement = document.createElement("style");
  styleElement.textContent = `
    * {
      font-family: 'Helvetica', Arial, sans-serif;
      box-sizing: border-box;
    }
    body, html {
      margin: 0;
      padding: 0;
    }
    p, li, blockquote, table td, table th {
      line-height: ${pdfSettings.lineSpacing} !important;
      font-size: ${pdfSettings.fontSize}pt !important;
      margin-bottom: 0.5em !important;
      margin-top: 0.5em !important;
    }
    h1 { font-size: ${pdfSettings.fontSize * 2}pt !important; margin: 1em 0 0.8em !important; page-break-after: avoid !important; }
    h2 { font-size: ${pdfSettings.fontSize * 1.5}pt !important; margin: 0.9em 0 0.7em !important; page-break-after: avoid !important; }
    h3 { font-size: ${pdfSettings.fontSize * 1.2}pt !important; margin: 0.8em 0 0.6em !important; page-break-after: avoid !important; }
    pre, code { page-break-inside: avoid; }
    img { page-break-inside: avoid; max-width: 100%; height: auto; }
    ul, ol { padding-left: 20px !important; margin: 0.7em 0 !important; }
    table { page-break-inside: avoid; }
    .page-break { page-break-after: always; height: 0; }
  `;
  tempContainer.appendChild(styleElement);
  
  // Add page breaks before major headers if enabled
  if (pdfSettings.pageBreaks) {
    const headers = contentClone.querySelectorAll("h1, h2");
    headers.forEach((header, index) => {
      if (index > 0) {
        const pageBreakDiv = document.createElement("div");
        pageBreakDiv.className = "page-break";
        header.parentNode?.insertBefore(pageBreakDiv, header);
      }
    });
  }
  
  // Process images
  const images = contentClone.querySelectorAll("img");
  images.forEach((img) => {
    const originalSrc = img.getAttribute("src");
    if (originalSrc && !originalSrc.startsWith("data:")) {
      const proxiedUrl = `https://bug-free-fortnight-ggxqrr4579v2wr79-8000.app.github.dev/proxy-image/?url=${encodeURIComponent(originalSrc)}`;
      img.setAttribute("src", proxiedUrl);
    }
    
    // Set width/height attributes to avoid layout shifts during PDF generation
    if (!img.hasAttribute("width") && img.width > 0) {
      img.setAttribute("width", img.width.toString());
    }
    if (!img.hasAttribute("height") && img.height > 0) {
      img.setAttribute("height", img.height.toString());
    }
  });
  
  return tempContainer;
};

export const exportToPdf = async (
  element: HTMLElement, 
  pdfSettings: PdfSettings,
  refreshTokenFn: () => Promise<boolean>
) => {
  try {
    let documentName = prompt("Please enter the name of the document:");
    if (!documentName) {
      documentName = "Untitled-Document";
    } else {
      documentName = documentName.replace(/[^a-zA-Z0-9-_]/g, "-");
    }
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${documentName}-NoteCraft-${timestamp}.pdf`;
    
    // Get prepared content with improved styling
    const preparedContent = prepareForPdfExport(element, pdfSettings);
    if (!preparedContent) {
      return;
    }
    
    // Set up the temporary container for rendering
    preparedContent.style.position = "absolute";
    preparedContent.style.left = "-9999px";
    preparedContent.style.top = "0";
    preparedContent.style.width = "794px"; 
    preparedContent.style.transformOrigin = "top left";
    document.body.appendChild(preparedContent);
    
    // Create PDF (A4 size)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });
    
    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margins = pdfSettings.margins;
    const contentWidth = preparedContent.offsetWidth;

    await new Promise(resolve => setTimeout(resolve, 500));
    const scale = (pdfWidth - margins * 2) / contentWidth;
    const contentHeight = preparedContent.offsetHeight;
    const usablePageHeight = pdfHeight - margins * 2;
    
    // Calculate how many pages we need
    const scaledContentHeight = contentHeight * scale;
    const totalPages = Math.ceil(scaledContentHeight / usablePageHeight);
    
    let firstPageBase64 = null;
    
    // Process each page individually for consistency
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }
      
      // Calculate which portion of the content to capture for this page
      const yStart = Math.floor((usablePageHeight / scale) * page);
      const heightToCapture = Math.ceil(Math.min(
        usablePageHeight / scale,
        contentHeight - yStart
      ));
      
      // Create canvas for this page
      const canvas = await html2canvas(preparedContent, {
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        y: yStart,
        height: heightToCapture,
        windowHeight: contentHeight
      });
      
      if (page === 0) {
        firstPageBase64 = canvas.toDataURL("image/png");
      }
      
      // Add the image to the PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(
        imgData,
        "PNG",
        margins,
        margins,
        pdfWidth - margins * 2,
        (heightToCapture * scale),
        undefined,
        "FAST"
      );
      
      // Add page number if enabled
      if (pdfSettings.showPageNumbers) {
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(
          `Page ${page + 1} of ${totalPages}`,
          pdfWidth / 2,
          pdfHeight - 5,
          { align: "center" }
        );
      }
    }
    
    // Save the PDF
    pdf.save(filename);
    
    // Create form data for server upload
    const pdfBlob = pdf.output("blob");
    const formData = new FormData();
    formData.append("topic", documentName);
    formData.append("pdf_file", pdfBlob);
    formData.append("first_page", firstPageBase64?? "");
    document.body.removeChild(preparedContent);

    try {
      await uploadPdf(formData, refreshTokenFn);
    } catch (error) {
      console.error("Error uploading PDF:", error);
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

const uploadPdf = async (formData: FormData, refreshTokenFn: () => Promise<boolean>) => {
  try {
    let response = await axios.post(
      "https://bug-free-fortnight-ggxqrr4579v2wr79-8000.app.github.dev/add_pdf/", 
      formData,
      {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );
    
    if (response.status === 401) {
      // Try to refresh the token
      const refreshed = await refreshTokenFn();
      
      if (refreshed) {
        // Retry the request with the new token
        response = await axios.post(
          "https://bug-free-fortnight-ggxqrr4579v2wr79-8000.app.github.dev/add_pdf/", 
          formData,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
      } else {
        throw new Error("Session expired. Please login again.");
      }
    }

    if (response.status !== 201) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    console.log("PDF uploaded successfully:", response.data);
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};