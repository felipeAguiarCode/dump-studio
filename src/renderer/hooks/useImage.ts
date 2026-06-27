import { useEffect, useState } from 'react'

/** Carrega um HTMLImageElement a partir de uma URL (noir-asset://, data:, etc.). */
export function useImage(src: string | undefined): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!src) {
      setImage(null)
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    let active = true
    img.onload = () => {
      if (active) setImage(img)
    }
    img.onerror = () => {
      if (active) setImage(null)
    }
    img.src = src
    return () => {
      active = false
    }
  }, [src])

  return image
}
