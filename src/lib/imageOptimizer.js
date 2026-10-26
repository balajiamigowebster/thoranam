/**
 * Client-Side Automatic Image Optimization Utility
 * Automatically resizes & compresses any uploaded image to WebP before sending to server.
 * Ensures images uploaded from mobile phones, cameras, or desktops are < 80KB-120KB.
 */

export async function compressImageForUpload(
  file,
  maxWidth = 1200,
  maxHeight = 1600,
  quality = 0.82
) {
  if (!file || typeof window === "undefined" || !file.type.startsWith("image/")) {
    return file;
  }

  // Already lightweight SVG or tiny WebP
  if (file.type === "image/svg+xml" || (file.type === "image/webp" && file.size < 90 * 1024)) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Preserve aspect ratio while fitting within maximum bounds
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        // High quality smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas output to modern, lightweight WebP blob
        canvas.toBlob(
          (blob) => {
            if (blob && (blob.size < file.size || file.type !== "image/webp")) {
              const cleanBase = (file.name || "saree")
                .replace(/\.[^/.]+$/, "")
                .replace(/[^a-zA-Z0-9_-]/g, "_");
              const compressedFile = new File([blob], `${cleanBase}.webp`, {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
