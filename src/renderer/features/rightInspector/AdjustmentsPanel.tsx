import { Fragment, useState } from 'react'
import {
  Sparkles,
  RotateCcw,
  Sun,
  Droplets,
  Contrast,
  Focus,
  Film,
  Aperture,
  Frame,
  Wand2,
  Palette,
  Blend,
  Crosshair,
  Spline,
  PenTool
} from 'lucide-react'
import type { ImageLayerData, Layer, PhotoAdjustments, ColorWheel as ColorWheelValue, HSLBand, HSLColorName, CurveChannel, CurvePoint, ParametricRegion } from '@shared/types'
import { HSL_COLOR_NAMES, CURVE_CHANNELS, PARAMETRIC_REGIONS } from '@shared/types'
import { DEFAULT_ADJUSTMENTS, DEFAULT_IMAGE_BORDER, DEFAULT_PARAMETRIC_CURVE } from '@shared/defaults'
import { useEditorStore } from '../../stores/editorStore'
import { useUiStore } from '../../stores/uiStore'
import { usePreferencesStore } from '../../stores/preferencesStore'
import { Slider } from '../../components/ui/Slider'
import { Select } from '../../components/ui/Select'
import { Toggle } from '../../components/ui/Toggle'
import { CollapsibleGroup } from '../../components/ui/CollapsibleGroup'
import { ColorWheel } from '../../components/ui/ColorWheel'
import { CurveEditor } from '../../components/ui/CurveEditor'
import { ParametricCurvePreview } from '../../components/ui/ParametricCurvePreview'
import { cn } from '../../lib/cn'
import { useT } from '@renderer/i18n'
import {
  ADJUSTMENT_GROUPS,
  ADJUSTMENT_PRESETS,
  AUTO_ADJUSTMENTS,
  GRAIN_TYPES,
  ISO_OPTIONS,
  NOIR_CURVES
} from './adjustmentsConfig'

const GROUP_ICONS: Record<string, JSX.Element> = {
  Luz: <Sun size={13} />,
  Cor: <Droplets size={13} />,
  'Preto e Branco': <Contrast size={13} />,
  Detalhes: <Focus size={13} />,
  'Granulação / ISO': <Film size={13} />,
  Óptica: <Aperture size={13} />,
  Bordas: <Frame size={13} />,
  'Presets de Ajuste': <Wand2 size={13} />
}

