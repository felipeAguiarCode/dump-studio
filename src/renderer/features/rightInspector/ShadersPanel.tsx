import { useEffect, useRef, useState } from 'react'
import {
  Tv,
  Flame,
  History,
  Sparkles,
  Radio,
  RotateCcw,
  Film,
  Moon,
  LayoutGrid,
  Brush,
  Glasses,
  Wind,
  Layers,
  Hourglass,
  SignalZero,
  Antenna,
  AlignJustify,
  Gamepad,
  Drama,
  Ghost,
  CloudRain,
  Zap,
  PenTool,
  CloudFog,
  Sunrise,
  Sun,
  Aperture,
  Grid3x3,
  Thermometer,
  Sunset,
  Flashlight,
  Slash,
  Rainbow,
  CircleDot,
  Maximize2,
  Minimize2
} from 'lucide-react'
import type { ImageLayerData, Layer, ShaderEffects } from '@shared/types'
import { DEFAULT_ADJUSTMENTS, DEFAULT_SHADERS } from '@shared/defaults'
import { getGLContext } from '../../../engine/pipeline/glContext'
import { buildUniforms } from '../../../engine/pipeline/params'
import { useEditorStore } from '../../stores/editorStore'
import { useImage } from '../../hooks/useImage'
import { assetUrl } from '../../services/assetUrls'
import { Slider } from '../../components/ui/Slider'
import { CollapsibleGroup } from '../../components/ui/CollapsibleGroup'
import { useT } from '@renderer/i18n'
import { cn } from '../../lib/cn'

type ShaderKey = keyof ShaderEffects
type TextureSessionId = 'screen' | 'film' | 'leak' | 'surface' | 'aging' | 'games' | 'fisheye'

interface EffectDef {
  key: ShaderKey
  label: string
  description: string
  icon: JSX.Element
}

interface TextureSession {
  id: TextureSessionId
  label: string
  icon: JSX.Element
  effects: EffectDef[]
}

