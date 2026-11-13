import { describe, expect, it } from 'vitest'
import { classifyFaceShape, measureFace, SHAPE_MODEL } from './faceShape'
import type { FaceMeasurements, FaceShape, Point } from './faceShape'

function measurementsAt(lengthRatio: number, foreheadRatio: number, jawRatio: number): FaceMeasurements {
  return {
    faceLength: lengthRatio * 200,
    foreheadWidth: foreheadRatio * 200,
    cheekboneWidth: 200,
    jawWidth: jawRatio * 200,
    lengthRatio, foreheadRatio, jawRatio,
  }
}

describe('measureFace', () => {
  it('measures landmark distances and ratios in image pixels', () => {
    const points: Point[] = Array.from({ length: 478 }, () => ({ x: 0, y: 0 }))
    points[10] = { x: 100, y: 0 }
    points[152] = { x: 100, y: 240 }
    points[54] = { x: 40, y: 30 }
    points[284] = { x: 160, y: 30 }
    points[234] = { x: 0, y: 100 }
    points[454] = { x: 200, y: 100 }
    points[172] = { x: 30, y: 200 }
    points[397] = { x: 170, y: 200 }

    expect(measureFace(points)).toEqual({
      faceLength: 240,
      foreheadWidth: 120,
      cheekboneWidth: 200,
      jawWidth: 140,
      lengthRatio: 1.2,
      foreheadRatio: 0.6,
      jawRatio: 0.7,
    })
  })
})

describe('classifyFaceShape', () => {
  it.each(Object.keys(SHAPE_MODEL.prototypes) as FaceShape[])('classifies the %s prototype', shape => {
    const { center: c, spread: s, prototypes } = SHAPE_MODEL
    const p = prototypes[shape]
    const measurements = measurementsAt(
      c.lengthRatio + p[0] * s.lengthRatio,
      c.foreheadRatio + p[1] * s.foreheadRatio,
      c.jawRatio + p[2] * s.jawRatio,
    )
    expect(classifyFaceShape(measurements).shape).toBe(shape)
  })

  it('classifies the center as oval and normalizes all scores', () => {
    const c = SHAPE_MODEL.center
    const result = classifyFaceShape(measurementsAt(c.lengthRatio, c.foreheadRatio, c.jawRatio))

    expect(result.shape).toBe('oval')
    const total = Object.values(result.scores).reduce((sum, score) => sum + score, 0)
    expect(Math.abs(total - 1)).toBeLessThan(1e-9)
  })
})