export function AdjustmentsPanel({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const adj = layer.adjustments ?? DEFAULT_ADJUSTMENTS
  const updateAdjustment = useEditorStore((s) => s.updateAdjustment)
  const updateAdjustments = useEditorStore((s) => s.updateAdjustments)
  const captureHistory = useEditorStore((s) => s.captureHistory)
  const accordion = usePreferencesStore((s) => s.prefs?.appearance.accordionAdjustments ?? true)
  const [autoApplied, setAutoApplied] = useState(false)
  const [open, setOpen] = useState<string[]>([]) // todas colapsadas por padrão

  const toggle = (title: string): void => {
    setOpen((prev) => {
      if (accordion) return prev[0] === title ? [] : [title]
      return prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    })
  }

  const resetGroup = (keys: (keyof PhotoAdjustments)[]): void => {
    const patch: Partial<PhotoAdjustments> = {}
    for (const k of keys) (patch as Record<string, unknown>)[k] = DEFAULT_ADJUSTMENTS[k]
    updateAdjustments(layer.id, patch)
  }

  return (
    <div className="flex flex-col">
      {/* Automático */}
      <div className="flex items-center justify-between border-b border-noir-border/60 px-4 py-3">
        <span className="text-2xs text-noir-muted">{t('adjustmentsPanel.editingThisPhoto')}</span>
        <button
          onClick={() => {
            updateAdjustments(layer.id, AUTO_ADJUSTMENTS)
            setAutoApplied(true)
          }}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors',
            autoApplied
              ? 'border-noir-border-active/40 bg-noir-selection text-noir-text'
              : 'border-noir-border text-noir-text hover:bg-noir-hover'
          )}
        >
          <Sparkles size={13} />
          {t('adjustmentsPanel.auto')}
        </button>
      </div>

      {ADJUSTMENT_GROUPS.map((group) => (
        <Fragment key={group.title}>
        <CollapsibleGroup
          title={t(`adjustments.groups.${group.id}`)}
          icon={GROUP_ICONS[group.title]}
          open={open.includes(group.title)}
          onToggle={() => toggle(group.title)}
          onReset={() => resetGroup(group.keys)}
        >
          {group.sliders.map((s) => (
            <Slider
              key={s.key}
              label={t(`adjustments.sliders.${s.key}`)}
              value={adj[s.key] as number}
              min={s.min}
              max={s.max}
              step={s.step}
              defaultValue={s.default}
              trackGradient={s.gradient}
              onChangeStart={captureHistory}
              onChange={(v) => updateAdjustment(layer.id, s.key, v)}
            />
          ))}

          {group.id === 'bw' && (
            <Select
              label={t('adjustmentsPanel.noirCurve')}
              value={adj.noirCurve}
              options={NOIR_CURVES.map((c) => ({ value: c.value, label: t(`noirCurves.${c.value}`) }))}
              onChange={(v) => updateAdjustments(layer.id, { noirCurve: v })}
            />
          )}

          {group.id === 'grain' && (
            <>
              <Select label={t('adjustmentsPanel.isoSimulated')} value={adj.isoSimulation} options={ISO_OPTIONS.map((v) => ({ value: v, label: `ISO ${v}` }))} onChange={(v) => updateAdjustments(layer.id, { isoSimulation: v })} />
              <Select
                label={t('adjustmentsPanel.grainType')}
                value={adj.grainType}
                options={GRAIN_TYPES.map((g) => ({ value: g.value, label: t(`grainTypes.${g.value}`) }))}
                onChange={(v) => updateAdjustments(layer.id, { grainType: v })}
              />
            </>
          )}

          {/* Color Grading (rodas) + Color Mixer (HSL) vivem dentro do grupo Cor, após a Tonalidade. */}
          {group.id === 'color' && (
            <>
              <div className="mt-3 border-t border-noir-border/50 pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">
                  <Palette size={12} /> {t('adjustmentsPanel.colorGrading')}
                </div>
                <ColorGradingSection layer={layer} />
              </div>
              <div className="mt-3 border-t border-noir-border/50 pt-3">
                <div className="mb-2 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.12em] text-noir-muted">
                  <Blend size={12} /> {t('adjustmentsPanel.colorMixer')}
                </div>
                <HSLMixerSection layer={layer} />
              </div>
            </>
          )}
        </CollapsibleGroup>

        {/* Curvas de tom (paramétrica + pontos por canal) — logo após o grupo Cor. */}
        {group.id === 'color' && (
          <CollapsibleGroup title={t('adjustmentsPanel.curves')} icon={<Spline size={13} />} open={open.includes('Curvas')} onToggle={() => toggle('Curvas')}>
            <ToneCurveSection layer={layer} />
          </CollapsibleGroup>
        )}
        </Fragment>
      ))}

      {/* Bordas */}
      <CollapsibleGroup title={t('adjustmentsPanel.borders')} icon={GROUP_ICONS['Bordas']} open={open.includes('Bordas')} onToggle={() => toggle('Bordas')}>
        <BordersSection layer={layer} />
      </CollapsibleGroup>

      {/* Presets */}
      <CollapsibleGroup title={t('adjustmentsPanel.presets')} icon={GROUP_ICONS['Presets de Ajuste']} open={open.includes('Presets de Ajuste')} onToggle={() => toggle('Presets de Ajuste')}>
        <div className="grid grid-cols-2 gap-2">
          {ADJUSTMENT_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => updateAdjustments(layer.id, p.patch)}
              className="rounded-md border border-noir-border bg-noir-elevated px-2 py-2 text-2xs text-noir-text transition-colors hover:bg-noir-hover"
            >
              {t(`presets.${p.id}`)}
            </button>
          ))}
        </div>
      </CollapsibleGroup>


      {/* Reset geral */}
      <div className="px-4 py-3">
        <button
          onClick={() => {
            captureHistory()
            updateAdjustments(layer.id, { ...DEFAULT_ADJUSTMENTS })
            setAutoApplied(false)
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-noir-border py-2 text-xs text-noir-muted transition-colors hover:bg-noir-hover hover:text-noir-text"
        >
          <RotateCcw size={13} />
          {t('adjustmentsPanel.resetAll')}
        </button>
      </div>
    </div>
  )
}

const BORDER_COLORS = ['#FFFFFF', '#C8C8C8', '#7A7A7A', '#2E2E2E', '#000000']

