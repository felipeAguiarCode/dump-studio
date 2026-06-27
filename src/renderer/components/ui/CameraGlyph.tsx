import type { CameraGlyph as CameraGlyphId } from '../../features/rightInspector/camerasConfig'

interface CameraGlyphProps {
  glyph: CameraGlyphId
  size?: number
  /** Cor do corpo da câmera. */
  accent?: string
}

/**
 * Silhueta vintage de câmera desenhada como SVG inline (CSP-safe, sem assets externos).
 * Cada `glyph` produz uma forma distinta usada como badge nos cards do painel Cameras Look.
 */
export function CameraGlyph({ glyph, size = 16, accent = '#cfcfcf' }: CameraGlyphProps): JSX.Element {
  const edge = 'rgba(0,0,0,0.5)'
  const lens = '#191919'
  const glass = 'rgba(255,255,255,0.35)'

  // Lente reutilizável (corpo escuro + reflexo claro).
  const Lens = ({ cx, cy, r }: { cx: number; cy: number; r: number }): JSX.Element => (
    <>
      <circle cx={cx} cy={cy} r={r} fill={lens} stroke={edge} strokeWidth={0.8} />
      <circle cx={cx} cy={cy} r={r * 0.5} fill={glass} />
    </>
  )

  const shapes: Record<CameraGlyphId, JSX.Element> = {
    // Compacta point-and-shoot (CCD).
    compact: (
      <>
        <rect x={3} y={7} width={18} height={12} rx={2.5} fill={accent} stroke={edge} strokeWidth={0.8} />
        <rect x={6} y={5} width={5} height={3} rx={1} fill={accent} stroke={edge} strokeWidth={0.8} />
        <Lens cx={13} cy={13} r={3.6} />
        <circle cx={6.5} cy={10} r={0.9} fill={glass} />
      </>
    ),
    // Rangefinder / meio-quadro.
    rangefinder: (
      <>
        <rect x={2.5} y={8} width={19} height={10} rx={1.6} fill={accent} stroke={edge} strokeWidth={0.8} />
        <rect x={5} y={6} width={6} height={2.5} rx={0.8} fill={accent} stroke={edge} strokeWidth={0.8} />
        <Lens cx={9} cy={13} r={3.2} />
        <rect x={15} y={10} width={4} height={3} rx={0.6} fill={lens} stroke={edge} strokeWidth={0.6} />
      </>
    ),
    // Instantânea (Polaroid): slot de saída embaixo.
    instant: (
      <>
        <rect x={4} y={4} width={16} height={16} rx={2} fill={accent} stroke={edge} strokeWidth={0.8} />
        <Lens cx={12} cy={10} r={4} />
        <rect x={6} y={16.5} width={12} height={2.4} rx={1} fill={lens} />
      </>
    ),
    // Cine 8mm: barril de lente saliente + carretel no topo.
    cine: (
      <>
        <circle cx={9} cy={6} r={3} fill={accent} stroke={edge} strokeWidth={0.8} />
        <rect x={4} y={9} width={12} height={11} rx={1.6} fill={accent} stroke={edge} strokeWidth={0.8} />
        <rect x={15} y={12} width={6} height={5} rx={1} fill={accent} stroke={edge} strokeWidth={0.8} />
        <Lens cx={21} cy={14.5} r={2.4} />
      </>
    ),
    // SLR: corpo + lente central grande + prisma (pentaprism) no topo.
    slr: (
      <>
        <path d="M8 6 h8 l1.5 3 h-11 Z" fill={accent} stroke={edge} strokeWidth={0.8} strokeLinejoin="round" />
        <rect x={2.5} y={8.5} width={19} height={11} rx={2} fill={accent} stroke={edge} strokeWidth={0.8} />
        <Lens cx={12} cy={14} r={4.4} />
      </>
    ),
    // Descartável: caixa simples + lente pequena + manivela.
    disposable: (
      <>
        <rect x={3.5} y={6.5} width={17} height={13} rx={1.4} fill={accent} stroke={edge} strokeWidth={0.8} />
        <Lens cx={9} cy={13} r={3} />
        <circle cx={17} cy={10} r={1.6} fill={lens} stroke={edge} strokeWidth={0.6} />
        <rect x={16} y={14} width={3} height={3} rx={0.6} fill={glass} />
      </>
    ),
    // Toy/Lomo: corpo arredondado e lente grande "fofa".
    toy: (
      <>
        <rect x={4} y={6} width={16} height={14} rx={4} fill={accent} stroke={edge} strokeWidth={0.8} />
        <Lens cx={12} cy={13} r={4.6} />
        <circle cx={7} cy={9} r={1} fill={glass} />
      </>
    ),
    // Folding/antiga: corpo com frente angulada (fole).
    folding: (
      <>
        <rect x={3} y={9} width={9} height={10} rx={1.4} fill={accent} stroke={edge} strokeWidth={0.8} />
        <path d="M12 10 l7 -2.5 v11 l-7 -2.5 Z" fill={accent} stroke={edge} strokeWidth={0.8} strokeLinejoin="round" />
        <Lens cx={18} cy={13} r={2.6} />
      </>
    ),
    // Camcorder VHS: corpo + barril à esquerda + visor + alça no topo.
    camcorder: (
      <>
        <rect x={6} y={5} width={9} height={2} rx={1} fill={accent} stroke={edge} strokeWidth={0.7} />
        <rect x={7} y={8} width={11} height={9} rx={1.6} fill={accent} stroke={edge} strokeWidth={0.8} />
        <rect x={2.5} y={10} width={5} height={5} rx={1} fill={accent} stroke={edge} strokeWidth={0.8} />
        <Lens cx={3.5} cy={12.5} r={1.8} />
        <rect x={18} y={10} width={3.5} height={4} rx={0.8} fill={lens} stroke={edge} strokeWidth={0.6} />
      </>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {shapes[glyph]}
    </svg>
  )
}
