/**
 * Read an uploaded image File and return a downscaled square-ish JPEG data URL.
 * Keeps stored photos small so IndexedDB stays fast even with many pictures.
 */
export async function fileToDataUrl(file: File, maxSize = 512): Promise<string> {
  const bitmap = await loadBitmap(file)
  const { width, height } = bitmap
  const scale = Math.min(1, maxSize / Math.max(width, height))
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')
  ctx.drawImage(bitmap, 0, 0, w, h)

  // PNG keeps transparency for logos/icons; JPEG is smaller for photos.
  const isPng = file.type === 'image/png'
  return canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', 0.85)
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file)
    } catch {
      // fall through to <img> loader
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Could not load image'))
      img.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}
