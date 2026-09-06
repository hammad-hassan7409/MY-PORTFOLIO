/**
 * Helper to read an image file from the device and optimize it for web use
 */
export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes and optimizes an image data URL for avatar or project preview,
 * ensuring high visual fidelity while keeping document sizes well below database limits.
 */
export async function optimizeImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 520,
  quality: number = 0.75
): Promise<string> {
  const dataUrl = await readFileAsDataURL(file);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Draw white background for transparency fallback in JPEG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Always output high-quality compressed JPEG to prevent huge lossless PNG bloat (>1MB)
      let optimizedUrl = canvas.toDataURL("image/jpeg", quality);

      // If data URL exceeds 180 KB, incrementally compress to guarantee database safety
      if (optimizedUrl.length > 180000) {
        optimizedUrl = canvas.toDataURL("image/jpeg", 0.6);
      }
      if (optimizedUrl.length > 250000) {
        const smallerCanvas = document.createElement("canvas");
        smallerCanvas.width = Math.round(width * 0.7);
        smallerCanvas.height = Math.round(height * 0.7);
        const sCtx = smallerCanvas.getContext("2d");
        if (sCtx) {
          sCtx.fillStyle = "#ffffff";
          sCtx.fillRect(0, 0, smallerCanvas.width, smallerCanvas.height);
          sCtx.drawImage(img, 0, 0, smallerCanvas.width, smallerCanvas.height);
          optimizedUrl = smallerCanvas.toDataURL("image/jpeg", 0.6);
        }
      }

      resolve(optimizedUrl);
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