function BordersSection({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const updateLayerData = useEditorStore((s) => s.updateLayerData)
  const captureHistory = useEditorStore((s) => s.captureHistory)
  const data = layer.data as ImageLayerData
  const border = data.border ?? DEFAULT_IMAGE_BORDER
  const [perCorner, setPerCorner] = useState(
    () => !(border.radius.tl === border.radius.tr && border.radius.tr === border.radius.br && border.radius.br === border.radius.bl)
  )

  const setBorder = (patch: Partial<typeof border>): void => updateLayerData(layer.id, { border: { ...border, ...patch } })
  const setRadius = (patch: Partial<typeof border.radius>): void => setBorder({ radius: { ...border.radius, ...patch } })

  return (
    <div className="space-y-2">
      {/* Contorno */}
      <Slider
        label={t('adjustmentsPanel.borderWidth')}
        value={border.width}
        min={0}
        max={60}
        defaultValue={0}
        onChangeStart={captureHistory}
        onChange={(v) => setBorder({ width: v })}
      />
      {border.width > 0 && (
        <div>
          <span className="text-2xs text-noir-muted">{t('adjustmentsPanel.borderColor')}</span>
          <div className="mt-1.5 flex gap-2">
            {BORDER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  captureHistory()
                  setBorder({ color: c })
                }}
                className={cn('h-6 w-6 rounded-full border-2', border.color === c ? 'border-noir-border-active' : 'border-noir-border')}
                style={{ background: c }}
                aria-label={t('adjustmentsPanel.colorAria', { color: c })}
              />
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-noir-border/50 pt-2">
        {!perCorner ? (
          <Slider
            label={t('adjustmentsPanel.cornerRadius')}
            value={border.radius.tl}
            min={0}
            max={300}
            defaultValue={0}
            onChangeStart={captureHistory}
            onChange={(v) => setRadius({ tl: v, tr: v, br: v, bl: v })}
          />
        ) : (
          <>
            <Slider label={t('adjustmentsPanel.cornerTL')} value={border.radius.tl} min={0} max={300} defaultValue={0} onChangeStart={captureHistory} onChange={(v) => setRadius({ tl: v })} />
            <Slider label={t('adjustmentsPanel.cornerTR')} value={border.radius.tr} min={0} max={300} defaultValue={0} onChangeStart={captureHistory} onChange={(v) => setRadius({ tr: v })} />
            <Slider label={t('adjustmentsPanel.cornerBR')} value={border.radius.br} min={0} max={300} defaultValue={0} onChangeStart={captureHistory} onChange={(v) => setRadius({ br: v })} />
            <Slider label={t('adjustmentsPanel.cornerBL')} value={border.radius.bl} min={0} max={300} defaultValue={0} onChangeStart={captureHistory} onChange={(v) => setRadius({ bl: v })} />
          </>
        )}
        <Toggle label={t('adjustmentsPanel.individualCorners')} checked={perCorner} onChange={setPerCorner} />
      </div>
    </div>
  )
}

const ZONES = ['shadows', 'midtones', 'highlights', 'global'] as const

function ColorGradingSection({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const adj = layer.adjustments ?? DEFAULT_ADJUSTMENTS
  const cg = adj.colorGrading
  const updateColorGrading = useEditorStore((s) => s.updateColorGrading)
  const captureHistory = useEditorStore((s) => s.captureHistory)
  const [zone, setZone] = useState<(typeof ZONES)[number]>('shadows')
  const wheel = cg[zone]
  const setWheel = (patch: Partial<ColorWheelValue>): void =>
    updateColorGrading(layer.id, { ...cg, [zone]: { ...wheel, ...patch } })

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1">
        {ZONES.map((z) => (
          <button
            key={z}
            onClick={() => setZone(z)}
            className={cn(
              'rounded-md px-1 py-1.5 text-2xs transition-colors',
              zone === z ? 'bg-noir-selection text-noir-text' : 'text-noir-muted hover:bg-noir-hover'
            )}
          >
            {t(`colorGrade.${z}`)}
          </button>
        ))}
      </div>
      <div className="flex justify-center pt-1">
        <ColorWheel
          hue={wheel.hue}
          saturation={wheel.saturation}
          onChangeStart={captureHistory}
          onChange={(hue, saturation) => setWheel({ hue, saturation })}
        />
      </div>
      <Slider
        label={t('colorGrade.luminance')}
        value={wheel.luminance}
        min={-100}
        max={100}
        defaultValue={0}
        onChangeStart={captureHistory}
        onChange={(v) => setWheel({ luminance: v })}
      />
    </div>
  )
}

const HSL_SWATCH: Record<HSLColorName, string> = {
  red: '#e05a5a',
  orange: '#e0922f',
  yellow: '#d8d23a',
  green: '#46c46a',
  aqua: '#3cc7c7',
  blue: '#4d74e8',
  purple: '#a065e0',
  magenta: '#e065b0'
}

// Centros de matiz (0..1) de cada banda — espelham os `centers[]` do shader (Color Mixer).
const HSL_BAND_CENTERS: Record<HSLColorName, number> = {
  red: 0,
  orange: 1 / 12,
  yellow: 1 / 6,
  green: 1 / 3,
  aqua: 1 / 2,
  blue: 2 / 3,
  purple: 7 / 9,
  magenta: 8 / 9
}

/** Matiz HSL (0..1) de uma cor hex. */
function hexToHue(hex: string): number {
  const m = hex.replace('#', '')
  const r = parseInt(m.slice(0, 2), 16) / 255
  const g = parseInt(m.slice(2, 4), 16) / 255
  const b = parseInt(m.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d < 1e-6) return 0
  let h: number
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  h /= 6
  return h < 0 ? h + 1 : h
}

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> }

/** Banda HSL cujo centro de matiz é o mais próximo (circular) da cor dada. */
function nearestHslBand(hex: string): HSLColorName {
  const hue = hexToHue(hex)
  let best: HSLColorName = 'red'
  let bestDist = Infinity
  for (const name of HSL_COLOR_NAMES) {
    const raw = Math.abs(hue - HSL_BAND_CENTERS[name])
    const dist = Math.min(raw, 1 - raw) // distância circular de matiz
    if (dist < bestDist) {
      bestDist = dist
      best = name
    }
  }
  return best
}

function HSLMixerSection({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const adj = layer.adjustments ?? DEFAULT_ADJUSTMENTS
  const mix = adj.hslMixer
  const updateHslMixer = useEditorStore((s) => s.updateHslMixer)
  const captureHistory = useEditorStore((s) => s.captureHistory)
  const pushToast = useUiStore((s) => s.pushToast)
  const [band, setBand] = useState<HSLColorName>('red')
  const [picked, setPicked] = useState<string | null>(null)
  const b = mix[band]
  const patchBand = (patch: Partial<HSLBand>): void => updateHslMixer(layer.id, { ...mix, [band]: { ...b, ...patch } })

  // Conta-gotas (mira): pega uma cor da tela e seleciona a banda HSL correspondente.
  const pickColor = async (): Promise<void> => {
    const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper
    if (!Ctor) {
      pushToast('error', t('colorMix.eyedropperUnavailable'))
      return
    }
    try {
      const { sRGBHex } = await new Ctor().open()
      setPicked(sRGBHex)
      setBand(nearestHslBand(sRGBHex))
    } catch {
      /* usuário cancelou (Esc) */
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-2xs text-noir-muted">{t('colorMix.pickColor')}</span>
          <button
            onClick={() => void pickColor()}
            title={t('colorMix.eyedropper')}
            aria-label={t('colorMix.eyedropper')}
            className="inline-flex items-center gap-1.5 rounded-md border border-noir-border px-1.5 py-1 text-noir-muted transition-colors hover:border-noir-muted/60 hover:text-noir-text"
          >
            {picked && <span className="h-3 w-3 rounded-full border border-noir-border" style={{ background: picked }} />}
            <Crosshair size={13} />
          </button>
        </div>
        <div className="mt-1.5 flex justify-between gap-1">
          {HSL_COLOR_NAMES.map((n) => (
            <button
              key={n}
              onClick={() => setBand(n)}
              title={t(`colorMix.${n}`)}
              className={cn(
                'h-6 w-6 rounded-full border-2 transition-transform',
                band === n ? 'scale-110 border-noir-border-active' : 'border-noir-border'
              )}
              style={{ background: HSL_SWATCH[n] }}
            />
          ))}
        </div>
      </div>
      <Slider label={t('colorMix.hue')} value={b.hue} min={-100} max={100} defaultValue={0} onChangeStart={captureHistory} onChange={(v) => patchBand({ hue: v })} />
      <Slider label={t('colorMix.saturation')} value={b.saturation} min={-100} max={100} defaultValue={0} onChangeStart={captureHistory} onChange={(v) => patchBand({ saturation: v })} />
      <Slider label={t('colorMix.luminance')} value={b.luminance} min={-100} max={100} defaultValue={0} onChangeStart={captureHistory} onChange={(v) => patchBand({ luminance: v })} />
    </div>
  )
}

const IDENTITY_CURVE: CurvePoint[] = [
  { x: 0, y: 0 },
  { x: 1, y: 1 }
]

type CurveMode = 'parametric' | 'point'

// Cor da bolinha de cada canal (modo Ponto), espelhando o CurveEditor — estilo Lightroom.
const CHANNEL_DOT: Record<CurveChannel, string> = {
  rgb: '#e8e8e8',
  red: '#e05a5a',
  green: '#46c46a',
  blue: '#5a86e8'
}

function ToneCurveSection({ layer }: { layer: Layer }): JSX.Element {
  const t = useT()
  const adj = layer.adjustments ?? DEFAULT_ADJUSTMENTS
  const curves = adj.toneCurves
  const parametric = curves.parametric ?? DEFAULT_PARAMETRIC_CURVE
  const updateToneCurves = useEditorStore((s) => s.updateToneCurves)
  const captureHistory = useEditorStore((s) => s.captureHistory)
  const [mode, setMode] = useState<CurveMode>('parametric')
  const [ch, setCh] = useState<CurveChannel>('rgb')

  const setChannelPoints = (points: CurvePoint[]): void => updateToneCurves(layer.id, { ...curves, [ch]: points })
  const resetChannel = (): void => {
    captureHistory()
    updateToneCurves(layer.id, { ...curves, [ch]: IDENTITY_CURVE.map((p) => ({ ...p })) })
  }
  const setRegion = (region: ParametricRegion, value: number): void =>
    updateToneCurves(layer.id, { ...curves, parametric: { ...parametric, [region]: value } })
  const resetParametric = (): void => {
    captureHistory()
    updateToneCurves(layer.id, { ...curves, parametric: { ...DEFAULT_PARAMETRIC_CURVE } })
  }

  return (
    <div className="space-y-3">
      {/* Alternador de modo (Paramétrica · Ponto) — ícones e usabilidade do Lightroom. */}
      <div className="grid grid-cols-2 gap-1 rounded-md bg-noir-bg p-0.5">
        <CurveModeButton active={mode === 'parametric'} onClick={() => setMode('parametric')} icon={<Spline size={13} />} label={t('curves.parametric')} />
        <CurveModeButton active={mode === 'point'} onClick={() => setMode('point')} icon={<PenTool size={13} />} label={t('curves.point')} />
      </div>

      {mode === 'parametric' ? (
        <>
          <ParametricCurvePreview parametric={parametric} />
          <div className="space-y-2">
            {PARAMETRIC_REGIONS.map((region) => (
              <Slider
                key={region}
                label={t(`curves.region.${region}`)}
                value={parametric[region]}
                min={-100}
                max={100}
                defaultValue={0}
                onChangeStart={captureHistory}
                onChange={(v) => setRegion(region, v)}
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-2xs text-noir-disabled">{t('curves.parametricHint')}</span>
            <button
              onClick={resetParametric}
              className="shrink-0 rounded-md border border-noir-border px-2 py-1 text-2xs text-noir-muted transition-colors hover:bg-noir-hover hover:text-noir-text"
            >
              {t('curves.reset')}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Canais como bolinhas coloridas (RGB · R · G · B), igual ao seletor de canais do Lightroom. */}
          <div className="flex items-center justify-center gap-2">
            {CURVE_CHANNELS.map((c) => (
              <button
                key={c}
                onClick={() => setCh(c)}
                title={t(`curves.${c}`)}
                aria-label={t(`curves.${c}`)}
                className={cn(
                  'h-6 w-6 rounded-full border-2 transition-transform',
                  ch === c ? 'scale-110 border-noir-border-active' : 'border-noir-border'
                )}
                style={{ background: CHANNEL_DOT[c] }}
              />
            ))}
          </div>
          <CurveEditor points={curves[ch]} channel={ch} onChangeStart={captureHistory} onChange={setChannelPoints} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-2xs text-noir-disabled">{t('curves.hint')}</span>
            <button
              onClick={resetChannel}
              className="shrink-0 rounded-md border border-noir-border px-2 py-1 text-2xs text-noir-muted transition-colors hover:bg-noir-hover hover:text-noir-text"
            >
              {t('curves.reset')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function CurveModeButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean
  onClick: () => void
  icon: JSX.Element
  label: string
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-2xs transition-colors',
        active ? 'bg-noir-selection text-noir-text' : 'text-noir-muted hover:bg-noir-hover'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
