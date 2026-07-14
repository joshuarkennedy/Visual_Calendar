import { useMemo, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Picture } from '../types'
import { PALETTE } from '../types'
import { Modal } from './Modal'
import { PictureThumb } from './PictureThumb'
import { fileToDataUrl } from '../utils/image'

/** Manage the picture bank: upload photos, hide built-ins, delete uploads. */
export function PictureBankModal({ onClose }: { onClose: () => void }) {
  const { pictures, addPicture, deletePicture } = useApp()
  const fileRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

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
    if (!files) return
    setBusy(true)
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        const dataUrl = await fileToDataUrl(file)
        const name = file.name.replace(/\.[^.]+$/, '').slice(0, 40) || 'Photo'
        addPicture({ name, kind: 'photo', dataUrl, color: PALETTE[5].value, category: 'My photos' })
      }
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Modal
      title="Picture bank"
      onClose={onClose}
      footer={
        <>
          <div style={{ flex: 1 }} />
          <button className="btn primary" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      <p className="hint">
        Upload real photos of the person, places or objects — familiar pictures work best.
        Built-in pictures can be hidden; your uploads can be deleted.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button className="btn primary" onClick={() => fileRef.current?.click()} disabled={busy}>
        📷 {busy ? 'Adding…' : 'Upload photos'}
      </button>

      {byCategory.map(([cat, list]) => (
        <div key={cat} className="field">
          <label>{cat}</label>
          <div className="pic-grid">
            {list.map((p) => (
              <div key={p.id} className="pic-tile">
                <PictureThumb picture={p} style={{ ['--evt' as string]: p.color }} />
                <span className="pic-name">{p.name}</span>
                <button
                  className="btn ghost"
                  style={{ color: 'var(--danger)', padding: '6px 8px', minHeight: 0 }}
                  onClick={() => deletePicture(p.id)}
                  aria-label={`${p.builtIn ? 'Hide' : 'Delete'} ${p.name}`}
                >
                  {p.builtIn ? 'Hide' : '🗑 Delete'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Modal>
  )
}
