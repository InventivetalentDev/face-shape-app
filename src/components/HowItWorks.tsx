import { GlassesArt } from './GlassesArt'

export function HowItWorks() {
  return (
    <section className="how-it-works" aria-labelledby="how-heading">
      <div className="intro-preview">
        <svg viewBox="0 0 240 280" role="img" aria-label="Example result: a face outline with measurement lines and round glasses">
          <path className="preview-face" d="M120 30 C175 30 200 75 200 130 C200 195 165 250 120 250 C75 250 40 195 40 130 C40 75 65 30 120 30 Z" />
          <line className="preview-line line-length" x1={120} y1={30} x2={120} y2={250} />
          <line className="preview-line line-forehead" x1={53} y1={70} x2={187} y2={70} />
          <line className="preview-line line-cheek" x1={40} y1={130} x2={200} y2={130} />
          <line className="preview-line line-jaw" x1={58} y1={205} x2={182} y2={205} />
          <g transform="translate(120 108) scale(0.5) translate(-150 -50)"><GlassesArt id="round" /></g>
        </svg>
      </div>
      <h2 id="how-heading">How it works</h2>
      <ol className="steps">
        <li><strong>Measure.</strong> The app finds 478 points on your face and compares the widths of your forehead, cheekbones, and jaw with your face length.</li>
        <li><strong>Match.</strong> You get the closest of six face shapes, and the frame styles that usually suit it.</li>
        <li><strong>Try on.</strong> Pick one of six frame styles. It snaps onto your eyes, and you can move, resize, and rotate it.</li>
      </ol>
    </section>
  )
}
