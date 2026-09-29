import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

export interface SaveFileResult {
  success: boolean;
  filePath: string;
  folderPath: string;
  blob?: Blob;
  error?: string;
}

/**
 * Generate a clean, descriptive, collision-free filename.
 * Example: "Nota_MutiaraMinang_20260929_120530.pdf"
 */
export function generateExportFileName(
  customerName: string,
  storeName: string,
  notaNumber: string,
  extension: 'pdf' | 'png'
): string {
  const sanitize = (str: string) =>
    str
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 30);

  const cleanStore = sanitize(storeName || customerName || 'Nota');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, '');
  const cleanNumber = sanitize(notaNumber || 'ND');

  return `Nota_${cleanStore}_${dateStr}_${timeStr}_${cleanNumber}.${extension}`;
}

/**
 * Convert Blob to Base64 string for Capacitor Filesystem.
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      // Strip off the data:*/*;base64, prefix
      const base64 = dataUrl.split(',')[1];
      resolve(base64 || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Save file to Android storage or trigger browser download.
 * Subfolder type: 'Nota_PDF' or 'Nota_PNG'
 */
export async function saveExportedFile(
  blob: Blob,
  fileName: string,
  subFolder: 'Nota_PDF' | 'Nota_PNG'
): Promise<SaveFileResult> {
  const targetRelativePath = `NotaDigital/${subFolder}/${fileName}`;
  const targetDisplayPath = `Download/NotaDigital/${subFolder}/${fileName}`;

  // 1. If running inside native Android Capacitor APK
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);

      // In Android 10+ (API 29+), Directory.Documents or Directory.ExternalStorage is used for public downloads
      // We attempt to write to ExternalStorage/Download first, falling back to Documents
      try {
        await Filesystem.writeFile({
          path: `Download/${targetRelativePath}`,
          data: base64Data,
          directory: Directory.ExternalStorage,
          recursive: true,
        });

        return {
          success: true,
          filePath: `Download/${targetRelativePath}`,
          folderPath: `Download/NotaDigital/${subFolder}`,
          blob,
        };
      } catch (externalErr) {
        console.warn('ExternalStorage save failed, trying Documents:', externalErr);
        await Filesystem.writeFile({
          path: targetRelativePath,
          data: base64Data,
          directory: Directory.Documents,
          recursive: true,
        });

        return {
          success: true,
          filePath: `Documents/${targetRelativePath}`,
          folderPath: `Documents/NotaDigital/${subFolder}`,
          blob,
        };
      }
    } catch (err: any) {
      console.error('Capacitor native file write error:', err);
      // Fallback to web trigger if native write has issues
    }
  }

  // 2. Web browser / PWA fallback
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);

    return {
      success: true,
      filePath: fileName,
      folderPath: targetDisplayPath,
      blob,
    };
  } catch (err: any) {
    console.error('Web download failed:', err);
    return {
      success: false,
      filePath: fileName,
      folderPath: targetDisplayPath,
      error: err.message || 'Gagal menyimpan file',
      blob,
    };
  }
}

/**
 * Share file directly using Web Share API (native Android share sheet).
 * Ideal for sending nota via WhatsApp!
 */
export async function shareExportedFile(blob: Blob, fileName: string, title: string): Promise<boolean> {
  try {
    const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png';
    const file = new File([blob], fileName, { type: mimeType });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text: `Nota Digital: ${title}`,
        files: [file],
      });
      return true;
    } else if (navigator.share) {
      await navigator.share({
        title,
        text: `Nota Digital: ${title}`,
      });
      return true;
    }
    return false;
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.error('Share error:', err);
    }
    return false;
  }
}
