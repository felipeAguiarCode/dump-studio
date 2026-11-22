/**
 * Constantes compartilhadas entre main e renderer.
 * (Sem dependências de electron/node/DOM — `shared/` é neutro.)
 */

export const APP_NAME = 'My Dump Studio'

export type InstagramFormat =
  | 'portrait_post_3_4'
  | 'square_post_1_1'
  | 'landscape_post_191'
  | 'ultrawide_post'
  | 'feed_4_5'
  | 'story_reel_9_16'

export interface FormatSpec {
  id: InstagramFormat
  label: string
  /** Rótulo compacto (botão do dropdown). */
  short: string
  ratioLabel: string
  width: number
  height: number
}

export const INSTAGRAM_FORMATS: Record<InstagramFormat, FormatSpec> = {
  portrait_post_3_4: {
    id: 'portrait_post_3_4',
    label: 'Portrait Post',
    short: 'Portrait · 3:4',
    ratioLabel: '3:4 — 1080 × 1440 px',
    width: 1080,
    height: 1440
  },
  square_post_1_1: {
    id: 'square_post_1_1',
    label: 'Square Post',
    short: 'Square · 1:1',
    ratioLabel: '1:1 — 1080 × 1080 px',
    width: 1080,
    height: 1080
  },
  landscape_post_191: {
    id: 'landscape_post_191',
    label: 'Landscape Post',
    short: 'Landscape · 1.91:1',
    ratioLabel: '1.91:1 — 1080 × 566 px',
    width: 1080,
    height: 566
  },
  ultrawide_post: {
    id: 'ultrawide_post',
    label: 'Ultra-Wide Post',
    short: 'Ultra-Wide · 4.74:1',
    ratioLabel: '4.74:1 — 5120 × 1080 px',
    width: 5120,
    height: 1080
  },
  feed_4_5: {
    id: 'feed_4_5',
    label: 'Post (Feed)',
    short: 'Feed · 4:5',
    ratioLabel: '4:5 — 1080 × 1350 px',
    width: 1080,
    height: 1350
  },
  story_reel_9_16: {
    id: 'story_reel_9_16',
    label: 'Stories / Reels',
    short: 'Stories · 9:16',
    ratioLabel: '9:16 — 1080 × 1920 px',
    width: 1080,
    height: 1920
  }
}

/** Seções (com separador) para a UI de seleção de formato. */
export const FORMAT_GROUPS: { label: string; formats: InstagramFormat[] }[] = [
  { label: 'Posts', formats: ['portrait_post_3_4', 'square_post_1_1', 'landscape_post_191', 'ultrawide_post'] },
  { label: 'Feed & Stories', formats: ['feed_4_5', 'story_reel_9_16'] }
]

export const DEFAULT_FORMAT: InstagramFormat = 'portrait_post_3_4'
