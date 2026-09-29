import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Generate a PDF Blob from the Nota receipt HTML Element.
 * Creates a proportional digital receipt PDF that fits the exact dimensions of the nota.
 */
export async function generatePdfBlob(element: HTMLElement): Promise<Blob> {
  try {
    // Wait for images to load
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // Render element to high-res PNG data URL
    const imgDataUrl = await toPng(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    const elementWidth = element.offsetWidth || 800;
    const elementHeight = element.offsetHeight || 1100;

    // Use points (pt) for PDF dimensioning
    // Standard mobile digital width: 500 pt
    const pdfWidth = 500;
    const pdfHeight = (elementHeight / elementWidth) * pdfWidth;

    const pdf = new jsPDF({
      orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
      unit: 'pt',
      format: [pdfWidth, pdfHeight],
      compress: true,
    });

    pdf.addImage(imgDataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } catch (err: any) {
    console.error('Error generating PDF blob:', err);
    throw new Error(`Gagal membuat file PDF: ${err.message || err}`);
  }
}
