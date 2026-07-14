import { useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Picture } from '../types'
import { PALETTE } from '../types'
import { PictureThumb } from './PictureThumb'
import { fileToDataUrl } from '../utils/image'

/**
 * Grid of all pictures (built-in bank + uploads), grouped by category, with an
 * upload tile. Selecting a picture calls back with it.
 */
export function PicturePicker({
  selectedId,
  onSelect,
}: {
  selectedId?: string
  onSelect: (p: Picture) => void
}) {
  const { pictures, addPicture } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const byCategory = useMemo(() => {
    const map = new Map<string, Picture[]>()
    for (const p of pictures) {
      const list = map.get(p.category) ?? []
      list.push(p)
      map.set(p.category, list)
    }
    return Array.from(map.entries())
  }, [pictures])

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setBusy(true)
    try {
      let last: Picture | null = null
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        const dataUrl = await fileToDataUrl(file)
        const name = file.name.replace(/\.[^.]+$/, '').slice(0, 40) || 'Photo'
        last = addPicture({
          name,
          kind: 'photo',
          dataUrl,
          color: PALETTE[5].value,
          category: 'My photos',
        })
      }
      if (last) onSelect(last)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p style={{ color: 'var(--danger)', fontWeight: 700 }}>{error}</p>}
      <div className="pic-grid">
        <button
          type="button"
          className="upload-tile"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <span style={{ fontSize: 40 }}>📷</span>
          {busy ? 'Adding…' : 'Upload photo'}
        </button>

        {byCategory.map(([cat, list]) => (
          <PictureCategory
            key={cat}
            category={cat}
            list={list}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

function PictureCategory({
  category,
  list,
  selectedId,
  onSelect,
}: {
  category: string
  list: Picture[]
  selectedId?: string
  onSelect: (p: Picture) => void
}) {
  return (
    <>
      <div className="cat-title">{category}</div>
      {list.map((p) => (
        <button
          key={p.id}
          type="button"
          className={`pic-tile ${p.id === selectedId ? 'sel' : ''}`}
          onClick={() => onSelect(p)}
          aria-pressed={p.id === selectedId}
        >
          <PictureThumb picture={p} style={{ ['--evt' as string]: p.color }} />
          <span className="pic-name">{p.name}</span>
        </button>
      ))}
    </>
  )
}
