import type { GlassesId } from './glasses'

export interface Point { x: number; y: number }

export type FaceShape = 'oval' | 'round' | 'square' | 'oblong' | 'heart' | 'diamond'

export const LANDMARKS = {
  foreheadTop: 10, chin: 152,
  foreheadLeft: 54, foreheadRight: 284,
  cheekLeft: 234, cheekRight: 454,
  jawLeft: 172, jawRight: 397,
} as const

// Ordered loop around the face, from MediaPipe's FACEMESH_FACE_OVAL.
export const FACE_OVAL: readonly number[] = [10, 338, 297, 332, 284, 251, 389, 356, 454,
  323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132,
  93, 234, 127, 162, 21, 54, 103, 67, 109]

export interface FaceMeasurements {
  faceLength: number
  foreheadWidth: number
  cheekboneWidth: number
  jawWidth: number
  lengthRatio: number
  foreheadRatio: number
  jawRatio: number
}

export function measureFace(points: Point[]): FaceMeasurements {
  function distance(a: number, b: number) {
    return Math.hypot(points[b].x - points[a].x, points[b].y - points[a].y)
  }
  const faceLength = distance(LANDMARKS.foreheadTop, LANDMARKS.chin)
  const foreheadWidth = distance(LANDMARKS.foreheadLeft, LANDMARKS.foreheadRight)
  const cheekboneWidth = distance(LANDMARKS.cheekLeft, LANDMARKS.cheekRight)
  const jawWidth = distance(LANDMARKS.jawLeft, LANDMARKS.jawRight)
  return {
    faceLength, foreheadWidth, cheekboneWidth, jawWidth,
    lengthRatio: faceLength / cheekboneWidth,
    foreheadRatio: foreheadWidth / cheekboneWidth,
    jawRatio: jawWidth / cheekboneWidth,
  }
}

// SHAPE_MODEL is provisional, measured from 12 generated test faces.
export const SHAPE_MODEL: {
  center: { lengthRatio: number; foreheadRatio: number; jawRatio: number }
  spread: { lengthRatio: number; foreheadRatio: number; jawRatio: number }
  prototypes: Record<FaceShape, [number, number, number]>
} = {
  center: { lengthRatio: 1.19, foreheadRatio: 0.845, jawRatio: 0.80 },
  spread: { lengthRatio: 0.065, foreheadRatio: 0.03, jawRatio: 0.022 },
  prototypes: {
    oval: [0, 0, 0],
    round: [-1.5, 0, -0.5],
    square: [-0.75, 0, 1.5],
    oblong: [1.5, 0, 0],
    heart: [0, 1.25, -1.25],
    diamond: [0, -1.5, -1],
  },
}

export interface ShapeResult {
  shape: FaceShape
  scores: Record<FaceShape, number>
}

export function classifyFaceShape(m: FaceMeasurements): ShapeResult {
  const { center: c, spread: s, prototypes } = SHAPE_MODEL
  const z = [
    (m.lengthRatio - c.lengthRatio) / s.lengthRatio,
    (m.foreheadRatio - c.foreheadRatio) / s.foreheadRatio,
    (m.jawRatio - c.jawRatio) / s.jawRatio,
  ]
  const weights = (Object.keys(prototypes) as FaceShape[]).map(shape => {
    const p = prototypes[shape]
    const d = Math.hypot(z[0] - p[0], z[1] - p[1], z[2] - p[2])
    return [shape, Math.exp(-d * d / 2)] as const
  })
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0)
  const scores = Object.fromEntries(weights.map(([shape, weight]) => [shape, weight / total])) as Record<FaceShape, number>
  const [shape] = weights.reduce((best, entry) => entry[1] > best[1] ? entry : best)
  return { shape, scores }
}

export const MAX_HEAD_TURN_DEGREES = 15

export const FACE_SHAPE_INFO: Record<FaceShape, {
  label: string; summary: string; recommended: GlassesId[]
}> = {
  oval: {
    label: 'Oval',
    summary: 'Longer than it is wide, with a jaw a little narrower than the forehead. Most frame shapes work.',
    recommended: ['rectangle', 'square', 'aviator', 'cat-eye'],
  },
  round: {
    label: 'Round',
    summary: 'About as wide as it is long, with full cheeks and a soft jaw. Angular frames add definition.',
    recommended: ['rectangle', 'square', 'cat-eye'],
  },
  square: {
    label: 'Square',
    summary: 'A strong, wide jaw, with forehead, cheekbones, and jaw at similar widths. Curved frames soften the angles.',
    recommended: ['round', 'oval', 'aviator'],
  },
  oblong: {
    label: 'Oblong',
    summary: 'Clearly longer than it is wide, with fairly straight sides. Deep frames break up the length.',
    recommended: ['square', 'aviator', 'round'],
  },
  heart: {
    label: 'Heart',
    summary: 'A wider forehead that narrows to the jaw and chin. Light frames, or frames wider at the bottom, balance it.',
    recommended: ['oval', 'round', 'aviator'],
  },
  diamond: {
    label: 'Diamond',
    summary: 'Cheekbones are the widest part, with a narrower forehead and jaw. Frames with detail on top or soft curves work well.',
    recommended: ['cat-eye', 'oval', 'round'],
  },
}
