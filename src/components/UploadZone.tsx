import { useState } from 'react'

export function UploadZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false)

  return (
    <div
      className={`upload-zone${dragging ? ' is-dragging' : ''}`}
      onDragOver={event => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={event => {
        event.preventDefault()
        setDragging(false)
        const file = event.dataTransfer.files[0]
        if (file) onFile(file)
      }}
    >
      <h2>Drop a selfie here</h2>
      <label className="button primary">
        Choose photo
        <input
          className="visually-hidden"
          type="file"
          accept="image/*"
          onChange={event => {
            const file = event.currentTarget.files?.[0]
            event.currentTarget.value = ''
            if (file) onFile(file)
          }}
        />
      </label>
    </div>
  )
}
