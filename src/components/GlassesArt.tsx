import type { GlassesId } from '../lib/glasses'

export function GlassesArt({ id }: { id: GlassesId }) {
  let lens
  switch (id) {
    case 'round':
      lens = <circle cx={80} cy={50} r={44} />
      break
    case 'oval':
      lens = <ellipse cx={80} cy={50} rx={52} ry={36} />
      break
    case 'rectangle':
      lens = <rect x={28} y={21} width={104} height={58} rx={10} />
      break
    case 'square':
      lens = <rect x={32} y={8} width={96} height={84} rx={14} />
      break
    case 'cat-eye':
      lens = <path d="M20 12 Q62 28 116 26 Q140 28 138 49 Q134 87 88 88 Q44 88 33 55 Z" />
      break
    case 'aviator':
      lens = <path d="M42 20 C58 18 104 18 120 20 C136 22 136 30 136 42 C136 66 120 90 100 90 C80 90 24 66 24 42 C24 30 26 22 42 20 Z" />
      break
  }
  const strokeWidth = id === 'square' ? 9 : id === 'cat-eye' ? 7 : id === 'aviator' ? 4 : 6
  const innerX = id === 'round' ? 124 : id === 'square' ? 128 : id === 'cat-eye' ? 138 : 132
  const outerX = id === 'round' ? 38 : id === 'square' ? 32 : id === 'aviator' ? 25 : 30

  return (
    <g stroke="#1d1d1f" strokeWidth={strokeWidth} strokeLinejoin="round" fill="rgba(140, 180, 220, 0.18)">
      {lens}
      <g transform="translate(300 0) scale(-1 1)">{lens}</g>
      <path d={`M${innerX} 45 Q150 34 ${300 - innerX} 45 M2 38 H${outerX} M${300 - outerX} 38 H298`} fill="none" />
      {id === 'aviator' && <path d="M124 20 H176" fill="none" />}
    </g>
  )
}