// Texturas agrupadas por sessão. Continuam empilháveis: cada efeito tem sua própria
// intensidade e é aplicado em sequência no shader, independentemente do agrupamento visual.
const TEXTURE_SESSIONS: TextureSession[] = [
  {
    id: 'screen',
    label: 'Tela & Sinal',
    icon: <Tv size={13} />,
    effects: [
      { key: 'crt', label: 'CRT', description: 'Scanlines, máscara de fósforo e aberração de monitor antigo.', icon: <Tv size={15} /> },
      { key: 'vhs', label: 'VHS', description: 'Sangramento de croma, jitter de linha e faixas de tracking.', icon: <Radio size={15} /> },
      { key: 'glitch', label: 'Anáglifo 3D', description: 'Canais vermelho e azul deslocados, estilo óculos 3D.', icon: <Glasses size={15} /> },
      { key: 'signalLoss', label: 'Perda de Sinal', description: 'Rasgos horizontais, quedas em preto e linha de sincronismo.', icon: <SignalZero size={15} /> },
      { key: 'interference', label: 'Interferência', description: 'Chuvisco analógico, barras de ruído e fantasma de croma.', icon: <Antenna size={15} /> },
      { key: 'scanlines', label: 'Scanlines', description: 'Linhas horizontais de monitor, sem a aberração do CRT.', icon: <AlignJustify size={15} /> }
    ]
  },
  {
    id: 'film',
    label: 'Filme & Grão',
    icon: <Film size={13} />,
    effects: [
      { key: 'filmGrain', label: 'Film Grain', description: 'Grão de filme clássico, mais presente nos médios-tons.', icon: <Film size={15} /> },
      { key: 'darkGrainy', label: 'Dark Grainy', description: 'Escurece, reforça o contraste e adiciona grão pesado.', icon: <Moon size={15} /> },
      { key: 'halation', label: 'Halação', description: 'Brilho analógico que vaza das altas luzes.', icon: <Sparkles size={15} /> },
      { key: 'filmBloom', label: 'Brilho Difuso', description: 'Glow suave e sonhador, estilo filtro pro-mist.', icon: <Sun size={15} /> },
      { key: 'anamorphic', label: 'Flare Anamórfico', description: 'Risco horizontal azul saindo das altas luzes.', icon: <Aperture size={15} /> }
    ]
  },
  {
    id: 'leak',
    label: 'Leak',
    icon: <Flashlight size={13} />,
    effects: [
      { key: 'lightLeak', label: 'Vazamento Quente', description: 'Vazamento de luz quente vindo dos cantos.', icon: <Sunrise size={15} /> },
      { key: 'leakStreak', label: 'Risco Diagonal', description: 'Faixa dourada quente cruzando o quadro na diagonal.', icon: <Slash size={15} /> },
      { key: 'leakRainbow', label: 'Arco-íris Prisma', description: 'Banda de dispersão de prisma em arco-íris.', icon: <Rainbow size={15} /> },
      { key: 'leakEdge', label: 'Fim de Rolo', description: 'Faixa vermelha/laranja intensa numa borda, como fim de filme.', icon: <Flame size={15} /> },
      { key: 'leakSpot', label: 'Reflexo de Lente', description: 'Orbe/hotspot dourado suave com halo.', icon: <CircleDot size={15} /> }
    ]
  },
  {
    id: 'surface',
    label: 'Superfície',
    icon: <Layers size={13} />,
    effects: [
      { key: 'concrete', label: 'Concrete Wall', description: 'Textura áspera e mosqueada de parede de concreto.', icon: <LayoutGrid size={15} /> },
      { key: 'grunge', label: 'Grunge', description: 'Manchas sujas, riscos e granulado seco distorcido.', icon: <Brush size={15} /> }
    ]
  },
  {
    id: 'aging',
    label: 'Tempo & Desgaste',
    icon: <Hourglass size={13} />,
    effects: [
      { key: 'burn', label: 'Queimado', description: 'Bordas chamuscadas, como uma foto tocada pelo fogo.', icon: <Flame size={15} /> },
      { key: 'worn', label: 'Desgastado', description: 'Fade, leve sépia, poeira e arranhões do tempo.', icon: <History size={15} /> },
      { key: 'dustVintage', label: 'Dust & Film Grain', description: 'Fade quente vintage com grão de filme, poeira e arranhões.', icon: <Wind size={15} /> }
    ]
  },
  {
    id: 'games',
    label: 'Aberrações Cromáticas',
    icon: <Rainbow size={13} />,
    effects: [
      { key: 'personaRed', label: 'Fantasma Vermelho', description: 'Eco/silhueta vermelha com duotone carmesim, estilo JRPG ousado.', icon: <Drama size={15} /> },
      { key: 'personaBlue', label: 'Fantasma Azul', description: 'Contornos e eco azuis com clima melancólico.', icon: <Ghost size={15} /> },
      { key: 'darkKnight', label: 'Vigilante Noir', description: 'Penumbra urbana com vermelho/âmbar e pretos profundos.', icon: <CloudRain size={15} /> },
      { key: 'cyberNeon', label: 'Cyber Neon', description: 'Aberração cromática, ciano/magenta e saturação neon.', icon: <Zap size={15} /> },
      { key: 'inkToon', label: 'Cel-Shade', description: 'Cor posterizada com contornos de tinta preta, estilo quadrinho.', icon: <PenTool size={15} /> },
      { key: 'dreadFog', label: 'Névoa Sombria', description: 'Dessatura, escurece e cobre de névoa e grão, clima de horror.', icon: <CloudFog size={15} /> },
      { key: 'pixelArt', label: 'Pixel Art', description: 'Pixeliza e reduz a paleta, estilo console retrô 8-bit.', icon: <Grid3x3 size={15} /> },
      { key: 'gameboy', label: 'LCD Verde', description: 'Tela de 4 tons verdes pixelada, estilo portátil clássico.', icon: <Gamepad size={15} /> },
      { key: 'thermal', label: 'Visão Térmica', description: 'Mapa de calor infravermelho, estilo tático/sci-fi.', icon: <Thermometer size={15} /> },
      { key: 'vaporwave', label: 'Vaporwave', description: 'Duotone rosa/ciano synthwave com scanlines, estilo Outrun.', icon: <Sunset size={15} /> }
    ]
  },
  {
    id: 'fisheye',
    label: 'Fisheye',
    icon: <Aperture size={13} />,
    effects: [
      { key: 'fisheye', label: 'Fisheye', description: 'Distorção barril — linhas curvam para fora, centro ampliado.', icon: <Maximize2 size={15} /> },
      { key: 'antiFisheye', label: 'Anti-Fisheye', description: 'Distorção pincushion — linhas curvam para dentro, bordas ampliadas.', icon: <Minimize2 size={15} /> }
    ]
  }
]

