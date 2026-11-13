export interface Photo { url: string; width: number; height: number; canvas: HTMLCanvasElement }

export const MAX_PHOTO_SIDE = 1600

export async function loadPhoto(file: File): Promise<Photo> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_PHOTO_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Could not encode photo'))
    }, 'image/jpeg', 0.92)
  })
  return { url: URL.createObjectURL(blob), width, height, canvas }
}
