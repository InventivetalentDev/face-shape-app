import { describe, expect, it } from 'vitest'
import type { Point } from './faceShape'
import { autoFitGlasses, IRIS_CENTERS } from './glasses'

function irisPoints(a: Point, b: Point): Point[] {
  const points = Array.from({ length: 478 }, () => ({ x: 0, y: 0 }))
  points[IRIS_CENTERS[0]] = a
  points[IRIS_CENTERS[1]] = b
  return points
}

describe('autoFitGlasses', () => {
  it('aligns the lens centers with level irises', () => {
    const points = irisPoints({ x: 100, y: 200 }, { x: 240, y: 200 })

    expect(autoFitGlasses(points)).toEqual({ x: 170, y: 200, width: 300, rotation: 0 })
  })

  it('keeps the placement when iris indices are swapped', () => {
    const a = { x: 100, y: 200 }
    const b = { x: 240, y: 200 }

    expect(autoFitGlasses(irisPoints(b, a))).toEqual(autoFitGlasses(irisPoints(a, b)))
  })

  it('rotates and scales to match tilted irises', () => {
    const placement = autoFitGlasses(irisPoints({ x: 100, y: 100 }, { x: 200, y: 200 }))

    expect(placement.x).toBe(150)
    expect(placement.y).toBe(150)
    expect(placement.rotation).toBeCloseTo(45)
    expect(placement.width).toBeCloseTo(Math.hypot(100, 100) * 300 / 140)
  })
})
