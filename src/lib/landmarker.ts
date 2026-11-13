import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import type { Point } from './faceShape'

export interface FaceDetection { points: Point[]; yaw: number; pitch: number }

let landmarkerPromise: Promise<FaceLandmarker> | undefined

export function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(`${import.meta.env.BASE_URL}mediapipe-wasm`)
      return FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: `${import.meta.env.BASE_URL}models/face_landmarker.task`, delegate: 'CPU' },
        runningMode: 'IMAGE',
        numFaces: 1,
        outputFacialTransformationMatrixes: true,
      })
    })()
  }
  return landmarkerPromise
}

export async function detectFace(canvas: HTMLCanvasElement): Promise<FaceDetection | null> {
  const result = (await getFaceLandmarker()).detect(canvas)
  if (result.faceLandmarks.length === 0) return null
  const points = result.faceLandmarks[0].map(({ x, y }) => ({ x: x * canvas.width, y: y * canvas.height }))
  const m = result.facialTransformationMatrixes[0].data
  const yaw = Math.atan2(-m[2], Math.hypot(m[6], m[10])) * 180 / Math.PI
  const pitch = Math.atan2(m[6], m[10]) * 180 / Math.PI
  return { points, yaw, pitch }
}
