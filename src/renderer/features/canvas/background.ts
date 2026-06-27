import type { CanvasBackground } from '@shared/types'

const NAMED: Record<string, string> = {
  black: '#000000',
  white: '#FFFFFF',
  light_gray: '#C8C8C8',
  medium_gray: '#7A7A7A',
  dark_gray: '#2E2E2E'
}

/** Cor CSS resolvida do background do canvas (transparent → null para checker). */
export function resolveBackground(bg: CanvasBackground): string | null {
  if (bg === 'transparent') return null
  return NAMED[bg] ?? bg
}

export const BACKGROUND_SWATCHES: { id: CanvasBackground; label: string; css: string }[] = [
  { id: 'black', label: 'Preto', css: '#000000' },
  { id: 'dark_gray', label: 'Cinza escuro', css: '#2E2E2E' },
  { id: 'medium_gray', label: 'Cinza médio', css: '#7A7A7A' },
  { id: 'light_gray', label: 'Cinza claro', css: '#C8C8C8' },
  { id: 'white', label: 'Branco', css: '#FFFFFF' },
  { id: 'transparent', label: 'Transparente', css: 'transparent' }
]
