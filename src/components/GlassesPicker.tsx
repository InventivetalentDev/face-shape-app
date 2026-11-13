import { GLASSES_OPTIONS } from '../lib/glasses'
import type { GlassesId } from '../lib/glasses'
import { GlassesArt } from './GlassesArt'

interface GlassesPickerProps {
  selected: GlassesId | null
  recommended: GlassesId[]
  onSelect: (id: GlassesId | null) => void
}

export function GlassesPicker({ selected, recommended, onSelect }: GlassesPickerProps) {
  return (
    <section className="glasses-picker" aria-labelledby="frames-heading">
      <h2 id="frames-heading">Try on frames</h2>
      <div className="picker-grid">
        <button className="none-option" type="button" aria-pressed={selected === null} onClick={() => onSelect(null)}>None</button>
        {GLASSES_OPTIONS.map(({ id, label }) => (
          <button className="frame-option" key={id} type="button" aria-pressed={selected === id} onClick={() => onSelect(id)}>
            <svg viewBox="0 0 300 100" aria-hidden="true"><GlassesArt id={id} /></svg>
            <span>{label}</span>
            {recommended.includes(id) && <span className="recommendation">Suits you</span>}
          </button>
        ))}
      </div>
    </section>
  )
}
