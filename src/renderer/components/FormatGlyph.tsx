import { INSTAGRAM_FORMATS, type InstagramFormat } from '@shared/constants'
import { cn } from '../lib/cn'

export function FormatGlyph({
  format,
  size = 'md'
}: {
  format: InstagramFormat
  size?: 'sm' | 'md'
}): JSX.Element {
  const spec = INSTAGRAM_FORMATS[format]
  const ar = spec.width / spec.height
  const box = size === 'sm' ? 36 : 56
  const avail = size === 'sm' ? 22 : 38
  // Retângulo proporcional à aspect ratio, contido em `avail`.
  let w = avail
  let h = avail
  if (ar >= 1) h = Math.max(3, avail / ar)
  else w = Math.max(3, avail * ar)

  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-lg bg-noir-bg')}
      style={{ width: box, height: box }}
    >
      <div className="rounded-sm border border-noir-muted/60" style={{ width: w, height: h }} />
    </div>
  )
}
