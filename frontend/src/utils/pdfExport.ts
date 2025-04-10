import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import axios from "axios";


declare global {
  interface Window {
    _processedImageCache?: Map<string, boolean>;
  }
}

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
  
  const processImages = () => {
    console.log("Processing images - START"); 
    
    // Create a stack trace for debugging
    console.log(new Error().stack);
    
    const images = contentClone.querySelectorAll("img");
    console.log(`Found ${images.length} images to process`);
    
    // Create a static Map to track processed images across function calls
    if (!window._processedImageCache) {
      window._processedImageCache = new Map();
    }
    
    let processedCount = 0;
    let skippedCount = 0;
    
    images.forEach((img) => {
      const originalSrc = img.getAttribute("src");
      // Create a unique identifier for this image
      const imgId = originalSrc || img.outerHTML;
      
      // Skip if this image has already been processed
      if ((window._processedImageCache ?? new Map()).has(imgId)) {
        skippedCount++;
        return;
      }
      
      processedCount++;
      (window._processedImageCache ?? new Map()).set(imgId, true);
      
      if (originalSrc && !originalSrc.startsWith("data:")) {
        const proxiedUrl = `https://notecraft-backend-ag98.onrender.com/proxy-image/?url=${encodeURIComponent(originalSrc)}`;
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
    
    console.log(`Processed ${processedCount} new images, skipped ${skippedCount} already processed images`);
    console.log("Processing images - END");
  };
  
  
  processImages();
  
  return tempContainer;
};
let isGeneratingPDF = false;
export const exportToPdf = async (
  element: HTMLElement,
  pdfSettings: PdfSettings,
  refreshTokenFn: () => Promise<boolean>,
  documentName: string = "Untitled-Document"
) => {
  if (isGeneratingPDF) {
    console.warn("PDF generation already in progress. Skipping duplicate call.");
    return;
  }
  console.log("Starting PDF export");
  isGeneratingPDF = true;
  
  try {
    if (!documentName) {
      documentName = "Untitled-Document";
    } else {
      documentName = documentName.replace(/[^a-zA-Z0-9-_]/g, "-");
    }
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${documentName}-NoteCraft-${timestamp}.pdf`;
    
    console.log("prepping content");
    const preparedContent = prepareForPdfExport(element, pdfSettings);
    if (!preparedContent) {
      return;
    }
    console.log("Prepared content for PDF export");
    await waitForImagesToLoad(preparedContent);
    // Set up the temporary container for rendering
    preparedContent.style.position = "absolute";
    preparedContent.style.left = "-9999px";
    preparedContent.style.top = "0";
    preparedContent.style.width = "794px"; // A4 width in pixels at 96 DPI
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
    
    // Wait for content to fully render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const scale = (pdfWidth - margins * 2) / contentWidth;
    const contentHeight = preparedContent.offsetHeight;
    const usablePageHeight = pdfHeight - margins * 2;
    
    // Calculate how many pages we need
    const scaledContentHeight = contentHeight * scale;
    const totalPages = Math.ceil(scaledContentHeight / usablePageHeight);
    
    // Render the entire content once
    console.log("Rendering full content");
    const fullCanvas = await html2canvas(preparedContent, {
      scale: 2, 
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowHeight: contentHeight,
      imageTimeout: 15000, 
      onclone: (clonedDoc) => {
        // Force all images in the clone to be loaded completely
        const images = clonedDoc.getElementsByTagName('img');
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          // Ensure image src is preserved
          if (img.getAttribute('data-src')) {
            const dataSrc = img.getAttribute('data-src');
            if (dataSrc) {
              img.src = dataSrc;
            }
          }
          // Mark image as important to prevent lazy loading issues
          img.setAttribute('loading', 'eager');
          img.style.visibility = 'visible';
        }
    }});
    
    // Now slice this canvas into pages
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
        if (page % 2 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      // Calculate which portion of the canvas to use for this page
      const yStart = Math.floor((usablePageHeight / scale) * page * 2); // Multiply by scale factor of canvas (2)
      const heightToCapture = Math.ceil(Math.min(
        usablePageHeight / scale * 2,
        fullCanvas.height - yStart
      ));
      
      // Create a temporary canvas for this slice
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = fullCanvas.width;
      tempCanvas.height = heightToCapture;
      
      // Copy the relevant portion from the full canvas
      const ctx = tempCanvas.getContext('2d',{ alpha: false });
      if (ctx) {
        ctx.drawImage(
          fullCanvas, 
          0, yStart, 
          fullCanvas.width, heightToCapture, 
          0, 0, 
          fullCanvas.width, heightToCapture
        );
      } else {
        console.error("Failed to get 2D context for temporary canvas.");
      }
      
      // Add the image to the PDF
      const imgData = tempCanvas.toDataURL("image/png");
      pdf.addImage(
        imgData,
        "PNG",
        margins,
        margins,
        pdfWidth - margins * 2,
        (heightToCapture / 2) * scale, // Divide by 2 to account for the scale factor of the canvas
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
      if (ctx) {
        ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      }
    }
    
    // Download the PDF
    pdf.save(filename);
    
    // Create form data for server upload
    const pdfBlob = pdf.output("blob");
    const formData = new FormData();
    formData.append(filename, pdfBlob);

    document.body.removeChild(preparedContent);
    if (preparedContent && preparedContent.parentNode) {
      preparedContent.parentNode.removeChild(preparedContent);
    }
    console.log("PDF export completed successfully");
    try {
      await uploadPdf(formData, refreshTokenFn);
    } catch (error) {
      console.error("Error uploading PDF:", error);
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
  finally{
    isGeneratingPDF = false;
  }
};
async function waitForImagesToLoad(element: { getElementsByTagName: (arg0: string) => any; }) {
  console.log("Waiting for all images to load");
  const images = element.getElementsByTagName('img');
  
  if (images.length === 0) {
    return Promise.resolve();
  }
  
  const imagePromises = Array.from(images as HTMLCollectionOf<HTMLImageElement>).map((img: HTMLImageElement) => {
    // If image is already loaded, return resolved promise
    if (img.complete) {
      return Promise.resolve();
    }
    
    // Otherwise wait for load or error
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // Resolve on error too, to prevent hanging
      
      // For images with src in data-src (lazy loaded)
      if (!img.src && img.getAttribute('data-src')) {
        const dataSrc = img.getAttribute('data-src');
        if (dataSrc) {
          img.src = dataSrc;
        }
      }
    });
  });
  
  // Wait for all images
  return Promise.all(imagePromises);
}
const uploadPdf = async (formData: FormData, refreshTokenFn: () => Promise<boolean>) => {
  try {
    let response = await axios.post(
      "https://notecraft-backend-ag98.onrender.com/add_pdf/", 
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
          "https://notecraft-backend-ag98.onrender.com/add_pdf/", 
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

    console.log("PDF uploaded successfully:"/*, response.data*/);
  } catch (error) {
    console.error("Error uploading PDF:", error);
    throw error;
  }
};