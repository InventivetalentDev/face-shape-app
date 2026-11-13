import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { FACE_OVAL, LANDMARKS } from '../lib/faceShape'
import type { Point } from '../lib/faceShape'
import { FRAME_BOX } from '../lib/glasses'
import type { GlassesId, GlassesPlacement } from '../lib/glasses'
import type { Photo } from '../lib/photo'
import { GlassesArt } from './GlassesArt'

interface PhotoStageProps {
  photo: Photo
  busy: boolean
  dropTarget: boolean
  points: Point[] | null
  showOutline: boolean
  glassesId: GlassesId | null
  placement: GlassesPlacement | null
  onPlacementChange: (placement: GlassesPlacement) => void
}

const measurementLines = [
  [LANDMARKS.foreheadTop, LANDMARKS.chin, 'length'],
  [LANDMARKS.foreheadLeft, LANDMARKS.foreheadRight, 'forehead'],
  [LANDMARKS.cheekLeft, LANDMARKS.cheekRight, 'cheek'],
  [LANDMARKS.jawLeft, LANDMARKS.jawRight, 'jaw'],
] as const

export function PhotoStage({ photo, busy, dropTarget, points, showOutline, glassesId, placement, onPlacementChange }: PhotoStageProps) {
  const imageRef = useRef<HTMLImageElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [imagePxPerCssPx, setImagePxPerCssPx] = useState(1)
  const drag = useRef<{
    pointerId: number
    mode: 'move' | 'resize'
    start: Point
    placement: GlassesPlacement
  } | null>(null)

  useEffect(() => {
    const image = imageRef.current!
    const updateScale = () => setImagePxPerCssPx(photo.width / image.getBoundingClientRect().width)
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(image)
    return () => observer.disconnect()
  }, [photo.width, photo.url])

  function imagePoint(event: PointerEvent<SVGElement>): Point {
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(svgRef.current!.getScreenCTM()!.inverse())
  }

  function startDrag(event: PointerEvent<SVGElement>, mode: 'move' | 'resize') {
    if (!placement) return
    event.preventDefault()
    svgRef.current!.setPointerCapture(event.pointerId)
    drag.current = { pointerId: event.pointerId, mode, start: imagePoint(event), placement }
  }

  function moveDrag(event: PointerEvent<SVGSVGElement>) {
    const current = drag.current
    if (!current || current.pointerId !== event.pointerId) return
    const point = imagePoint(event)
    const original = current.placement
    if (current.mode === 'move') {
      onPlacementChange({ ...original, x: original.x + point.x - current.start.x, y: original.y + point.y - current.start.y })
    } else {
      const dx = point.x - original.x
      const dy = point.y - original.y
      onPlacementChange({ ...original, width: Math.max(40, 2 * Math.hypot(dx, dy)), rotation: Math.atan2(dy, dx) * 180 / Math.PI })
    }
  }

  function endDrag(event: PointerEvent<SVGSVGElement>) {
    if (drag.current?.pointerId === event.pointerId) drag.current = null
  }

  function adjustGlasses(event: KeyboardEvent<SVGGElement>) {
    if (!placement) return
    const next = { ...placement }
    const step = (event.shiftKey ? 10 : 2) * imagePxPerCssPx
    switch (event.key) {
      case 'ArrowLeft':
        next.x -= step
        break
      case 'ArrowRight':
        next.x += step
        break
      case 'ArrowUp':
        next.y -= step
        break
      case 'ArrowDown':
        next.y += step
        break
      case '+':
      case '=':
        next.width *= 1.04
        break
      case '-':
      case '_':
        next.width = Math.max(40, next.width / 1.04)
        break
      case '[':
        next.rotation -= 2
        break
      case ']':
        next.rotation += 2
        break
      default: return
    }
    event.preventDefault()
    onPlacementChange(next)
  }

  return (
    <div className={`photo-stage${busy ? ' is-busy' : ''}${dropTarget ? ' is-drop-target' : ''}`}>
      <img ref={imageRef} src={photo.url} width={photo.width} height={photo.height} alt="Your uploaded photo" draggable={false} />
      <svg
        ref={svgRef}
        className="photo-overlay"
        viewBox={`0 0 ${photo.width} ${photo.height}`}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <title>Face outline, measurements, and glasses</title>
        {points && (
          <g key={photo.url} className="face-measurements" visibility={showOutline ? 'visible' : 'hidden'}>
            <polygon
              className="face-outline"
              points={FACE_OVAL.map(index => `${points[index].x},${points[index].y}`).join(' ')}
              vectorEffect="non-scaling-stroke"
              strokeWidth={2}
            />
            {measurementLines.map(([from, to, name]) => (
              <line
                key={name}
                className={`measurement line-${name}`}
                x1={points[from].x} y1={points[from].y}
                x2={points[to].x} y2={points[to].y}
                vectorEffect="non-scaling-stroke"
                strokeWidth={2}
              />
            ))}
          </g>
        )}
        {glassesId && placement && (
          <g transform={`translate(${placement.x} ${placement.y}) rotate(${placement.rotation})`}>
            <g
              className="glasses"
              tabIndex={0}
              role="group"
              aria-label="Glasses. Arrow keys move, plus and minus resize, brackets rotate."
              transform={`scale(${placement.width / FRAME_BOX.width}) translate(${-FRAME_BOX.width / 2} ${-FRAME_BOX.height / 2})`}
              onPointerDown={event => startDrag(event, 'move')}
              onKeyDown={adjustGlasses}
            >
              <rect className="hit-area" width={FRAME_BOX.width} height={FRAME_BOX.height} fill="transparent" vectorEffect="non-scaling-stroke" />
              <GlassesArt id={glassesId} />
            </g>
            <circle
              className="handle"
              cx={placement.width / 2} cy={0} r={12 * imagePxPerCssPx}
              onPointerDown={event => startDrag(event, 'resize')}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        )}
      </svg>
    </div>
  )
}
