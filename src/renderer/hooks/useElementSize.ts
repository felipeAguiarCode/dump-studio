import { useEffect, useRef, useState } from 'react'

/** Observa o tamanho de um elemento (ResizeObserver). */
export function useElementSize<T extends HTMLElement>(): {
  ref: React.RefObject<T>
  size: { width: number; height: number }
} {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect
      setSize({ width: rect.width, height: rect.height })
    })
    ro.observe(el)
    setSize({ width: el.clientWidth, height: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  return { ref, size }
}
