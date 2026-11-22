import { useEffect, useState } from 'react'
import type { DumpItem, Layer, UserPreset } from '@shared/types'
import { composeDumpItem } from '../../../engine/render/exportRenderer'
import { useUiStore } from '../../stores/uiStore'
import { previewPresetPage } from './presetPreviewFrames'

export function usePresetHover(page: DumpItem | undefined, image: Layer | undefined, enabled: boolean) {
  const [hovered, setHovered] = useState<UserPreset | null>(null)
  const setPreview = useUiStore((s) => s.setPresetHoverPreview)

  useEffect(() => {
    if (!enabled || !hovered || !page || !image?.visible) return

    let cancelled = false
    const dismiss = (): void => setHovered(null)
    window.addEventListener('blur', dismiss)
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const rendered = previewPresetPage(page, image, hovered.look)
          const src = await composeDumpItem(rendered, {
            format: 'png', quality: 100, maxSide: 768, requiredImageId: image.id
          })
          if (!cancelled) setPreview({ page, imageId: image.id, name: hovered.name, src })
        } catch {
          // The full preview dialog provides an explicit rendering status.
        }
      })()
    }, 260)

    return () => {
      cancelled = true
      clearTimeout(timer)
      window.removeEventListener('blur', dismiss)
      setPreview(null)
    }
  }, [page, image, hovered, enabled, setPreview])

  return setHovered
}
