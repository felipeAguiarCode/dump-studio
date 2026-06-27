import { useEffect, useMemo, useRef } from 'react'
import { Image as KonvaImage, Rect, Text, TextPath, Group, Ellipse, Line } from 'react-konva'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type {
  BorderLayerData,
  ImageLayerData,
  Layer,
  OverlayLayerData,
  ShapeLayerData,
  TextLayerData
} from '@shared/types'
import { DEFAULT_IMAGE_BORDER } from '@shared/defaults'
import { resolveBackground } from './background'
import { useProcessedLayer } from './useProcessedLayer'
import { useImage } from '../../hooks/useImage'
import { overlayUrl, tintOverlay } from '../../lib/overlays'
import { slotClipPath } from './layoutSlots'
import { ensureFontsLoaded } from '../../styles/fonts'
import { buildCurvedText } from './curvedText'
import { traceRoundedRect, radiiToArray } from '../../lib/roundedRect'

interface NodeProps {
  layer: Layer
  docWidth: number
  docHeight: number
  background: string
  onSelect: (e: KonvaEventObject<MouseEvent>) => void
  onDragStart: () => void
  onChange: (transform: Layer['transform']) => void
  onDragMove?: (node: Konva.Node) => void
  /** Geometria do slot (layout ativo) — sobrepõe o transform armazenado. */
  slotRect?: { x: number; y: number; width: number; height: number; rotation: number }
  /** Imagem encaixada num slot: sem drag/transform livre (só pan/zoom no slot). */
  slotLocked?: boolean
}

/** Props comuns de interação para nós editáveis (imagem/texto/forma). */
function interactiveProps(layer: Layer, p: NodeProps) {
  return {
    id: layer.id,
    name: 'layer-node',
    draggable: !layer.locked && !p.slotLocked,
    opacity: layer.opacity,
    rotation: layer.transform.rotation,
    onMouseDown: p.onSelect,
    onTap: p.onSelect,
    onDragStart: p.onDragStart,
    onDragMove: (e: KonvaEventObject<DragEvent>) => p.onDragMove?.(e.target as Konva.Node),
    onDragEnd: (e: KonvaEventObject<DragEvent>) => {
      p.onChange({ ...layer.transform, x: e.target.x(), y: e.target.y() })
    },
    onTransformStart: p.onDragStart,
    onTransformEnd: (e: KonvaEventObject<Event>) => {
      const node = e.target as Konva.Node
      const sx = node.scaleX()
      const sy = node.scaleY()
      node.scaleX(1)
      node.scaleY(1)
      p.onChange({
        ...layer.transform,
        x: node.x(),
        y: node.y(),
        width: Math.max(8, node.width() * sx),
        height: Math.max(8, node.height() * sy),
        rotation: node.rotation()
      })
    }
  }
}

export function LayerNode(props: NodeProps): JSX.Element | null {
  const { layer } = props
  if (!layer.visible) return null
  switch (layer.type) {
    case 'background':
      return <BackgroundNode {...props} />
    case 'image':
      return <ImageNode {...props} />
    case 'text':
      return <TextNode {...props} />
    case 'shape':
      return <ShapeNode {...props} />
    case 'border':
      return <BorderNode {...props} />
    case 'overlay':
      return <OverlayNode {...props} />
    default:
      return null
  }
}

function BackgroundNode({ docWidth, docHeight, background }: NodeProps): JSX.Element {
  const fill = resolveBackground(background)
  return (
    <Rect
      x={0}
      y={0}
      width={docWidth}
      height={docHeight}
      fill={fill ?? undefined}
      listening={false}
    />
  )
}

function ImageNode(props: NodeProps): JSX.Element | null {
  const { layer, docWidth } = props
  const { canvas, version, ready } = useProcessedLayer(layer, docWidth)
  const ref = useRef<Konva.Group>(null)
  // Slot ativo: geometria derivada do layout sobrepõe o transform armazenado.
  const geo = props.slotRect ?? layer.transform
  const data = layer.data as ImageLayerData
  const border = data.border ?? DEFAULT_IMAGE_BORDER
  const r = border.radius
  const hasRadius = r.tl > 0 || r.tr > 0 || r.br > 0 || r.bl > 0
  const bw = border.width

  // Redesenha quando o pipeline produz um novo frame (mesmo canvas, novos pixels)
  // ou quando muda um atributo visual que o Konva precisa repintar (ex.: opacidade).
  useEffect(() => {
    ref.current?.getLayer()?.batchDraw()
  }, [version, hasRadius, bw, layer.opacity])

  if (!ready) return null

  const inset = (v: number): number => Math.max(0, v - bw / 2)

  return (
    <Group
      ref={ref}
      {...interactiveProps(layer, props)}
      x={geo.x}
      y={geo.y}
      width={geo.width}
      height={geo.height}
      rotation={geo.rotation}
      clipFunc={hasRadius ? (ctx) => traceRoundedRect(ctx, 0, 0, geo.width, geo.height, r) : undefined}
    >
      <KonvaImage image={canvas} x={0} y={0} width={geo.width} height={geo.height} />
      {bw > 0 && (
        <Rect
          x={bw / 2}
          y={bw / 2}
          width={geo.width - bw}
          height={geo.height - bw}
          cornerRadius={radiiToArray({ tl: inset(r.tl), tr: inset(r.tr), br: inset(r.br), bl: inset(r.bl) })}
          stroke={border.color}
          strokeWidth={bw}
          listening={false}
        />
      )}
    </Group>
  )
}

