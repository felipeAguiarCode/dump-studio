// Fontes empacotadas (offline) — registra os @font-face e expõe um catálogo curado.
// A Inter Variable já é importada em main.tsx. San Francisco (Apple) e as fontes
// internas do Instagram são proprietárias; aqui usamos equivalentes gratuitos do
// Google Fonts via @fontsource para evocar os mesmos estilos.
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/700.css'
import '@fontsource/poppins/400.css'
import '@fontsource/poppins/700.css'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/cormorant-garamond/400.css'
import '@fontsource/cormorant-garamond/700.css'
import '@fontsource/bodoni-moda/400.css'
import '@fontsource/bodoni-moda/700.css'
import '@fontsource/eb-garamond/400.css'
import '@fontsource/eb-garamond/700.css'
import '@fontsource/marcellus/400.css'
import '@fontsource/cinzel/400.css'
import '@fontsource/cinzel/700.css'
import '@fontsource/italiana/400.css'
import '@fontsource/great-vibes/400.css'
import '@fontsource/pinyon-script/400.css'
import '@fontsource/dancing-script/400.css'
import '@fontsource/dancing-script/700.css'
import '@fontsource/sacramento/400.css'
import '@fontsource/bebas-neue/400.css'
import '@fontsource/oswald/400.css'
import '@fontsource/oswald/700.css'
import '@fontsource/archivo-black/400.css'
import '@fontsource/space-mono/400.css'
import '@fontsource/space-mono/700.css'
import '@fontsource/caveat/400.css'
import '@fontsource/caveat/700.css'
import '@fontsource/satisfy/400.css'
import '@fontsource/allura/400.css'
import '@fontsource/parisienne/400.css'
import '@fontsource/shadows-into-light/400.css'
import '@fontsource/orbitron/400.css'
import '@fontsource/orbitron/700.css'
import '@fontsource/audiowide/400.css'
import '@fontsource/russo-one/400.css'
import '@fontsource/bungee/400.css'
import '@fontsource/press-start-2p/400.css'
import '@fontsource/vt323/400.css'
import '@fontsource/pixelify-sans/400.css'
import '@fontsource/pixelify-sans/700.css'
import '@fontsource/silkscreen/400.css'
import '@fontsource/silkscreen/700.css'
// Stories / apps de edição do Instagram (Canva, Mojo, VSCO, Unfold, Phonto…).
import '@fontsource/anton/400.css'
import '@fontsource/abril-fatface/400.css'
import '@fontsource/dm-serif-display/400.css'
import '@fontsource/pacifico/400.css'
import '@fontsource/lobster/400.css'
import '@fontsource/permanent-marker/400.css'
import '@fontsource/outfit/400.css'
import '@fontsource/outfit/700.css'
import '@fontsource/sora/400.css'
import '@fontsource/sora/700.css'
import '@fontsource/league-spartan/400.css'
import '@fontsource/league-spartan/700.css'
// Fashion / editorial (revistas de moda e marcas de luxo: Didone + sans elegantes).
import '@fontsource/prata/400.css'
import '@fontsource/gilda-display/400.css'
import '@fontsource/yeseva-one/400.css'
import '@fontsource/antic-didone/400.css'
import '@fontsource/forum/400.css'
import '@fontsource/tenor-sans/400.css'
import '@fontsource/jost/400.css'
import '@fontsource/jost/700.css'
import '@fontsource/josefin-sans/400.css'
import '@fontsource/josefin-sans/700.css'

export type FontCategory = 'stories' | 'fashion' | 'sans' | 'serif' | 'script' | 'display' | 'gamer' | 'pixel' | 'mono'

export interface FontDef {
  /** Nome CSS da família (usado no Konva e no CSS). */
  family: string
  label: string
  category: FontCategory
}

export const FONT_CATEGORY_ORDER: FontCategory[] = ['stories', 'fashion', 'sans', 'serif', 'script', 'display', 'gamer', 'pixel', 'mono']

export const FONT_CATEGORY_LABELS: Record<FontCategory, string> = {
  stories: 'Stories / Instagram',
  fashion: 'Fashion / Editorial',
  sans: 'Apple / Sem serifa',
  serif: 'Elegantes',
  script: 'Manuscritas',
  display: 'Display / Fortes',
  gamer: 'Gamer / Futurista',
  pixel: 'Pixel art',
  mono: 'Máquina de escrever'
}

