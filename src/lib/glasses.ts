import type { Point } from './faceShape'

export type GlassesId = 'round' | 'oval' | 'rectangle' | 'square' | 'cat-eye' | 'aviator'

export const GLASSES_OPTIONS: { id: GlassesId; label: string }[] = [
  { id: 'round', label: 'Round' }, { id: 'oval', label: 'Oval' },
  { id: 'rectangle', label: 'Rectangle' }, { id: 'square', label: 'Square' },
  { id: 'cat-eye', label: 'Cat-eye' }, { id: 'aviator', label: 'Aviator' },
]

// Every frame drawing uses this box, so one placement fits all styles.
export const FRAME_BOX = { width: 300, height: 100, lensLeftX: 80, lensRightX: 220, lensY: 50 } as const

export interface GlassesPlacement {
  x: number
  y: number
  width: number
  rotation: number
}

export const IRIS_CENTERS = [468, 473] as const

export function autoFitGlasses(points: Point[]): GlassesPlacement {
  const [a, b] = IRIS_CENTERS.map(index => points[index])
  const [left, right] = a.x <= b.x ? [a, b] : [b, a]
  const dx = right.x - left.x
  const dy = right.y - left.y
  return {
    x: (left.x + right.x) / 2,
    y: (left.y + right.y) / 2,
    width: Math.hypot(dx, dy) * FRAME_BOX.width / (FRAME_BOX.lensRightX - FRAME_BOX.lensLeftX),
    rotation: Math.atan2(dy, dx) * 180 / Math.PI,
  }
}
