import { toBlob } from 'html-to-image';

/**
 * Generate a crisp, high-resolution PNG Blob from an HTML Element.
 * Uses pixelRatio 2.5 to ensure retina-grade sharpness (ideal for WhatsApp / mobile view).
 */
export async function generatePngBlob(element: HTMLElement): Promise<Blob> {
  try {
    // Wait for any pending images inside element to be loaded
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

    const blob = await toBlob(element, {
      quality: 0.98,
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    if (!blob) {
      throw new Error('Gagal mengonversi elemen nota menjadi gambar PNG');
    }

    return blob;
  } catch (err: any) {
    console.error('Error generating PNG blob:', err);
    throw new Error(`Gagal membuat file PNG: ${err.message || err}`);
  }
}