const PW = 80
const PH = 100

export function ShadersPanel({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const data = layer.data as ImageLayerData
  const src = useImage(assetUrl(data.assetId))
  const shaders: ShaderEffects = { ...DEFAULT_SHADERS, ...data.shaders }
  const updateLayerData = useEditorStore((s) => s.updateLayerData)
  const captureHistory = useEditorStore((s) => s.captureHistory)
  // Acordeão: todas as sessões colapsadas por padrão; abrir uma fecha as demais.
  const [openId, setOpenId] = useState<string | null>(null)

  const setShader = (key: ShaderKey, value: number): void =>
    updateLayerData(layer.id, { shaders: { ...shaders, [key]: value } })

  const toggle = (id: string): void => setOpenId((prev) => (prev === id ? null : id))

  const anyActive = TEXTURE_SESSIONS.some((s) => s.effects.some((e) => shaders[e.key] > 0))

  return (
    <div className="flex flex-col">
      <div className="border-b border-noir-border/60 px-4 pb-3 pt-4">
        <h3 className="text-xs font-medium text-noir-text">{t('inspector.textures')}</h3>
        <p className="mt-1 text-2xs text-noir-muted">{t('shadersPanel.subtitle')}</p>
      </div>

      {TEXTURE_SESSIONS.map((session) => (
        <CollapsibleGroup
          key={session.id}
          title={t(`shadersPanel.sessions.${session.id}`)}
          icon={session.icon}
          open={openId === session.id}
          onToggle={() => toggle(session.id)}
        >
          <div className="space-y-3.5">
            {session.effects.map((e) => (
              <ShaderRow
                key={e.key}
                effect={e}
                value={shaders[e.key]}
                src={src}
                assetId={data.assetId}
                onChangeStart={captureHistory}
                onChange={(v) => setShader(e.key, v)}
              />
            ))}
          </div>
        </CollapsibleGroup>
      ))}

      {anyActive && (
        <div className="px-4 py-3">
          <button
            onClick={() => {
              captureHistory()
              updateLayerData(layer.id, { shaders: { ...DEFAULT_SHADERS } })
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-noir-border py-2 text-xs text-noir-muted transition-colors hover:bg-noir-hover hover:text-noir-text"
          >
            <RotateCcw size={13} />
            {t('shadersPanel.removeAll')}
          </button>
        </div>
      )}
    </div>
  )
}

function ShaderRow({
  effect,
  value,
  src,
  assetId,
  onChangeStart,
  onChange
}: {
  effect: EffectDef
  value: number
  src: HTMLImageElement | null
  assetId: string
  onChangeStart: () => void
  onChange: (value: number) => void
}): JSX.Element {
  const t = useT()
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!src || !ref.current) return
    // Preview mostra o efeito isolado em intensidade máxima sobre a imagem crua.
    const shaders: ShaderEffects = { ...DEFAULT_SHADERS, [effect.key]: 100 }
    const uniforms = buildUniforms(DEFAULT_ADJUSTMENTS, undefined, 1080, 0, undefined, shaders)
    try {
      getGLContext().process(assetId, src, uniforms, ref.current, PW, PH)
    } catch {
      /* ignore preview errors */
    }
  }, [src, assetId, effect.key])

  const active = value > 0

  return (
    <div
      className={cn(
        'rounded-lg border p-2.5 transition-colors',
        active ? 'border-noir-border-active/40 bg-noir-selection' : 'border-noir-border'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-10 shrink-0 overflow-hidden rounded-md border border-noir-border bg-noir-bg">
          <canvas ref={ref} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-noir-text">
            <span className="shrink-0 text-noir-muted">{effect.icon}</span>
            <span className="truncate">{t(`shadersPanel.effects.${effect.key}.label`)}</span>
          </div>
          <p className="mt-0.5 text-2xs leading-snug text-noir-muted">{t(`shadersPanel.effects.${effect.key}.description`)}</p>
        </div>
      </div>
      <div className="mt-1">
        <Slider
          label={t('shadersPanel.intensity')}
          value={value}
          min={0}
          max={100}
          defaultValue={0}
          onChangeStart={onChangeStart}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