export const FONTS: FontDef[] = [
  // Stories / apps de edição do Instagram (favoritas de Canva, Mojo, VSCO, Unfold…).
  { family: 'Anton', label: 'Anton', category: 'stories' },
  { family: 'Bebas Neue', label: 'Bebas Neue', category: 'stories' },
  { family: 'League Spartan', label: 'League Spartan', category: 'stories' },
  { family: 'Outfit', label: 'Outfit', category: 'stories' },
  { family: 'Sora', label: 'Sora', category: 'stories' },
  { family: 'Abril Fatface', label: 'Abril Fatface', category: 'stories' },
  { family: 'DM Serif Display', label: 'DM Serif Display', category: 'stories' },
  { family: 'Pacifico', label: 'Pacifico', category: 'stories' },
  { family: 'Lobster', label: 'Lobster', category: 'stories' },
  { family: 'Permanent Marker', label: 'Permanent Marker', category: 'stories' },
  // Fashion / editorial (Vogue/Bazaar e marcas de luxo: Didone de alto contraste + sans elegantes).
  { family: 'Prata', label: 'Prata', category: 'fashion' },
  { family: 'Gilda Display', label: 'Gilda Display', category: 'fashion' },
  { family: 'Yeseva One', label: 'Yeseva One', category: 'fashion' },
  { family: 'Antic Didone', label: 'Antic Didone', category: 'fashion' },
  { family: 'Forum', label: 'Forum', category: 'fashion' },
  { family: 'Tenor Sans', label: 'Tenor Sans', category: 'fashion' },
  { family: 'Jost', label: 'Jost', category: 'fashion' },
  { family: 'Josefin Sans', label: 'Josefin Sans', category: 'fashion' },
  { family: 'Inter Variable', label: 'Inter', category: 'sans' },
  { family: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', category: 'sans' },
  { family: 'Montserrat', label: 'Montserrat', category: 'sans' },
  { family: 'Poppins', label: 'Poppins', category: 'sans' },
  { family: 'Playfair Display', label: 'Playfair Display', category: 'serif' },
  { family: 'Cormorant Garamond', label: 'Cormorant Garamond', category: 'serif' },
  { family: 'Bodoni Moda', label: 'Bodoni Moda', category: 'serif' },
  { family: 'EB Garamond', label: 'EB Garamond', category: 'serif' },
  { family: 'Marcellus', label: 'Marcellus', category: 'serif' },
  { family: 'Cinzel', label: 'Cinzel', category: 'serif' },
  { family: 'Italiana', label: 'Italiana', category: 'serif' },
  { family: 'Great Vibes', label: 'Great Vibes', category: 'script' },
  { family: 'Pinyon Script', label: 'Pinyon Script', category: 'script' },
  { family: 'Dancing Script', label: 'Dancing Script', category: 'script' },
  { family: 'Sacramento', label: 'Sacramento', category: 'script' },
  { family: 'Caveat', label: 'Caveat', category: 'script' },
  { family: 'Satisfy', label: 'Satisfy', category: 'script' },
  { family: 'Allura', label: 'Allura', category: 'script' },
  { family: 'Parisienne', label: 'Parisienne', category: 'script' },
  { family: 'Shadows Into Light', label: 'Shadows Into Light', category: 'script' },
  { family: 'Oswald', label: 'Oswald', category: 'display' },
  { family: 'Archivo Black', label: 'Archivo Black', category: 'display' },
  { family: 'Orbitron', label: 'Orbitron', category: 'gamer' },
  { family: 'Audiowide', label: 'Audiowide', category: 'gamer' },
  { family: 'Russo One', label: 'Russo One', category: 'gamer' },
  { family: 'Bungee', label: 'Bungee', category: 'gamer' },
  { family: 'Press Start 2P', label: 'Press Start 2P', category: 'pixel' },
  { family: 'VT323', label: 'VT323', category: 'pixel' },
  { family: 'Pixelify Sans', label: 'Pixelify Sans', category: 'pixel' },
  { family: 'Silkscreen', label: 'Silkscreen', category: 'pixel' },
  { family: 'Space Mono', label: 'Space Mono', category: 'mono' }
]

/** Aspas quando a família tem espaço (necessário no shorthand de fonte). */
export const quoteFamily = (f: string): string => (/\s/.test(f) ? `"${f}"` : f)

/** Garante que as famílias estão carregadas antes de desenhar texto no Konva (canvas). */
export async function ensureFontsLoaded(families: string[]): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return
  await Promise.all(
    [...new Set(families)].flatMap((f) => [
      document.fonts.load(`400 64px ${quoteFamily(f)}`).catch(() => undefined),
      document.fonts.load(`700 64px ${quoteFamily(f)}`).catch(() => undefined)
    ])
  )
}

let preloaded = false
/** Aquece o cache de todas as fontes (previews do dropdown + texto no canvas). Não bloqueia. */
export function preloadFonts(): void {
  if (preloaded) return
  preloaded = true
  void ensureFontsLoaded(FONTS.map((f) => f.family))
}
