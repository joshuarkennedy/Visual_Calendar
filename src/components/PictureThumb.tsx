import type { Picture } from '../types'

/** Renders a picture (emoji or uploaded photo) filling its container. */
export function PictureThumb({
  picture,
  className = '',
  style,
  title,
}: {
  picture: Picture | undefined
  className?: string
  style?: React.CSSProperties
  title?: string
}) {
  if (!picture) {
    return (
      <div className={`pic ${className}`} style={style} aria-hidden>
        <span className="emoji">❓</span>
      </div>
    )
  }
  return (
    <div
      className={`pic ${className}`}
      style={style}
      role="img"
      aria-label={picture.name}
      title={title ?? picture.name}
    >
      {picture.kind === 'photo' && picture.dataUrl ? (
        <img src={picture.dataUrl} alt={picture.name} />
      ) : (
        <span className="emoji">{picture.emoji ?? '❓'}</span>
      )}
    </div>
  )
}
