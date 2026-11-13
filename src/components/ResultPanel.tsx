import { FACE_SHAPE_INFO } from '../lib/faceShape'
import type { FaceMeasurements, FaceShape, ShapeResult } from '../lib/faceShape'
import { GLASSES_OPTIONS } from '../lib/glasses'

interface ResultPanelProps { result: ShapeResult; measurements: FaceMeasurements; poseWarning: boolean }

export function ResultPanel({ result, measurements, poseWarning }: ResultPanelProps) {
  const info = FACE_SHAPE_INFO[result.shape]
  const score = result.scores[result.shape]
  const ranked = (Object.keys(result.scores) as FaceShape[]).sort((a, b) => result.scores[b] - result.scores[a])
  const runnerUp = ranked[1]
  const recommendedLabels = info.recommended.map(id => GLASSES_OPTIONS.find(option => option.id === id)!.label)

  return (
    <section className="result-panel" aria-labelledby="result-heading">
      <h2 id="result-heading">Your face shape</h2>
      <div className="shape-result">
        <h3>{info.label}</h3>
        <span className="shape-score">{Math.round(score * 100)}% match</span>
      </div>
      {result.scores[runnerUp] >= score / 2 && (
        <p className="close-second">Close second: {FACE_SHAPE_INFO[runnerUp].label} ({Math.round(result.scores[runnerUp] * 100)}%)</p>
      )}
      <p>{info.summary}</p>
      {poseWarning && (
        <p className="pose-warning">Your head looks turned or tilted. For a more reliable result, use a photo where you face the camera straight on.</p>
      )}
      <dl className="measurements">
        <div>
          <dt><span className="swatch line-length" aria-hidden="true" />Length</dt>
          <dd>{measurements.lengthRatio.toFixed(2)} × cheekbone width</dd>
        </div>
        <div>
          <dt><span className="swatch line-forehead" aria-hidden="true" />Forehead</dt>
          <dd>{Math.round(measurements.foreheadRatio * 100)}% of cheekbone width</dd>
        </div>
        <div>
          <dt><span className="swatch line-cheek" aria-hidden="true" />Cheekbones</dt>
          <dd>reference width</dd>
        </div>
        <div>
          <dt><span className="swatch line-jaw" aria-hidden="true" />Jaw</dt>
          <dd>{Math.round(measurements.jawRatio * 100)}% of cheekbone width</dd>
        </div>
      </dl>
      <p className="recommended-frames"><strong>Frames that suit you:</strong> {recommendedLabels.join(', ')}</p>
      <p className="guide-note">Face-shape rules are a rough guide, not a science.</p>
    </section>
  )
}