function OverlayNode(props: NodeProps): JSX.Element | null {
  const { layer } = props
  const data = layer.data as OverlayLayerData
  const img = useImage(overlayUrl(data.overlayId))
  const ref = useRef<Konva.Group>(null)
  // O overlay usa SEMPRE o próprio transform (pan/redimensiona livremente). Em layout,
  // `slotRect` é a região de recorte (clip): o que sai do slot some.
  const t = layer.transform
  const slot = props.slotRect

  // Tinge o degradê com a cor escolhida (preserva o alfa). Preto = imagem original.
  const tinted = useMemo(() => (img ? tintOverlay(img, data.color ?? '#000000') : null), [img, data.color])

  useEffect(() => {
    ref.current?.getLayer()?.batchDraw()
  }, [tinted, layer.opacity, data.flipX, data.flipY, t.width, t.height])

  if (!tinted) return null
  const w = t.width
  const h = t.height
  const fx = data.flipX
  const fy = data.flipY
  const node = (
    <Group ref={ref} {...interactiveProps(layer, props)} x={t.x} y={t.y} width={w} height={h} rotation={t.rotation}>
      <KonvaImage
        image={tinted}
        x={fx ? w : 0}
        y={fy ? h : 0}
        width={w}
        height={h}
        scaleX={fx ? -1 : 1}
        scaleY={fy ? -1 : 1}
      />
    </Group>
  )
  if (slot) {
    return <Group clipFunc={(ctx) => slotClipPath(ctx, slot)}>{node}</Group>
  }
  return node
}

function TextNode(props: NodeProps): JSX.Element {
  const { layer } = props
  const data = layer.data as TextLayerData
  const t = layer.transform
  const nodeRef = useRef<Konva.Node | null>(null)
  const setRef = (n: Konva.Node | null): void => {
    nodeRef.current = n
  }
  const isBold = data.fontWeight >= 600
  const curved = buildCurvedText(data.text, data.fontSize, data.fontFamily, isBold, data.curve ?? 0)

  // O Konva desenha texto no canvas: se a fonte ainda não carregou, usa um fallback
  // e não atualiza sozinho. Carrega a fonte e força o redraw quando ela muda.
  useEffect(() => {
    void ensureFontsLoaded([data.fontFamily]).then(() => nodeRef.current?.getLayer()?.batchDraw())
  }, [data.fontFamily, data.fontSize, data.text, data.fontWeight, data.curve])

  // O texto vive num Group com um Rect transparente cobrindo a caixa: o Rect é o alvo de
  // clique (no Konva, fill="transparent" é invisível mas clicável), então o texto inteiro
  // fica selecionável — inclusive o curvado, cujo TextPath não escuta eventos. Sem isso o
  // clique atravessava para a foto atrás (Group sem filho clicável).
  return (
    <Group ref={setRef} {...interactiveProps(layer, props)} x={t.x} y={t.y} width={t.width} height={t.height}>
      <Rect x={0} y={0} width={t.width} height={t.height} fill="transparent" />
      {curved ? (
        <TextPath
          x={t.width / 2}
          y={t.height / 2 + curved.dy}
          data={curved.data}
          text={data.text}
          fontFamily={data.fontFamily}
          fontSize={data.fontSize}
          fontStyle={String(isBold ? 'bold' : 'normal')}
          fill={data.color}
          align="center"
          listening={false}
        />
      ) : (
        <Text
          x={0}
          y={0}
          width={t.width}
          text={data.text}
          fontFamily={data.fontFamily}
          fontSize={data.fontSize}
          fontStyle={String(isBold ? 'bold' : 'normal')}
          fill={data.color}
          align={data.align}
          lineHeight={data.lineHeight ?? 1.2}
          listening={false}
        />
      )}
    </Group>
  )
}

function ShapeNode(props: NodeProps): JSX.Element {
  const { layer } = props
  const data = layer.data as ShapeLayerData
  const t = layer.transform
  const w = t.width
  const h = t.height
  const fill = data.fill === 'transparent' ? undefined : data.fill
  const stroke = data.stroke === 'transparent' || data.stroke === 'none' ? undefined : data.stroke
  const common = { fill, stroke, strokeWidth: data.strokeWidth }

  let geom: JSX.Element
  if (data.shape === 'circle') {
    geom = <Ellipse x={w / 2} y={h / 2} radiusX={w / 2} radiusY={h / 2} {...common} />
  } else if (data.shape === 'triangle') {
    geom = <Line points={[w / 2, 0, w, h, 0, h]} closed lineJoin="round" {...common} />
  } else if (data.shape === 'line') {
    geom = (
      <Line
        points={[0, h / 2, w, h / 2]}
        stroke={stroke}
        strokeWidth={data.strokeWidth}
        lineCap="round"
        hitStrokeWidth={Math.max(16, data.strokeWidth)}
      />
    )
  } else {
    // rectangle / square
    geom = <Rect x={0} y={0} width={w} height={h} cornerRadius={data.cornerRadius} {...common} />
  }

  return (
    <Group {...interactiveProps(layer, props)} x={t.x} y={t.y} width={w} height={h}>
      {geom}
    </Group>
  )
}

function BorderNode(props: NodeProps): JSX.Element {
  const { layer, docWidth, docHeight } = props
  const data = layer.data as BorderLayerData
  // Borda externa = retângulo de contorno cobrindo a página (gutters de collage na Fase 9).
  return (
    <Rect
      id={layer.id}
      name="layer-node"
      listening={!layer.locked}
      x={data.thickness / 2}
      y={data.thickness / 2}
      width={docWidth - data.thickness}
      height={docHeight - data.thickness}
      stroke={data.color}
      strokeWidth={data.thickness}
      cornerRadius={data.cornerRadius}
      opacity={layer.opacity}
      onMouseDown={props.onSelect}
      onTap={props.onSelect}
    />
  )
}

export type { Konva }
