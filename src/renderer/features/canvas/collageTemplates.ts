import type { CanvasBackground } from '@shared/types'

export interface Cell {
  x: number
  y: number
  w: number
  h: number
  /** Rotação do slot em graus (em torno do centro da célula). Ausente = 0 (sem inclinação). */
  rot?: number
  /** Slot de emenda de carrossel contínuo: `[index, count]` (a foto é fatiada entre os slides). */
  seam?: [number, number]
}

export interface CollageTemplate {
  id: string
  label: string
  cells: Cell[]
  /** Fundo a aplicar ao escolher este template (sobrepõe o `background` da sessão). */
  background?: CanvasBackground
}

export interface LayoutSession {
  id: string
  label: string
  templates: CollageTemplate[]
  /** Gutter (px do canvas) específico da sessão; ausente usa o GUTTER padrão do painel. */
  gutter?: number
  /** Fundo da página a aplicar ao escolher um layout desta sessão (ex.: Polaroid → branco). */
  background?: CanvasBackground
}

const T = 1 / 3
const Q = 1 / 4

/** Layouts padrão (estilo Instagram) agrupados por estilo em sessões colapsáveis. */
export const LAYOUT_SESSIONS: LayoutSession[] = [
  {
    id: 'grades',
    label: 'Grades',
    templates: [
      { id: 'full', label: '1 cheia', cells: [{ x: 0, y: 0, w: 1, h: 1 }] },
      {
        id: 'grid2x2',
        label: '2×2',
        cells: [
          { x: 0, y: 0, w: 0.5, h: 0.5 },
          { x: 0.5, y: 0, w: 0.5, h: 0.5 },
          { x: 0, y: 0.5, w: 0.5, h: 0.5 },
          { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
        ]
      },
      {
        id: 'grid3x3',
        label: '3×3',
        cells: [
          { x: 0, y: 0, w: T, h: T }, { x: T, y: 0, w: T, h: T }, { x: 2 * T, y: 0, w: T, h: T },
          { x: 0, y: T, w: T, h: T }, { x: T, y: T, w: T, h: T }, { x: 2 * T, y: T, w: T, h: T },
          { x: 0, y: 2 * T, w: T, h: T }, { x: T, y: 2 * T, w: T, h: T }, { x: 2 * T, y: 2 * T, w: T, h: T }
        ]
      },
      {
        id: 'grid2x3',
        label: '2×3',
        cells: [
          { x: 0, y: 0, w: 0.5, h: T }, { x: 0.5, y: 0, w: 0.5, h: T },
          { x: 0, y: T, w: 0.5, h: T }, { x: 0.5, y: T, w: 0.5, h: T },
          { x: 0, y: 2 * T, w: 0.5, h: T }, { x: 0.5, y: 2 * T, w: 0.5, h: T }
        ]
      },
      {
        id: 'grid3x2',
        label: '3×2',
        cells: [
          { x: 0, y: 0, w: T, h: 0.5 }, { x: T, y: 0, w: T, h: 0.5 }, { x: 2 * T, y: 0, w: T, h: 0.5 },
          { x: 0, y: 0.5, w: T, h: 0.5 }, { x: T, y: 0.5, w: T, h: 0.5 }, { x: 2 * T, y: 0.5, w: T, h: 0.5 }
        ]
      }
    ]
  },
  {
    id: 'tiras',
    label: 'Tiras',
    templates: [
      { id: '2v', label: '2 verticais', cells: [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }] },
      { id: '2h', label: '2 horizontais', cells: [{ x: 0, y: 0, w: 1, h: 0.5 }, { x: 0, y: 0.5, w: 1, h: 0.5 }] },
      {
        id: 'triptych',
        label: '3 verticais',
        cells: [{ x: 0, y: 0, w: T, h: 1 }, { x: T, y: 0, w: T, h: 1 }, { x: 2 * T, y: 0, w: T, h: 1 }]
      },
      {
        id: 'strip3h',
        label: '3 horizontais',
        cells: [{ x: 0, y: 0, w: 1, h: T }, { x: 0, y: T, w: 1, h: T }, { x: 0, y: 2 * T, w: 1, h: T }]
      },
      {
        id: 'strip4v',
        label: '4 verticais',
        cells: [
          { x: 0, y: 0, w: Q, h: 1 }, { x: Q, y: 0, w: Q, h: 1 },
          { x: 2 * Q, y: 0, w: Q, h: 1 }, { x: 3 * Q, y: 0, w: Q, h: 1 }
        ]
      }
    ]
  },
  {
    id: 'destaque',
    label: 'Destaque',
    templates: [
      {
        id: 'big-left',
        label: '1 + 2 (direita)',
        cells: [{ x: 0, y: 0, w: 0.6, h: 1 }, { x: 0.6, y: 0, w: 0.4, h: 0.5 }, { x: 0.6, y: 0.5, w: 0.4, h: 0.5 }]
      },
      {
        id: 'big-top',
        label: '1 + 2 (baixo)',
        cells: [{ x: 0, y: 0, w: 1, h: 0.6 }, { x: 0, y: 0.6, w: 0.5, h: 0.4 }, { x: 0.5, y: 0.6, w: 0.5, h: 0.4 }]
      },
      {
        id: 'big-left-3',
        label: '1 + 3 (direita)',
        cells: [
          { x: 0, y: 0, w: 0.6, h: 1 },
          { x: 0.6, y: 0, w: 0.4, h: T }, { x: 0.6, y: T, w: 0.4, h: T }, { x: 0.6, y: 2 * T, w: 0.4, h: T }
        ]
      },
      {
        id: 'big-top-3',
        label: '1 + 3 (baixo)',
        cells: [
          { x: 0, y: 0, w: 1, h: 0.6 },
          { x: 0, y: 0.6, w: T, h: 0.4 }, { x: T, y: 0.6, w: T, h: 0.4 }, { x: 2 * T, y: 0.6, w: T, h: 0.4 }
        ]
      },
      {
        id: 'hero-6',
        label: 'Destaque 6',
        cells: [
          { x: 0, y: 0, w: 2 * T, h: 2 * T },
          { x: 2 * T, y: 0, w: T, h: T }, { x: 2 * T, y: T, w: T, h: T },
          { x: 0, y: 2 * T, w: T, h: T }, { x: T, y: 2 * T, w: T, h: T }, { x: 2 * T, y: 2 * T, w: T, h: T }
        ]
      },
      // Hero 2/3 em cima + faixa 1/3 embaixo (largura cheia).
      { id: 'hero-23-top', label: 'Hero 2/3 (cima)', cells: [{ x: 0, y: 0, w: 1, h: 2 * T }, { x: 0, y: 2 * T, w: 1, h: T }] },
      // Faixa 1/3 em cima + hero 2/3 embaixo (largura cheia).
      { id: 'hero-23-bottom', label: 'Hero 2/3 (baixo)', cells: [{ x: 0, y: 0, w: 1, h: T }, { x: 0, y: T, w: 1, h: 2 * T }] },
      // Hero 2/3 à esquerda + faixa em pé 1/3 à direita (altura cheia).
      { id: 'hero-23-left', label: 'Hero 2/3 (esq.)', cells: [{ x: 0, y: 0, w: 2 * T, h: 1 }, { x: 2 * T, y: 0, w: T, h: 1 }] },
      // Faixa em pé 1/3 à esquerda + hero 2/3 à direita (altura cheia).
      { id: 'hero-23-right', label: 'Hero 2/3 (dir.)', cells: [{ x: 0, y: 0, w: T, h: 1 }, { x: T, y: 0, w: 2 * T, h: 1 }] }
    ]
  },
  {
    id: 'editorial',
    label: 'Editorial',
    templates: [
      {
        id: 'editorial',
        label: 'Editorial',
        cells: [
          { x: 0, y: 0, w: 0.66, h: 0.6 },
          { x: 0.66, y: 0, w: 0.34, h: 0.6 },
          { x: 0, y: 0.6, w: 0.34, h: 0.4 },
          { x: 0.34, y: 0.6, w: 0.66, h: 0.4 }
        ]
      },
      {
        id: 'editorial-3',
        label: 'Editorial 3',
        cells: [{ x: 0, y: 0, w: 0.55, h: 1 }, { x: 0.55, y: 0, w: 0.45, h: 0.5 }, { x: 0.55, y: 0.5, w: 0.45, h: 0.5 }]
      },
      {
        id: 'editorial-mag',
        label: 'Revista',
        cells: [
          { x: 0, y: 0, w: 0.6, h: 0.55 },
          { x: 0.6, y: 0, w: 0.4, h: 0.55 },
          { x: 0, y: 0.55, w: T, h: 0.45 },
          { x: T, y: 0.55, w: T, h: 0.45 },
          { x: 2 * T, y: 0.55, w: T, h: 0.45 }
        ]
      }
    ]
  },
  {
    id: 'stories',
    label: 'Stories',
    templates: [
      { id: 'st-2v', label: '2 lado a lado', cells: [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }] },
      { id: 'st-2h', label: '2 empilhadas', cells: [{ x: 0, y: 0, w: 1, h: 0.5 }, { x: 0, y: 0.5, w: 1, h: 0.5 }] },
      {
        id: 'st-3h',
        label: '3 faixas',
        cells: [{ x: 0, y: 0, w: 1, h: T }, { x: 0, y: T, w: 1, h: T }, { x: 0, y: 2 * T, w: 1, h: T }]
      },
      {
        id: 'st-4',
        label: '4 (2×2)',
        cells: [
          { x: 0, y: 0, w: 0.5, h: 0.5 },
          { x: 0.5, y: 0, w: 0.5, h: 0.5 },
          { x: 0, y: 0.5, w: 0.5, h: 0.5 },
          { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
        ]
      },
      {
        id: 'st-6',
        label: '6 (2×3)',
        cells: [
          { x: 0, y: 0, w: 0.5, h: T }, { x: 0.5, y: 0, w: 0.5, h: T },
          { x: 0, y: T, w: 0.5, h: T }, { x: 0.5, y: T, w: 0.5, h: T },
          { x: 0, y: 2 * T, w: 0.5, h: T }, { x: 0.5, y: 2 * T, w: 0.5, h: T }
        ]
      }
    ]
  },
  {
    id: 'stories-mix',
    label: 'Stories Mix',
    templates: [
      {
        id: 'st-hero-top',
        label: '1 grande + 2',
        cells: [{ x: 0, y: 0, w: 1, h: 0.6 }, { x: 0, y: 0.6, w: 0.5, h: 0.4 }, { x: 0.5, y: 0.6, w: 0.5, h: 0.4 }]
      },
      {
        id: 'st-hero-bottom',
        label: '2 + 1 grande',
        cells: [{ x: 0, y: 0, w: 0.5, h: 0.4 }, { x: 0.5, y: 0, w: 0.5, h: 0.4 }, { x: 0, y: 0.4, w: 1, h: 0.6 }]
      },
      {
        id: 'st-hero-strips',
        label: '1 grande + 3 faixas',
        cells: [
          { x: 0, y: 0, w: 1, h: 0.55 },
          { x: 0, y: 0.55, w: T, h: 0.45 }, { x: T, y: 0.55, w: T, h: 0.45 }, { x: 2 * T, y: 0.55, w: T, h: 0.45 }
        ]
      },
      {
        id: 'st-hero-left',
        label: '1 grande + 2 (lado)',
        cells: [{ x: 0, y: 0, w: 0.6, h: 1 }, { x: 0.6, y: 0, w: 0.4, h: 0.5 }, { x: 0.6, y: 0.5, w: 0.4, h: 0.5 }]
      }
    ]
  },
  {
    id: 'polaroid',
    label: 'Polaroid',
    gutter: 30, // moldura branca mais grossa entre/ao redor das fotos
    background: 'white', // estética polaroid = fotos sobre papel branco
    templates: [
      { id: 'pol-single', label: '1 foto', cells: [{ x: 0.1, y: 0.1, w: 0.8, h: 0.8 }] },
      // Formatos de quadro único (referência model_01..04): retrato alto, faixa, 3:4 e 4:5.
      { id: 'pol-model-01', label: 'Retrato 9:16', cells: [{ x: 0.22, y: 0.04, w: 0.56, h: 0.92 }] },
      { id: 'pol-model-02', label: 'Faixa', cells: [{ x: 0.05, y: 0.36, w: 0.9, h: 0.28 }] },
      { id: 'pol-model-03', label: 'Retrato 3:4', cells: [{ x: 0.13, y: 0.07, w: 0.74, h: 0.86 }] },
      { id: 'pol-model-04', label: 'Retrato 4:5', cells: [{ x: 0.1, y: 0.14, w: 0.8, h: 0.72 }] },
      { id: 'pol-2h', label: '2 empilhadas', cells: [{ x: 0, y: 0, w: 1, h: 0.5 }, { x: 0, y: 0.5, w: 1, h: 0.5 }] },
      { id: 'pol-2v', label: '2 lado a lado', cells: [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }] },
      {
        id: 'pol-3h',
        label: '3 faixas',
        cells: [{ x: 0, y: 0, w: 1, h: T }, { x: 0, y: T, w: 1, h: T }, { x: 0, y: 2 * T, w: 1, h: T }]
      },
      {
        id: 'pol-stagger',
        label: '3 escada',
        cells: [
          { x: 0.05, y: 0.45, w: 0.28, h: 0.48 },
          { x: 0.36, y: 0.27, w: 0.28, h: 0.48 },
          { x: 0.67, y: 0.09, w: 0.28, h: 0.48 }
        ]
      },
      {
        id: 'pol-grid9',
        label: 'Contato 3×3',
        cells: [
          { x: 0, y: 0, w: T, h: T }, { x: T, y: 0, w: T, h: T }, { x: 2 * T, y: 0, w: T, h: T },
          { x: 0, y: T, w: T, h: T }, { x: T, y: T, w: T, h: T }, { x: 2 * T, y: T, w: T, h: T },
          { x: 0, y: 2 * T, w: T, h: T }, { x: T, y: 2 * T, w: T, h: T }, { x: 2 * T, y: 2 * T, w: T, h: T }
        ]
      },
      { id: 'pol-land', label: '1 paisagem', cells: [{ x: 0.06, y: 0.3, w: 0.88, h: 0.4 }] },
      {
        id: 'pol-2-stagger',
        label: '2 escada',
        cells: [{ x: 0.06, y: 0.42, w: 0.42, h: 0.5 }, { x: 0.52, y: 0.08, w: 0.42, h: 0.5 }]
      },
      {
        id: 'pol-2-port',
        label: '2 retratos',
        cells: [{ x: 0.05, y: 0.2, w: 0.43, h: 0.6 }, { x: 0.52, y: 0.2, w: 0.43, h: 0.6 }]
      },
      {
        id: 'pol-hero',
        label: '1 grande + 2',
        cells: [{ x: 0, y: 0, w: 1, h: 0.62 }, { x: 0, y: 0.62, w: 0.5, h: 0.38 }, { x: 0.5, y: 0.62, w: 0.5, h: 0.38 }]
      },
      {
        id: 'pol-grid4',
        label: 'Contato 2×2',
        cells: [
          { x: 0, y: 0, w: 0.5, h: 0.5 }, { x: 0.5, y: 0, w: 0.5, h: 0.5 },
          { x: 0, y: 0.5, w: 0.5, h: 0.5 }, { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
        ]
      },
      {
        id: 'pol-grid6',
        label: 'Contato 2×3',
        cells: [
          { x: 0, y: 0, w: 0.5, h: T }, { x: 0.5, y: 0, w: 0.5, h: T },
          { x: 0, y: T, w: 0.5, h: T }, { x: 0.5, y: T, w: 0.5, h: T },
          { x: 0, y: 2 * T, w: 0.5, h: T }, { x: 0.5, y: 2 * T, w: 0.5, h: T }
        ]
      },
      {
        id: 'pol-4-scatter',
        label: '4 espalhadas',
        cells: [
          { x: 0.05, y: 0.06, w: 0.4, h: 0.4 }, { x: 0.55, y: 0.12, w: 0.4, h: 0.4 },
          { x: 0.05, y: 0.54, w: 0.4, h: 0.4 }, { x: 0.55, y: 0.58, w: 0.4, h: 0.4 }
        ]
      }
    ]
  },
  {
    // 'Dynamics': painéis inclinados/geométricos numa só sessão (uniu Persona 5 + Persona 3).
    // O fundo é POR TEMPLATE (campo `background`): grupo P5 → preto; grupo P3 → azul (Hora Sombria).
    id: 'dynamics',
    label: 'Dynamics',
    gutter: 16,
    templates: [
      ...([
      // — Inclinados / agressivo (ex-Persona 5) —
      { id: 'p5-hero-tilt', label: '1 inclinada', cells: [{ x: 0.07, y: 0.08, w: 0.86, h: 0.84, rot: -6 }] },
      {
        id: 'p5-vs',
        label: 'Confronto (2)',
        cells: [
          { x: 0.0, y: 0.05, w: 0.55, h: 0.9, rot: -9 },
          { x: 0.45, y: 0.05, w: 0.55, h: 0.9, rot: 9 }
        ]
      },
      {
        id: 'p5-diag-2',
        label: '2 paralelas',
        cells: [
          { x: 0.04, y: 0.06, w: 0.45, h: 0.88, rot: -8 },
          { x: 0.51, y: 0.06, w: 0.45, h: 0.88, rot: -8 }
        ]
      },
      {
        id: 'p5-slash-3',
        label: '1 + 2 corte',
        cells: [
          { x: 0.0, y: 0.0, w: 0.64, h: 1.0, rot: -6 },
          { x: 0.6, y: 0.03, w: 0.4, h: 0.46, rot: 8 },
          { x: 0.6, y: 0.51, w: 0.4, h: 0.46, rot: 8 }
        ]
      },
      {
        id: 'p5-zigzag-3',
        label: 'Zigue-zague (3)',
        cells: [
          { x: 0.02, y: 0.04, w: 0.44, h: 0.5, rot: -9 },
          { x: 0.28, y: 0.25, w: 0.44, h: 0.5, rot: 8 },
          { x: 0.54, y: 0.46, w: 0.44, h: 0.5, rot: -9 }
        ]
      },
      {
        id: 'p5-shards-4',
        label: 'Estilhaços (4)',
        cells: [
          { x: 0.0, y: 0.0, w: 0.52, h: 0.52, rot: -7 },
          { x: 0.48, y: 0.0, w: 0.52, h: 0.52, rot: 8 },
          { x: 0.0, y: 0.48, w: 0.52, h: 0.52, rot: 8 },
          { x: 0.48, y: 0.48, w: 0.52, h: 0.52, rot: -7 }
        ]
      },
      // — Retangulares ousados —
      { id: 'p5-edge', label: 'Hero + faixa', cells: [{ x: 0, y: 0, w: 0.72, h: 1 }, { x: 0.72, y: 0, w: 0.28, h: 1 }] },
      { id: 'p5-band', label: 'Hero + base', cells: [{ x: 0, y: 0, w: 1, h: 0.74 }, { x: 0, y: 0.74, w: 1, h: 0.26 }] },
      {
        id: 'p5-mosaic',
        label: 'Mosaico 1 + 3',
        cells: [
          { x: 0, y: 0, w: 0.62, h: 1 },
          { x: 0.62, y: 0, w: 0.38, h: T }, { x: 0.62, y: T, w: 0.38, h: T }, { x: 0.62, y: 2 * T, w: 0.38, h: T }
        ]
      },
      // — Hero (1 dominante + apoio inclinado) —
      {
        id: 'p5-hero-side-3',
        label: 'Hero + 3 (lado)',
        cells: [
          { x: 0.0, y: 0.0, w: 0.62, h: 1.0, rot: -5 },
          { x: 0.6, y: 0.02, w: 0.4, h: 0.31, rot: 7 },
          { x: 0.6, y: 0.345, w: 0.4, h: 0.31, rot: 7 },
          { x: 0.6, y: 0.67, w: 0.4, h: 0.31, rot: 7 }
        ]
      },
      {
        id: 'p5-hero-band',
        label: 'Hero + faixa inclinada',
        cells: [
          { x: 0.04, y: 0.02, w: 0.92, h: 0.64, rot: -4 },
          { x: 0.04, y: 0.66, w: 0.92, h: 0.32, rot: 4 }
        ]
      },
      // — Formas (estilo P5: agressivo, diagonal) —
      { id: 'p5-diamond', label: 'Losango', cells: [{ x: 0.16, y: 0.16, w: 0.68, h: 0.68, rot: 45 }] },
      {
        id: 'p5-x-cross',
        label: 'Cruz em X',
        cells: [
          { x: 0.02, y: 0.28, w: 0.96, h: 0.44, rot: 24 },
          { x: 0.02, y: 0.28, w: 0.96, h: 0.44, rot: -24 }
        ]
      },
      {
        id: 'p5-fan-3',
        label: 'Leque (3)',
        cells: [
          { x: 0.05, y: 0.2, w: 0.34, h: 0.66, rot: -18 },
          { x: 0.33, y: 0.16, w: 0.34, h: 0.7, rot: 0 },
          { x: 0.61, y: 0.2, w: 0.34, h: 0.66, rot: 18 }
        ]
      },
      {
        id: 'p5-burst-4',
        label: 'Explosão (4)',
        cells: [
          { x: 0.03, y: 0.03, w: 0.47, h: 0.47, rot: -16 },
          { x: 0.5, y: 0.02, w: 0.47, h: 0.47, rot: 16 },
          { x: 0.02, y: 0.5, w: 0.47, h: 0.47, rot: 16 },
          { x: 0.51, y: 0.5, w: 0.47, h: 0.47, rot: -16 }
        ]
      }
    ] as CollageTemplate[]).map((t) => ({ ...t, background: 'black' as CanvasBackground })),
      ...([
      // — Hero / geométrico (ex-Persona 3) —
      { id: 'p3-hero', label: '1 destaque', cells: [{ x: 0.06, y: 0.08, w: 0.88, h: 0.84, rot: 3 }] },
      {
        id: 'p3-hero-duo',
        label: 'Hero + 2',
        cells: [
          { x: 0.05, y: 0.05, w: 0.9, h: 0.56, rot: 0 },
          { x: 0.05, y: 0.65, w: 0.43, h: 0.3, rot: -3 },
          { x: 0.52, y: 0.65, w: 0.43, h: 0.3, rot: 3 }
        ]
      },
      // — Formas (estilo P3: losango/geométrico, equilibrado) —
      { id: 'p3-diamond', label: 'Losango', cells: [{ x: 0.18, y: 0.18, w: 0.64, h: 0.64, rot: 45 }] },
      {
        id: 'p3-diamond-duo',
        label: '2 losangos',
        cells: [
          { x: 0.02, y: 0.24, w: 0.46, h: 0.46, rot: 45 },
          { x: 0.52, y: 0.24, w: 0.46, h: 0.46, rot: 45 }
        ]
      },
      {
        id: 'p3-stack',
        label: '3 faixas',
        cells: [
          { x: 0.04, y: 0.05, w: 0.92, h: 0.27, rot: -3 },
          { x: 0.04, y: 0.36, w: 0.92, h: 0.27, rot: 3 },
          { x: 0.04, y: 0.67, w: 0.92, h: 0.27, rot: -3 }
        ]
      },
      {
        id: 'p3-chevron',
        label: 'Chevron (2)',
        cells: [
          { x: 0.04, y: 0.1, w: 0.5, h: 0.8, rot: 12 },
          { x: 0.46, y: 0.1, w: 0.5, h: 0.8, rot: -12 }
        ]
      }
    ] as CollageTemplate[]).map((t) => ({ ...t, background: '#13294f' as CanvasBackground }))
    ]
  },
  {
    // Carrossel contínuo (sem emenda): pares Parte 1 / Parte 2. A foto da emenda (`seam`)
    // é fatiada a partir de suas dimensões — use a MESMA foto larga nos dois slides para
    // ela atravessar o corte do carrossel. Gutter 0 para as fotos tocarem a borda da emenda.
    id: 'carousel',
    label: 'Carrossel Contínuo',
    gutter: 0,
    templates: [
      // Panorama: 1 foto fatiada em 2 slides.
      { id: 'car-pano-1', label: 'Panorama · 1', cells: [{ x: 0, y: 0, w: 1, h: 1, seam: [0, 2] }] },
      { id: 'car-pano-2', label: 'Panorama · 2', cells: [{ x: 0, y: 0, w: 1, h: 1, seam: [1, 2] }] },
      // Faixa superior contínua + foto inteira embaixo.
      {
        id: 'car-band-1',
        label: 'Faixa+foto · 1',
        cells: [{ x: 0, y: 0, w: 1, h: 0.6, seam: [0, 2] }, { x: 0, y: 0.6, w: 1, h: 0.4 }]
      },
      {
        id: 'car-band-2',
        label: 'Faixa+foto · 2',
        cells: [{ x: 0, y: 0, w: 1, h: 0.6, seam: [1, 2] }, { x: 0, y: 0.6, w: 1, h: 0.4 }]
      },
      // Faixa central contínua + fotos inteiras em cima e embaixo.
      {
        id: 'car-mid-1',
        label: 'Meio+2 · 1',
        cells: [
          { x: 0, y: 0, w: 1, h: 0.28 },
          { x: 0, y: 0.28, w: 1, h: 0.44, seam: [0, 2] },
          { x: 0, y: 0.72, w: 1, h: 0.28 }
        ]
      },
      {
        id: 'car-mid-2',
        label: 'Meio+2 · 2',
        cells: [
          { x: 0, y: 0, w: 1, h: 0.28 },
          { x: 0, y: 0.28, w: 1, h: 0.44, seam: [1, 2] },
          { x: 0, y: 0.72, w: 1, h: 0.28 }
        ]
      },
      // Hero atravessa a emenda + foto inteira no lado externo.
      {
        id: 'car-hero-1',
        label: 'Hero+lado · 1',
        cells: [{ x: 0, y: 0, w: 0.35, h: 1 }, { x: 0.35, y: 0, w: 0.65, h: 1, seam: [0, 2] }]
      },
      {
        id: 'car-hero-2',
        label: 'Hero+lado · 2',
        cells: [{ x: 0, y: 0, w: 0.65, h: 1, seam: [1, 2] }, { x: 0.65, y: 0, w: 0.35, h: 1 }]
      }
    ]
  }
]

/** Lista plana de todos os templates (todas as sessões). */
export const COLLAGE_TEMPLATES: CollageTemplate[] = LAYOUT_SESSIONS.flatMap((s) => s.templates)

/** Retângulo normalizado (cover) sobre a fonte para preencher uma célula sem distorção. */
export function coverRect(srcW: number, srcH: number, cellW: number, cellH: number): Cell {
  const cellRatio = cellW / cellH
  const srcRatio = srcW / srcH
  let w = 1
  let h = 1
  if (srcRatio > cellRatio) w = cellRatio / srcRatio
  else h = srcRatio / cellRatio
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h }
}
