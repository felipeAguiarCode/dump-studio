import type { PhotoFilterName } from '@shared/types'

export interface FilterDef {
  name: PhotoFilterName
  label: string
  description: string
}

export interface FilterSession {
  id: string
  label: string
  description: string
  filters: FilterDef[]
}

export const FILTER_SESSIONS: FilterSession[] = [
  {
    id: 'noir',
    label: 'Noir',
    description: 'Preto e branco',
    filters: [
      {
        name: 'high_contrast_bw',
        label: 'Preto e Branco Alto Contraste',
        description: 'Contraste intenso com pretos profundos e brancos brilhantes.'
      },
      {
        name: 'silver_tones',
        label: 'Tons de Prata',
        description: 'P&B elegante com médios tons brilhantes e acabamento refinado.'
      },
      {
        name: 'vintage',
        label: 'Vintage',
        description: 'Preto e branco suavizado, com fade, textura e sensação atemporal.'
      },
      {
        name: 'mono',
        label: 'Mono',
        description: 'Preto e branco limpo e neutro, inspirado no visual clássico mobile.'
      },
      {
        name: 'tonal',
        label: 'Tonal',
        description: 'Contraste equilibrado com cinzas ricos e transição suave entre tons.'
      },
      {
        name: 'noir',
        label: 'Noir',
        description: 'P&B dramático com sombras profundas e atmosfera cinematográfica.'
      },
      {
        name: 'silvertone',
        label: 'Silvertone',
        description: 'Realces brilhantes com sensação metálica e acabamento de prata.'
      },
      {
        name: 'newspaper_noir',
        label: 'Jornal Noir',
        description: 'Textura granulada e contraste seco, inspirado em fotografia impressa antiga.'
      }
    ]
  },
  {
    id: 'fujifilm',
    label: 'Fujifilm',
    description: 'Simulações de filme',
    filters: [
      {
        name: 'fuji_provia',
        label: 'Provia / Standard',
        description: 'Cor neutra e equilibrada, com contraste moderado — a base versátil da Fujifilm.'
      },
      {
        name: 'fuji_velvia',
        label: 'Velvia / Vivid',
        description: 'Cores saturadas e vibrantes com contraste alto, ideal para paisagens.'
      },
      {
        name: 'fuji_astia',
        label: 'Astia / Soft',
        description: 'Cor suave e contraste baixo, com tons de pele agradáveis.'
      },
      {
        name: 'fuji_classic_chrome',
        label: 'Classic Chrome',
        description: 'Tons dessaturados e sombras densas, com clima documental.'
      },
      {
        name: 'fuji_classic_neg',
        label: 'Classic Neg',
        description: 'Sombras esverdeadas e realces quentes, inspirado no filme Superia.'
      },
      {
        name: 'fuji_eterna',
        label: 'Eterna / Cinema',
        description: 'Baixa saturação e contraste suave, com look cinematográfico de filme.'
      },
      {
        name: 'fuji_nostalgic_neg',
        label: 'Nostalgic Neg',
        description: 'Realces âmbar e sombras suaves, evocando fotografias dos anos 1970.'
      },
      {
        name: 'fuji_acros',
        label: 'ACROS',
        description: 'Preto e branco fino, com gradação tonal rica e granulação elegante.'
      }
    ]
  },
  {
    id: 'cinematic',
    label: 'Cinematográfico',
    description: 'Looks de cinema',
    filters: [
      {
        name: 'cine_teal_orange',
        label: 'Teal & Orange',
        description: 'Sombras azul-esverdeadas e peles alaranjadas — a gradação clássica de Hollywood.'
      },
      {
        name: 'cine_bleach_bypass',
        label: 'Bleach Bypass',
        description: 'Alto contraste e baixa saturação, com brilho metálico de prata retida.'
      },
      {
        name: 'cine_day_for_night',
        label: 'Day for Night',
        description: 'Escurecido e frio, transformando luz do dia em cena noturna.'
      },
      {
        name: 'cine_thriller',
        label: 'Thriller',
        description: 'Tons verde-musgo e sombras densas, com tensão de suspense.'
      },
      {
        name: 'cine_golden',
        label: 'Golden Hour',
        description: 'Luzes douradas e quentes, com clima épico de fim de tarde.'
      }
    ]
  },
  {
    id: 'aesthetic',
    label: 'Aesthetic',
    description: 'Estética para redes',
    filters: [
      {
        name: 'aes_pastel',
        label: 'Pastel Dream',
        description: 'Cores suaves e pastel, com luzes levantadas e ar sonhador.'
      },
      {
        name: 'aes_faded_matte',
        label: 'Faded Matte',
        description: 'Pretos levantados e acabamento fosco, com visual desbotado moderno.'
      },
      {
        name: 'aes_moody',
        label: 'Moody',
        description: 'Escuro e dessaturado, com sombras densas e clima introspectivo.'
      },
      {
        name: 'aes_clean',
        label: 'Clean & Bright',
        description: 'Claro, limpo e arejado, com brancos brilhantes e cor delicada.'
      },
      {
        name: 'aes_warm_peach',
        label: 'Warm Peach',
        description: 'Tons quentes e pêssego, lisonjeiros para a pele.'
      }
    ]
  },
  {
    id: 'vintage',
    label: 'Vintage',
    description: 'Filmes retrô',
    filters: [
      {
        name: 'vint_seventies',
        label: 'Anos 70',
        description: 'Dominante âmbar e contraste suave, com fade de filme antigo.'
      },
      {
        name: 'vint_polaroid',
        label: 'Polaroid',
        description: 'Lavado e levemente esverdeado, com luzes amareladas instantâneas.'
      },
      {
        name: 'vint_sepia',
        label: 'Sépia',
        description: 'Monocromático marrom quente, com nostalgia de fotografia antiga.'
      },
      {
        name: 'vint_kodachrome',
        label: 'Kodachrome',
        description: 'Cores ricas e saturadas, com vermelhos e azuis vibrantes de slide.'
      },
      {
        name: 'vint_cross_process',
        label: 'Cross Process',
        description: 'Sombras ciano e luzes amareladas, com o erro químico dos anos 90.'
      }
    ]
  }
]

/** Lista plana de todos os filtros (todas as sessões) para buscas e menus rápidos. */
export const FILTERS: FilterDef[] = FILTER_SESSIONS.flatMap((s) => s.filters)
