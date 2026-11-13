import { useEffect, useMemo, useRef, useState } from 'react'
import { GlassesPicker } from './components/GlassesPicker'
import { PhotoStage } from './components/PhotoStage'
import { ResultPanel } from './components/ResultPanel'
import { UploadZone } from './components/UploadZone'
import { classifyFaceShape, FACE_SHAPE_INFO, MAX_HEAD_TURN_DEGREES, measureFace } from './lib/faceShape'
import { autoFitGlasses } from './lib/glasses'
import type { GlassesId, GlassesPlacement } from './lib/glasses'
import { detectFace, getFaceLandmarker } from './lib/landmarker'
import type { FaceDetection } from './lib/landmarker'
import { loadPhoto } from './lib/photo'
import type { Photo } from './lib/photo'

export default function App() {
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [analysis, setAnalysis] = useState<
    | { kind: 'idle' }
    | { kind: 'detecting' }
    | { kind: 'done'; detection: FaceDetection }
    | { kind: 'no-face' }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' })
  const [showOutline, setShowOutline] = useState(true)
  const [glassesId, setGlassesId] = useState<GlassesId | null>(null)
  const [placement, setPlacement] = useState<GlassesPlacement | null>(null)
  const request = useRef(0)
  const photoUrl = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getFaceLandmarker().then(
      () => { if (!cancelled) setModelStatus('ready') },
      () => { if (!cancelled) setModelStatus('error') },
    )
    return () => {
      cancelled = true
      request.current += 1
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current)
    }
  }, [])

  async function handleFile(file: File) {
    const currentRequest = ++request.current
    setAnalysis({ kind: 'detecting' })
    let nextPhoto: Photo
    try {
      nextPhoto = await loadPhoto(file)
    } catch {
      if (currentRequest === request.current) {
        setAnalysis({ kind: 'error', message: "Couldn't read that file. Use a JPEG, PNG, or WebP photo." })
      }
      return
    }
    if (currentRequest !== request.current) {
      URL.revokeObjectURL(nextPhoto.url)
      return
    }
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current)
    photoUrl.current = nextPhoto.url
    setPhoto(nextPhoto)
    try {
      const detection = await detectFace(nextPhoto.canvas)
      if (currentRequest !== request.current) return
      if (!detection) {
        setAnalysis({ kind: 'no-face' })
        return
      }
      setAnalysis({ kind: 'done', detection })
      setPlacement(glassesId ? autoFitGlasses(detection.points) : null)
    } catch {
      if (currentRequest === request.current) {
        setAnalysis({ kind: 'error', message: 'Face detection failed. Reload the page and try again.' })
      }
    }
  }

  const measured = useMemo(() => {
    if (analysis.kind !== 'done') return null
    const measurements = measureFace(analysis.detection.points)
    return { measurements, result: classifyFaceShape(measurements) }
  }, [analysis])
  const poseWarning = analysis.kind === 'done' && (
    Math.abs(analysis.detection.yaw) > MAX_HEAD_TURN_DEGREES ||
    Math.abs(analysis.detection.pitch) > MAX_HEAD_TURN_DEGREES
  )
  const statusMessage = analysis.kind === 'detecting' ? 'Detecting face…'
    : analysis.kind === 'no-face' ? 'No face found. Use a well-lit photo where you face the camera.'
    : analysis.kind === 'error' ? analysis.message : ''

  function selectGlasses(id: GlassesId | null) {
    setGlassesId(id)
    if (id && !placement && analysis.kind === 'done') {
      setPlacement(autoFitGlasses(analysis.detection.points))
    }
  }

  return (
    <div className="app">
      <header className="page-header">
        <h1>Face shape</h1>
        <p>Runs entirely in your browser. Your photo never leaves this device.</p>
        <p className={`model-status ${modelStatus}`} role="status">
          {modelStatus === 'loading' ? 'Loading face model…' : modelStatus === 'ready' ? 'Face model ready' : 'The face model failed to load.'}
        </p>
      </header>
      <main className="workspace">
        <div className="stage-column" aria-busy={analysis.kind === 'detecting'}>
          {photo ? (
            <PhotoStage
              photo={photo}
              points={analysis.kind === 'done' ? analysis.detection.points : null}
              showOutline={showOutline}
              glassesId={analysis.kind === 'done' ? glassesId : null}
              placement={placement}
              onPlacementChange={setPlacement}
            />
          ) : <UploadZone onFile={handleFile} />}
          <div className={`stage-status${analysis.kind === 'error' ? ' error' : ''}`} role="status">{statusMessage}</div>
        </div>
        <aside className="side-panel" aria-label="Face shape and frames">
          {analysis.kind === 'done' && measured ? (
            <>
              <ResultPanel result={measured.result} measurements={measured.measurements} poseWarning={poseWarning} />
              <GlassesPicker selected={glassesId} recommended={FACE_SHAPE_INFO[measured.result.shape].recommended} onSelect={selectGlasses} />
              <p className="fit-help">Drag the frames to move them. Drag the handle to resize and rotate.</p>
            </>
          ) : <p className="panel-status">{photo ? statusMessage : 'Upload a front-facing photo to get started.'}</p>}
          {photo && (
            <div className="controls">
              {analysis.kind === 'done' && (
                <>
                  <label className="outline-control">
                    <input type="checkbox" checked={showOutline} onChange={event => setShowOutline(event.currentTarget.checked)} />
                    Show outline
                  </label>
                  <button type="button" disabled={!glassesId} onClick={() => setPlacement(autoFitGlasses(analysis.detection.points))}>Reset fit</button>
                </>
              )}
              <label className="button primary">
                New photo
                <input
                  className="visually-hidden"
                  type="file"
                  accept="image/*"
                  onChange={event => {
                    const file = event.currentTarget.files?.[0]
                    event.currentTarget.value = ''
                    if (file) void handleFile(file)
                  }}
                />
              </label>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
